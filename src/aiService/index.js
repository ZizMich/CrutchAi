import Groq from "groq-sdk";

const groq = new Groq({ apiKey: "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" });



export async function AskHelper(prompt, language) {
  const resp = await groq.chat.completions.create({
    messages: [
      {
        role: "system", 
        content: "You are a language learning helper that briefly answers the question on the language of the promt that ansers on this language" + language,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
  });
  return resp.choices[0]?.message?.content || ""
}
