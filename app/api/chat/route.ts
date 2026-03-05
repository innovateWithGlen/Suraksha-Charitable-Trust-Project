import {
  generateText,
  UIMessage,
} from "ai"
import { openai } from "@ai-sdk/openai"
import { retrieveRelevantChunks } from "@/lib/rag/query"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")

  const question =
    typeof latestUserMessage?.content === "string"
      ? latestUserMessage.content
      : ""

  const retrieved = question
    ? await retrieveRelevantChunks(question, 5)
    : []

  const context = retrieved
    .filter((item) => item.score > 0.35)
    .map(
      (item, index) =>
        `[Source ${index + 1}: ${item.title}]\n${item.text}`
    )
    .join("\n\n")

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    system: `You are the Suraksha Trust assistant.

You must answer using ONLY the provided CONTEXT.
If the answer is not present in CONTEXT, reply exactly:
"I don't have information about that in our documents. Please contact us directly."

Do not use outside/general knowledge.
Do not infer facts not explicitly in context.
Keep answers concise and donor-friendly.

CONTEXT:
${context || "No matching context retrieved."}`,
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
}
