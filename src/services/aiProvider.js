const { generateExplanation } = require("./explanation");

function aiExplain(student, scholarship, reasons) {
  const provider = process.env.AI_PROVIDER || "mock";
  if (provider === "mock") return generateExplanation(student, scholarship, reasons);

  // later: real LLM implementation
  // throw new Error("AI_PROVIDER not implemented");
  return generateExplanation(student, scholarship, reasons);
}

module.exports = { aiExplain };
