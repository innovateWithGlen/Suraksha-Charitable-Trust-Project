import { generateText, UIMessage } from "ai"
import { googleAI } from "@/lib/ai/google"
import { retrieveRelevantChunks } from "@/lib/rag/query"
import { buildAuthoritativeContext, TRUST_FACTS, TRUST_MISSION } from "@/lib/rag/trust-facts"

export const maxDuration = 30

const OUT_OF_SCOPE_REPLY =
  "I am Suraksha Sahayaka, the AI assistant for Suraksha Charitable Trust. I do not have that information in my current context. Please contact the trust office directly in Sirsi for accurate help."

function includesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

function canAttemptRag(question: string): boolean {
  const q = question.toLowerCase()
  return includesAny(q, [
    /80g|12a|12ab|pan|urn|registration|certificate|tax|trust|sirsi|location|address|initiative|program|event|donation|legal|mission|csr/,
    /own|founder|trustee|settlor|manage|team|member|board|head/,
  ])
}

function isDomainQuestion(question: string): boolean {
  const q = question.toLowerCase()
  return includesAny(q, [
    /suraksha|trust|sirsi|donat|80g|12a|12ab|urn|pan|tax|certificate|initiative|program|event|work|mission|legal|registration|csr|charitable|ngo|address|location/,
    /who\s+are\s+you|what\s+do\s+you\s+do|where\s+are\s+you|about\s+the\s+trust/,
    /own|founder|trustee|settlor|manage|team|member|board|head/,
  ])
}

function normalizeQuestion(question: string): string {
  let normalized = question;
  if (/\b80g\b/i.test(normalized)) {
    normalized += " tax deduction certificate form 10be eligibility";
  }
  return normalized;
}

function mappedFallbackAnswer(question: string): string | null {
  const q = question.toLowerCase()

  if (includesAny(q, [/\b80g\b/, /tax\s*deduction/, /section\s*80g/])) {
    return `Donations to ${TRUST_FACTS.trustName} are eligible for 50% tax deduction under Section 80G(5)(vi). Our 80G URN is ${TRUST_FACTS.urn80G}.`
  }

  if (includesAny(q, [/\bpan\b/])) {
    return `Our PAN is ${TRUST_FACTS.pan}.`
  }

  if (includesAny(q, [/\b12a\b/, /12ab/, /10ac/])) {
    return `Our 12A URN is ${TRUST_FACTS.urn12A}.`
  }

  if (includesAny(q, [/owner/, /owns/, /founder/, /settlor/])) {
    return `The settlor (founder) is ${TRUST_FACTS.settlor}.`
  }

  if (includesAny(q, [/trustee/, /board/, /manage/, /lead/])) {
    return `Board of Trustees: ${TRUST_FACTS.trustees.join(", ")}.`
  }

  if (includesAny(q, [/location/, /address/, /sirsi/, /where\s+are\s+you/])) {
    return `We are located at ${TRUST_FACTS.location}`
  }

  if (includesAny(q, [/mission/, /what\s+do\s+you\s+do/, /work/, /initiative/, /program/])) {
    return `${TRUST_MISSION} Current initiatives: ${TRUST_FACTS.initiatives.join(", ")}.`
  }

  return null
}

function conciseExtract(question: string, text: string): string {
  const terms = normalizeQuestion(question)
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)

  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)

  const ranked = sentences
    .map((sentence) => {
      const lower = sentence.toLowerCase()
      const score = terms.reduce((acc, term) => (lower.includes(term) ? acc + 1 : acc), 0)
      return { sentence: sentence.trim(), score }
    })
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.sentence || sentences[0] || text.slice(0, 200)
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")
  const question = typeof latestUserMessage?.content === "string" ? latestUserMessage.content : ""

  const normalizedQuestion = normalizeQuestion(question)
  
  if (!isDomainQuestion(normalizedQuestion)) {
    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }

  // Retrieve top 8 chunks instead of 5 to ensure we don't miss lists/tables
  const retrieved = normalizedQuestion ? await retrieveRelevantChunks(normalizedQuestion, 8) : []

  const filtered = retrieved.filter((item) => item.score > 0.10)
  const selected = (filtered.length ? filtered : retrieved).slice(0, 6)

  if (!canAttemptRag(normalizedQuestion) && filtered.length === 0) {
    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }

  const context = selected
    .map((item, index) => `[Source ${index + 1}: ${item.title}]\n${item.text}`)
    .join("\n\n")

  const authoritativeContext = buildAuthoritativeContext()
  const finalContext = [authoritativeContext, context].filter(Boolean).join("\n\n---\n\n")

  try {
    const result = await generateText({
      model: googleAI("gemini-2.0-flash-lite"),
      maxRetries: 0,
      system: `You are "Suraksha Sahayaka," the official AI Assistant for Suraksha Charitable Trust based in Sirsi, Karnataka.

Your goal is to provide accurate information about our legal status, registration, mission, founders, and initiatives.

CRITICAL INSTRUCTIONS:
1. Map Vocabulary: If asked "who owns", "who founded", or "who leads" the organization, look for and provide the names of the "Settlor" and "Trustees". 
2. Use ONLY the provided CONTEXT. Do not hallucinate names, numbers, or facts.
3. Be conversational, helpful, and professional. 
4. If asked about 80G, explain that donations are eligible for a 50% tax deduction under Section 80G(5)(vi).
5. If the specific answer is not in the context, say: "I do not have that exact information in my current documents. Please contact the trust office directly in Sirsi for accurate help."

CONTEXT DATA:
${finalContext || "No matching context retrieved."}`,
      messages: messages.map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : (m.parts || []).map((p: any) => (p.type === "text" ? p.text : "")).join(""),
      })),
      abortSignal: req.signal,
    })

    return Response.json({ text: result.text })
  } catch (error) {
    console.error("Chat model unavailable:", error)

    const mapped = mappedFallbackAnswer(normalizedQuestion)
    if (mapped) {
      return Response.json({ text: mapped })
    }

    if (selected.length > 0) {
      const extracted = selected
        .slice(0, 2)
        .map((item) => conciseExtract(normalizedQuestion, item.text))
        .filter(Boolean)
        .join(" ")

      if (extracted) {
        return Response.json({ text: extracted })
      }
    }

    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }
}
