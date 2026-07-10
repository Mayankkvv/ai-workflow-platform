const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const generateCompletion = async (prompt, model) => {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: model || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};