function formatMoney(n) {
  if (typeof n !== "number") return `$${n}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function generateExplanation(student, sch, reasons) {
  const s1 = `The ${sch.name} is a strong match for you.`;
  const key = reasons.slice(0, 2).join("; ");
  const s2 = key ? `Why: ${key}.` : `You meet the core eligibility criteria based on your profile.`;
  const deadline = sch.deadline ? `before ${sch.deadline}` : `before the deadline`;
  const s3 = `It offers ${formatMoney(sch.amount)} from ${sch.provider}, so it’s worth applying ${deadline}.`;
  return `${s1} ${s2} ${s3}`;
}

module.exports = { generateExplanation };
