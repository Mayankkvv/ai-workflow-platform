import { generateCompletion } from "../../services/groqService.js";
import { renderTemplate } from "../renderTemplate.js";

const groqAI = async (node, input) => {
  const promptTemplate = node.data?.prompt || "";
  const model = node.data?.model;

  const finalPrompt = renderTemplate(promptTemplate, { input });

  const responseText = await generateCompletion(finalPrompt, model);

  return {
    prompt: finalPrompt,
    response: responseText,
  };
};

export default groqAI;