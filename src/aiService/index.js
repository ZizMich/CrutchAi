import Groq from "groq-sdk";

const groq = new Groq({ apiKey: "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" });



export async function AskHelper(prompt) {
  const resp = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a language learning helper that briefly answers the question on the language of the promt",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
  return resp.choices[0]?.message?.content || ""
}
