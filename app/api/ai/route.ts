import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

type AIAction =
  | "rephrase"
  | "summarise"
  | "fix_grammar"
  | "make_shorter"
  | "make_longer"
  | "continue"
  | "tone_formal"
  | "tone_casual";

const SYSTEM_PROMPTS: Record<AIAction, string> = {
  rephrase:
    "Rephrase the given text. Keep the same meaning but vary the wording and sentence structure. Return only the rephrased text, no explanation.",
  summarise:
    "Summarise the given text into a concise version. Return only the summary, no explanation.",
  fix_grammar:
    "Fix all grammar, spelling, and punctuation errors in the given text. Return only the corrected text, no explanation.",
  make_shorter:
    "Shorten the given text while preserving its core meaning. Return only the shortened text, no explanation.",
  make_longer:
    "Expand the given text with more detail, context, and depth. Return only the expanded text, no explanation.",
  continue:
    "Continue writing from where the given text ends. Match the existing style and tone closely. Return only the continuation, no explanation.",
  tone_formal:
    "Rewrite the given text in a formal, professional tone. Return only the rewritten text, no explanation.",
  tone_casual:
    "Rewrite the given text in a casual, conversational tone. Return only the rewritten text, no explanation.",
};

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    action: AIAction;
    selectedText: string;
    context?: string;
  };

  const { action, selectedText, context } = body;

  if (!action || !selectedText?.trim()) {
    return NextResponse.json({ error: "Missing action or selectedText" }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[action];
  if (!systemPrompt) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const userMessage = context?.trim()
    ? `Context (text before the selection):\n${context}\n\nText to process:\n${selectedText}`
    : selectedText;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const result =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  return NextResponse.json({ result });
}
