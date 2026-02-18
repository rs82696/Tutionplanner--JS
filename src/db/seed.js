require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { db, initDb } = require("./index");

function asBoolInt(v) {
  if (v === true) return 1;
  if (v === false) return 0;
  return null;
}

function asJson(v) {
  return v == null ? null : JSON.stringify(v);
}

function seed() {
  initDb();

  const filePath = path.join(process.cwd(), "data", "scholarships.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  const scholarships = parsed.scholarships || [];

  const now = new Date().toISOString();

  db.exec(`
    DELETE FROM scholarship_allowed_military_affiliation;
    DELETE FROM scholarship_allowed_ethnicity;
    DELETE FROM scholarship_fields_of_study;
    DELETE FROM scholarship_allowed_citizenship;
    DELETE FROM scholarship_allowed_enrollment;
    DELETE FROM scholarships;
  `);

  const insertScholarship = db.prepare(`
    INSERT INTO scholarships (
      id, name, provider, amount, amount_type, deadline, url, description,
      gpa_minimum, first_generation, financial_need, gender, residency, community_service_hours,
      renewable, renewable_conditions,
      application_requirements_json, tags_json,
      created_at
    ) VALUES (
      @id, @name, @provider, @amount, @amount_type, @deadline, @url, @description,
      @gpa_minimum, @first_generation, @financial_need, @gender, @residency, @community_service_hours,
      @renewable, @renewable_conditions,
      @application_requirements_json, @tags_json,
      @created_at
    )
  `);

  const insEnroll = db.prepare(`
    INSERT INTO scholarship_allowed_enrollment (scholarship_id, enrollment_status)
    VALUES (?, ?)
  `);

  const insCit = db.prepare(`
    INSERT INTO scholarship_allowed_citizenship (scholarship_id, citizenship_status)
    VALUES (?, ?)
  `);

  const insField = db.prepare(`
    INSERT INTO scholarship_fields_of_study (scholarship_id, field)
    VALUES (?, ?)
  `);

  const insEth = db.prepare(`
    INSERT INTO scholarship_allowed_ethnicity (scholarship_id, ethnicity)
    VALUES (?, ?)
  `);

  const insMil = db.prepare(`
    INSERT INTO scholarship_allowed_military_affiliation (scholarship_id, affiliation)
    VALUES (?, ?)
  `);

  const tx = db.transaction(() => {
    for (const s of scholarships) {
      const elig = s.eligibility || {};

      insertScholarship.run({
        id: s.id,
        name: s.name,
        provider: s.provider,
        amount: s.amount,
        amount_type: s.amount_type ?? null,
        deadline: s.deadline ?? null,
        url: s.url ?? null,
        description: s.description ?? null,

        gpa_minimum: elig.gpa_minimum ?? null,
        first_generation: asBoolInt(elig.first_generation),
        financial_need: asBoolInt(elig.financial_need),
        gender: elig.gender ?? null,
        residency: elig.residency ?? null,
        community_service_hours: elig.community_service_hours ?? null,

        renewable: asBoolInt(s.renewable) ?? 0,
        renewable_conditions: s.renewable_conditions ?? null,

        application_requirements_json: asJson(s.application_requirements || []),
        tags_json: asJson(s.tags || []),

        created_at: now,
      });

      for (const e of (elig.enrollment_status || [])) insEnroll.run(s.id, e);
      for (const c of (elig.citizenship || [])) insCit.run(s.id, c);
      for (const f of (s.fields_of_study || [])) insField.run(s.id, f);
      for (const eth of (elig.ethnicity || [])) insEth.run(s.id, eth);
      for (const m of (elig.military_affiliation || [])) insMil.run(s.id, m);
    }
  });

  tx();

  const count = db.prepare(`SELECT COUNT(*) AS n FROM scholarships`).get().n;
  console.log(`Seeded scholarships: ${count}`);
}

seed();
