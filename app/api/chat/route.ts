import {
  generateText,
  UIMessage,
} from "ai"
import { googleAI } from "@/lib/ai/google"
import { retrieveRelevantChunks } from "@/lib/rag/query"
import { buildAuthoritativeContext, TRUST_FACTS, TRUST_MISSION } from "@/lib/rag/trust-facts"

export const maxDuration = 30

const OUT_OF_SCOPE_REPLY =
  "I am Suraksha Sahayaka, the AI assistant for Suraksha Charitable Trust. I do not have that information in my current context. Please contact the trust office directly in Sirsi for accurate help."

function includesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

function getMappedAnswer(question: string): string | null {
  const q = question.toLowerCase()
  const asks80GCertificateTimeline =
    includesAny(q, [/\b80g\b/, /certificate/, /receipt/, /10be/]) &&
    includesAny(q, [/(how\s+many\s+day|how\s+long|when|receive|recive|get|arrive|delivery|time)/])
  const asks80G = includesAny(q, [/\b80g\b/, /tax\s*(exempt|deduct|deduction)/, /section\s*80g/])
  const asksLocation = includesAny(q, [/where\s+are\s+you/, /location/, /address/, /sirsi/])
  const asksWork = includesAny(q, [/what\s*(kind\s*of\s*)?work/, /initiative/, /program/, /event/, /what\s+do\s+you\s+do/])
  const asksPan = includesAny(q, [/\bpan\b/])
  const asks12A = includesAny(q, [/\b12a\b/, /12ab/])
  const asks80GUrn = includesAny(q, [/80g\s*urn/, /urn.*80g/, /registration.*80g/])
  const asksValidity = includesAny(q, [/validity/, /assessment\s+year/, /valid\s+till/, /valid\s+from/])
  const asksIdentity = includesAny(q, [/trust\s+name/, /who\s+are\s+you/, /legal\s+status/, /registered/])

  if (asks80GCertificateTimeline) {
    return `You will usually receive your 80G certificate shortly after successful payment, because our system auto-generates it and sends it by email. If it does not arrive, please contact the trust office in Sirsi and we will resend it promptly.`
  }

  if (asks80G) {
    return `Yes. Donations to ${TRUST_FACTS.trustName} are eligible for tax deduction under Section 80G(5)(vi), so your contribution has even more impact. Our 80G URN is ${TRUST_FACTS.urn80G}.`
  }

  if (asksLocation) {
    return `We are based in Sirsi, Karnataka. You can find us at ${TRUST_FACTS.location}`
  }

  if (asksWork) {
    return `We focus on community upliftment in Sirsi. Our current initiatives are ${TRUST_FACTS.initiatives.join(", ")}.`
  }

  if (asksPan && asks12A) {
    return `Our PAN is ${TRUST_FACTS.pan} and our 12A URN is ${TRUST_FACTS.urn12A}.`
  }

  if (asksPan) {
    return `Our PAN is ${TRUST_FACTS.pan}.`
  }

  if (asks12A) {
    return `Our 12A URN is ${TRUST_FACTS.urn12A}.`
  }

  if (asks80GUrn) {
    return `Our 80G URN is ${TRUST_FACTS.urn80G}.`
  }

  if (asksValidity) {
    return `Our current approval validity is ${TRUST_FACTS.validity}`
  }

  if (asksIdentity) {
    return `${TRUST_FACTS.trustName} is a registered charitable trust based in Sirsi, Karnataka. ${TRUST_MISSION}`
  }

  return null
}

function canAttemptRag(question: string): boolean {
  const q = question.toLowerCase()
  return includesAny(q, [
    /80g|12a|12ab|pan|urn|registration|certificate|tax|trust|sirsi|location|address|initiative|program|event|donation|legal|mission|csr/,
  ])
}

function isDomainQuestion(question: string): boolean {
  const q = question.toLowerCase()
  return includesAny(q, [
    /suraksha|trust|sirsi|donat|80g|12a|12ab|urn|pan|tax|certificate|initiative|program|event|work|mission|legal|registration|csr|charitable|ngo|address|location/,
    /who\s+are\s+you|what\s+do\s+you\s+do|where\s+are\s+you|about\s+the\s+trust/,
  ])
}

function normalizeQuestion(question: string): string {
  if (/\b80g\b/i.test(question)) {
    return `${question} tax deduction certificate form 10be eligibility`
  }
  return question
}

function conciseExtract(question: string, text: string): string {
  const terms = normalizeQuestion(question)
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)

  const ranked = sentences
    .map((sentence) => {
      const s = sentence.toLowerCase()
      const score = terms.reduce((acc, term) => (s.includes(term) ? acc + 1 : acc), 0)
      return { sentence: sentence.trim(), score }
    })
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.sentence || sentences[0] || text.slice(0, 200)
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")

  const question =
    typeof latestUserMessage?.content === "string"
      ? latestUserMessage.content
      : ""

  const normalizedQuestion = normalizeQuestion(question)
  if (!isDomainQuestion(normalizedQuestion)) {
    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }

  const mappedAnswer = getMappedAnswer(normalizedQuestion)
  if (mappedAnswer) {
    return Response.json({ text: mappedAnswer })
  }

  const retrieved = normalizedQuestion
    ? await retrieveRelevantChunks(normalizedQuestion, 6)
    : []

  const filtered = retrieved.filter((item) => item.score > 0.12)
  const selected = (filtered.length ? filtered : retrieved).slice(0, 4)

  if (!canAttemptRag(normalizedQuestion) && filtered.length === 0) {
    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }

  const context = selected
    .map(
      (item, index) =>
        `[Source ${index + 1}: ${item.title}]\n${item.text}`
    )
    .join("\n\n")

  if (!context && !canAttemptRag(normalizedQuestion)) {
    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }

  const authoritativeContext = buildAuthoritativeContext()
  const finalContext = [authoritativeContext, context].filter(Boolean).join("\n\n")

  try {
    const result = await generateText({
      model: googleAI("gemini-2.0-flash-lite"),
      system: `You are "Suraksha Sahayaka," the official AI Assistant for Suraksha Charitable Trust in Sirsi.

Your goal is to provide accurate information about legal status, registration, mission, and current initiatives in a helpful, professional, transparent, and community-focused way.

Use ONLY the provided CONTEXT and OFFICIAL FACTS.
Do not hallucinate, do not guess, and do not invent registration numbers, events, or facts.

Behavior rules:
1) Be conversational and answer only the specific question asked.
2) Do not dump certificate text.
3) If asked about 80G benefit, explain tax-deductible donation impact under Section 80G(5)(vi).
4) If asked for URN/PAN, return exact alphanumeric codes.
5) If asked about trust work/events, mention current initiatives clearly.
6) If information is not in context, reply exactly:
"I am Suraksha Sahayaka, the AI assistant for Suraksha Charitable Trust. I do not have that information in my current context. Please contact the trust office directly in Sirsi for accurate help."

Be precise: answer the question first in 1-2 lines, then optionally add one short supporting line.
Do not paste long source text or legal document blocks.

CONTEXT:
${finalContext || "No matching context retrieved."}`,
      messages: messages.map((m) => ({
        role: m.role,
        content:
          typeof m.content === "string"
            ? m.content
            : (m.parts || [])
                .map((p: any) => (p.type === "text" ? p.text : ""))
                .join(""),
      })),
      abortSignal: req.signal,
    })

    return Response.json({ text: result.text })
  } catch (error) {
    console.error("Chat model unavailable, serving fallback response:", error)

    if (!context) {
      return Response.json({
        text: OUT_OF_SCOPE_REPLY,
      })
    }

    const fallbackText = selected
      .slice(0, 2)
      .map((item) => conciseExtract(normalizedQuestion, item.text))
      .filter(Boolean)
      .join(" ")

    return Response.json({
      text: fallbackText || OUT_OF_SCOPE_REPLY,
    })
  }
}
