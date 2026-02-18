//POST create + GET matches
const express = require("express");
const { z } = require("zod");
const { db } = require("../db");
const { aiExplain } = require("../services/aiProvider");

const router = express.Router();
const { matchesScholarship, buildReasons } = require("../services/matching");
const { generateExplanation } = require("../services/explanation");

const StudentCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  gpa: z.number().min(0).max(4).optional(),
  major: z.string().optional(),
  enrollment_status: z.string().min(1),

  citizenship_status: z.string().optional(),
  financial_need: z.boolean().optional(),
  first_generation: z.boolean().optional(),
  gender: z.string().optional(),
  residency: z.string().optional(),
  community_service_hours: z.number().int().min(0).optional(),
  military_affiliation: z.string().optional(),
  ethnicity: z.array(z.string()).optional()
});

function toBoolInt(v) {
  if (v === true) return 1;
  if (v === false) return 0;
  return null;
}

function makeId() {
  return `stu_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

router.post("/", (req, res) => {
  const parsed = StudentCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const s = parsed.data;
  const now = new Date().toISOString();

  const id = s.id ?? makeId();

  try {
    db.prepare(`
      INSERT INTO students (
        id, name, email, gpa, major, enrollment_status,
        citizenship_status, financial_need, first_generation, gender, residency,
        community_service_hours, military_affiliation, ethnicity_json,
        created_at, updated_at
      ) VALUES (
        @id, @name, @email, @gpa, @major, @enrollment_status,
        @citizenship_status, @financial_need, @first_generation, @gender, @residency,
        @community_service_hours, @military_affiliation, @ethnicity_json,
        @created_at, @updated_at
      )
    `).run({
      id,
      name: s.name,
      email: s.email,
      gpa: s.gpa ?? null,
      major: s.major ?? null,
      enrollment_status: s.enrollment_status,
      citizenship_status: s.citizenship_status ?? null,
      financial_need: toBoolInt(s.financial_need),
      first_generation: toBoolInt(s.first_generation),
      gender: s.gender ?? null,
      residency: s.residency ?? null,
      community_service_hours: s.community_service_hours ?? null,
      military_affiliation: s.military_affiliation ?? null,
      ethnicity_json: JSON.stringify(s.ethnicity ?? []),
      created_at: now,
      updated_at: now
    });

    //return res.status(201).json({ id });
        const created = db.prepare(`
      SELECT id, name, email, created_at
      FROM students
      WHERE id = ?
    `).get(id);

    return res.status(201).json(created);
  } catch (e) {
    // common: unique email constraint
    return res.status(400).json({ error: e.message });
  }
});
router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT
      id, name, email, gpa, major, enrollment_status, citizenship_status, created_at
    FROM students
    ORDER BY datetime(created_at) DESC
    LIMIT 50
  `).all();

  res.json({ students: rows });
});
router.get("/:id/matches", (req, res) => {
  const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const scholarships = db.prepare(`
    SELECT
      id, name, provider, amount, amount_type, deadline, url, description,
      gpa_minimum, first_generation, financial_need, gender, residency, community_service_hours
    FROM scholarships
  `).all();

  const getEnroll = db.prepare(`SELECT enrollment_status FROM scholarship_allowed_enrollment WHERE scholarship_id = ?`);
  const getCit = db.prepare(`SELECT citizenship_status FROM scholarship_allowed_citizenship WHERE scholarship_id = ?`);
  const getFields = db.prepare(`SELECT field FROM scholarship_fields_of_study WHERE scholarship_id = ?`);
  const getEth = db.prepare(`SELECT ethnicity FROM scholarship_allowed_ethnicity WHERE scholarship_id = ?`);
  const getMil = db.prepare(`SELECT affiliation FROM scholarship_allowed_military_affiliation WHERE scholarship_id = ?`);

  const matches = [];
  for (const sch of scholarships) {
    const schLists = {
      enrollment: getEnroll.all(sch.id).map(r => r.enrollment_status),
      citizenship: getCit.all(sch.id).map(r => r.citizenship_status),
      fields: getFields.all(sch.id).map(r => r.field),
      ethnicity: getEth.all(sch.id).map(r => r.ethnicity),
      military: getMil.all(sch.id).map(r => r.affiliation),
    };

    if (matchesScholarship(student, sch, schLists)) {
      const reasons = buildReasons(student, sch, schLists);
      matches.push({
        scholarship_id: sch.id,
        name: sch.name,
        provider: sch.provider,
        amount: sch.amount,
        deadline: sch.deadline,
        reasons
      });
    }
  }

  matches.sort((a, b) => (b.amount - a.amount) || String(a.deadline).localeCompare(String(b.deadline)));

  const top = matches[0] || null;
  const topScholarship = top ? scholarships.find(s => s.id === top.scholarship_id) : null;

  /*const explanation = topScholarship
    ? generateExplanation(student, topScholarship, top.reasons)
    : null;*/
    const explanation = topScholarship ? aiExplain(student, topScholarship, top.reasons) : null;

  res.json({
      student: {
    id: student.id,
    name: student.name,
    email: student.email,
    created_at: student.created_at
  },
    match_count: matches.length,
    matches,
    top_match_explanation: explanation
  });
});

module.exports = router;

