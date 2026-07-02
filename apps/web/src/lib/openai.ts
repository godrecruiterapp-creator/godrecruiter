import OpenAI from 'openai'

// ponytail: pick a specific model here rather than a config table — change this
// one constant if you want a different OpenAI model.
export const OPENAI_MODEL = 'gpt-4o'

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

/** Turns an OpenAI API error into a message safe to show a recruiter — never a raw stack trace. */
export function friendlyOpenAIError(err: unknown): string {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 429) return "OpenAI rate limit or quota reached. Check your OpenAI account's billing/usage and try again."
    if (err.status === 401) return 'OpenAI rejected the API key. Check OPENAI_API_KEY is correct.'
    return `OpenAI request failed: ${err.message}`
  }
  return 'AI request failed unexpectedly. Try again in a moment.'
}
