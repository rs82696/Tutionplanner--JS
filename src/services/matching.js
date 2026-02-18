function isBoolTrue(val) {
  return val === 1 || val === true;
}

function parseJsonArray(s) {
  if (!s) return [];
  try { return JSON.parse(s); } catch { return []; }
}

// schLists = { enrollment:[], citizenship:[], fields:[], ethnicity:[], military:[] }
function matchesScholarship(student, sch, schLists) {
  // GPA
  if (sch.gpa_minimum != null) {
    if (student.gpa == null) return false;
    if (Number(student.gpa) < Number(sch.gpa_minimum)) return false;
  }

  // Enrollment
  if (schLists.enrollment.length) {
    if (!schLists.enrollment.includes(student.enrollment_status)) return false;
  }

  // Citizenship
  if (schLists.citizenship.length) {
    if (!student.citizenship_status) return false;
    if (!schLists.citizenship.includes(student.citizenship_status)) return false;
  }

  // Fields of study (empty => open)
  if (schLists.fields.length) {
    if (!student.major) return false;
    if (!schLists.fields.includes(student.major)) return false;
  }

  // Boolean requirements
  if (sch.first_generation != null) {
    if (isBoolTrue(sch.first_generation) && !isBoolTrue(student.first_generation)) return false;
  }
  if (sch.financial_need != null) {
    if (isBoolTrue(sch.financial_need) && !isBoolTrue(student.financial_need)) return false;
  }

  // Gender
  if (sch.gender) {
    if (!student.gender || student.gender !== sch.gender) return false;
  }

  // Residency
  if (sch.residency) {
    if (!student.residency || student.residency !== sch.residency) return false;
  }

  // Community service hours
  if (sch.community_service_hours != null) {
    const hours = Number(student.community_service_hours ?? 0);
    if (hours < Number(sch.community_service_hours)) return false;
  }

  // Ethnicity any-of
  if (schLists.ethnicity.length) {
    const studentEth = parseJsonArray(student.ethnicity_json);
    const ok = studentEth.some(e => schLists.ethnicity.includes(e));
    if (!ok) return false;
  }

  // Military affiliation
  if (schLists.military.length) {
    if (!student.military_affiliation) return false;
    if (!schLists.military.includes(student.military_affiliation)) return false;
  }

  return true;
}

function buildReasons(student, sch, schLists) {
  const reasons = [];

  if (sch.gpa_minimum != null && student.gpa != null) {
    reasons.push(`GPA ${student.gpa} meets minimum ${sch.gpa_minimum}`);
  }
  if (schLists.fields.length && student.major) {
    reasons.push(`Major matches eligible fields (${student.major})`);
  }
  if (schLists.enrollment.length) {
    reasons.push(`Enrollment status eligible (${student.enrollment_status})`);
  }
  if (schLists.citizenship.length && student.citizenship_status) {
    reasons.push(`Citizenship eligible (${student.citizenship_status})`);
  }
  if (sch.first_generation != null && isBoolTrue(sch.first_generation)) {
    reasons.push(`First-generation requirement satisfied`);
  }
  if (sch.financial_need != null && isBoolTrue(sch.financial_need)) {
    reasons.push(`Financial-need requirement satisfied`);
  }
  if (sch.gender) reasons.push(`Gender requirement satisfied (${sch.gender})`);
  if (sch.residency) reasons.push(`Residency requirement satisfied (${sch.residency})`);
  if (sch.community_service_hours != null) {
    reasons.push(`Community service hours meet requirement (${student.community_service_hours ?? 0}+ hrs)`);
  }
  if (schLists.ethnicity.length) reasons.push(`Ethnicity requirement satisfied`);
  if (schLists.military.length) reasons.push(`Military affiliation requirement satisfied`);

  return reasons;
}

module.exports = { matchesScholarship, buildReasons };
