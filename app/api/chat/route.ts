import { generateText, UIMessage } from "ai"
import { googleAI } from "@/lib/ai/google"
import { retrieveRelevantChunks } from "@/lib/rag/query"
import { buildAuthoritativeContext, TRUST_FACTS } from "@/lib/rag/trust-facts"

export const maxDuration = 30

const OUT_OF_SCOPE_REPLY =
  "I am Suraksha Sahayaka, the AI assistant for Suraksha Charitable Trust. I do not have that information in my current context. Please contact the trust office directly in Sirsi for accurate help."

function includesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

function canAttemptRag(question: string): boolean {
  const q = question.toLowerCase()
  return includesAny(q, [
    /80g|12a|12ab|pan|urn|registration|certificate|tax|trust|sirsi|location|address|initiative|program|event|donation|legal|mission|csr|contact|email|phone|bank|ifsc|upi|account|form\s*10be|funding|support|started|establish|founded|formed|created|age|old/,
    /own|founder|trustee|settlor|manage|team|member|board|head|run|runs|running|lead|behind|operate|control/,
  ])
}

function isDomainQuestion(question: string): boolean {
  const q = question.toLowerCase()
  return includesAny(q, [
    /suraksha|trust|sirsi|donat|80g|12a|12ab|urn|pan|tax|certificate|initiative|program|event|work|mission|legal|registration|csr|charitable|ngo|address|location|contact|email|phone|bank|ifsc|upi|account|form\s*10be|funding|support|started|establish|founded|formed|created|age|old|organization|organisation/,
    /who\s+are\s+you|what\s+do\s+you\s+do|where\s+are\s+you|about\s+the\s+trust/,
    /own|founder|trustee|settlor|manage|team|member|board|head|run|runs|running|lead|behind|operate|control/,
  ])
}

function normalizeQuestion(question: string): string {
  let normalized = question;
  if (/\b80g\b/i.test(normalized)) {
    normalized += " tax deduction certificate form 10be eligibility";
  }
  return normalized;
}

function getMessageText(message?: UIMessage): string {
  const content = (message as UIMessage & { content?: unknown })?.content
  if (typeof content === "string") return content

  if (!message?.parts?.length) return ""

  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
}

function calculateTrustAge(): string {
  const founded = new Date(TRUST_FACTS.foundedDate)
  const today = new Date()

  let years = today.getFullYear() - founded.getFullYear()
  const hasNotReachedAnniversary =
    today.getMonth() < founded.getMonth() ||
    (today.getMonth() === founded.getMonth() && today.getDate() < founded.getDate())

  if (hasNotReachedAnniversary) {
    years -= 1
  }

  if (years <= 0) {
    return `${TRUST_FACTS.trustName} was founded on ${TRUST_FACTS.foundedDate} and is less than 1 year old.`
  }

  return `${TRUST_FACTS.trustName} was founded on ${TRUST_FACTS.foundedDate} and is ${years} year${years === 1 ? "" : "s"} old.`
}

function authoritativeFallbackAnswer(question: string): string | null {
  const q = question.toLowerCase()

  if (includesAny(q, [/\b80g\b/, /tax\s*exempt/, /tax\s*deduction/, /section\s*80g/, /10be/])) {
    return `Donations to ${TRUST_FACTS.trustName} are eligible for a 50% tax deduction under Section 80G. The 80G URN is ${TRUST_FACTS.urn80G}. ${TRUST_FACTS.donationProofRequirement}`
  }

  if (includesAny(q, [/\b12a\b/, /12ab/, /10ac/, /urn/, /registration/])) {
    return `The trust's 12A registration URN is ${TRUST_FACTS.urn12A}. Its PAN is ${TRUST_FACTS.pan}, and its 80G URN is ${TRUST_FACTS.urn80G}.`
  }

  if (includesAny(q, [/\bpan\b/])) {
    return `The PAN of ${TRUST_FACTS.trustName} is ${TRUST_FACTS.pan}.`
  }

  if (includesAny(q, [/how\s+old/, /\bage\b/, /how\s+long/, /years?\s+old/, /how\s+many\s+years/, /when\s+was.*(started|founded|formed|created|established)/, /when\s+did.*(start|begin|form|establish)/, /since\s+when/])) {
    return calculateTrustAge()
  }

  if (includesAny(q, [/own/, /owner/, /founder/, /settlor/, /who\s+runs/, /who\s+leads/, /who\s+manages/, /manage/, /trustee/, /board/, /who\s+is\s+behind/, /running\s+this/, /operat/, /control/])) {
    return `The trust was founded by ${TRUST_FACTS.settlor}. It is run by the Board of Trustees: ${TRUST_FACTS.trustees.join(", ")}.`
  }

  if (includesAny(q, [/contact/, /email/, /phone/, /call/, /reach/, /address/])) {
    return `You can contact ${TRUST_FACTS.trustName} at ${TRUST_FACTS.supportEmail} or ${TRUST_FACTS.supportPhone} (${TRUST_FACTS.supportHours}). Office address: ${TRUST_FACTS.location}`
  }

  if (includesAny(q, [/donat/, /bank/, /ifsc/, /upi/, /account/])) {
    return `You can donate to ${TRUST_FACTS.trustName} via Account Name: ${TRUST_FACTS.bankDetails.accountName}, Bank: ${TRUST_FACTS.bankDetails.bankName}, Account Number: ${TRUST_FACTS.bankDetails.accountNumber}, IFSC: ${TRUST_FACTS.bankDetails.ifscCode}, UPI: ${TRUST_FACTS.bankDetails.upiId}. ${TRUST_FACTS.donationProofRequirement}`
  }

  if (includesAny(q, [/csr/, /corporate/, /partnership/])) {
    return `The trust is CSR registered under ${TRUST_FACTS.csrRegistrationNumber}. For CSR partnerships, email Mr. Rajesh Hegde at ${TRUST_FACTS.supportEmail} with subject \"CSR Partnership Inquiry\" and include company name, CSR goals, and budget. Response time is within 2 business days.`
  }

  if (includesAny(q, [/initiative/, /program/, /funding/, /support/])) {
    const topInitiatives = TRUST_FACTS.initiatives
      .slice(0, 3)
      .map((initiative) => `${initiative.name}: ${initiative.summary} Funding needed: ${initiative.fundingNeed}`)
      .join(" ")
    return `Current initiatives needing support: ${topInitiatives}`
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

function contextualFallbackFromChunks(question: string, chunks: Array<{ text: string }>): string {
  const terms = normalizeQuestion(question)
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)

  const scoredSentences = chunks
    .flatMap((chunk) =>
      chunk.text
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean)
    )
    .map((sentence) => {
      const lower = sentence.toLowerCase()
      const score = terms.reduce((acc, term) => (lower.includes(term) ? acc + 1 : acc), 0)
      return { sentence: sentence.trim(), score }
    })
    .sort((a, b) => b.score - a.score)

  const picked: string[] = []
  for (const item of scoredSentences) {
    if (!item.sentence) continue
    if (picked.includes(item.sentence)) continue
    picked.push(item.sentence)
    if (picked.length >= 2) break
  }

  if (picked.length) return picked.join(" ")
  return chunks[0]?.text?.slice(0, 260) || OUT_OF_SCOPE_REPLY
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")
  const question = getMessageText(latestUserMessage)

  const normalizedQuestion = normalizeQuestion(question)

  const deterministicAnswer = authoritativeFallbackAnswer(normalizedQuestion)
  if (deterministicAnswer) {
    return Response.json({ text: deterministicAnswer })
  }
  
  if (!isDomainQuestion(normalizedQuestion)) {
    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }

  let retrieved: Awaited<ReturnType<typeof retrieveRelevantChunks>> = []
  try {
    // Retrieve top 8 chunks instead of 5 to ensure we don't miss lists/tables
    retrieved = normalizedQuestion ? await retrieveRelevantChunks(normalizedQuestion, 8) : []
  } catch (error) {
    console.error("RAG retrieval failed:", error)
    const fallback = authoritativeFallbackAnswer(normalizedQuestion)
    if (fallback) {
      return Response.json({ text: fallback })
    }
  }

  const filtered = retrieved.filter((item) => item.score > 0.10)
  const selected = (filtered.length ? filtered : retrieved).slice(0, 8)

  if (!canAttemptRag(normalizedQuestion) && filtered.length === 0) {
    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }

  const context = selected
    .map((item, index) => `[Source ${index + 1}: ${item.title}]\n${item.text}`)
    .join("\n\n")

  const authoritativeContext = buildAuthoritativeContext()
  const finalContext = [authoritativeContext, context].filter(Boolean).join("\n\n---\n\n")

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  try {
    const result = await generateText({
      model: googleAI("gemini-2.5-flash"),
      temperature: 0.1,
      topP: 0.95,
      maxRetries: 0,
      system: `You are "Suraksha Sahayaka," the official AI Assistant for Suraksha Charitable Trust based in Sirsi, Karnataka.

Your goal is to provide accurate information about our legal status, registration, mission, founders, and initiatives.

CRITICAL INSTRUCTIONS:
1. Time Awareness: Today's date is ${currentDate}. The trust was founded on ${TRUST_FACTS.foundedDate}. If asked about the trust's age or how long it has been operating, calculate it using these two dates and answer precisely.
2. CSR Queries: If a corporate company asks how to contribute via CSR, state that the trust is registered (${TRUST_FACTS.csrRegistrationNumber}) and eligible to receive CSR funds, then instruct them to email Mr. Rajesh Hegde directly at ${TRUST_FACTS.supportEmail} for partnership details with subject "CSR Partnership Inquiry" and include company name, CSR goals, and budget. Mention response time: within 2 business days.
3. Map Vocabulary: If asked "who owns", "who founded", or "who leads" the organization, provide the names of the "Settlor" and "Trustees" from the context.
4. Contact & Donation Queries: For email/phone/address, bank details (account, IFSC, UPI), and Form 10BE requirements, answer using the exact values from context.
5. Initiative Funding Queries: When asked about initiatives needing support, provide 2-3 active initiatives with a brief summary and what funding is needed.
6. Do not dump certificate text. Answer the question first in 1-2 concise lines in natural language.
7. Use ONLY the provided CONTEXT. Do not hallucinate names, numbers, or facts.
8. Be conversational, helpful, and professional.
9. If the specific answer is not in the context, say: "I do not have that exact information in my current documents. Please contact the trust office directly in Sirsi for accurate help."

CONTEXT DATA:
${finalContext || "No matching context retrieved."}`,
      messages: messages.map((m) => ({
        role: m.role,
        content: getMessageText(m),
      })),
      abortSignal: req.signal,
    })

    return Response.json({ text: result.text })
  } catch (error) {
    console.error("Chat model unavailable:", error)

    const authoritative = authoritativeFallbackAnswer(normalizedQuestion)
    if (authoritative) {
      return Response.json({ text: authoritative })
    }

    if (selected.length > 0) {
      const extracted = contextualFallbackFromChunks(normalizedQuestion, selected)

      if (extracted) {
        return Response.json({ text: extracted })
      }
    }

    return Response.json({ text: OUT_OF_SCOPE_REPLY })
  }
}
