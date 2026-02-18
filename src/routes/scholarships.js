//(GET /api/scholarships)
const express = require("express");
const { db } = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT
      id, name, provider, amount, amount_type, deadline, url, description,
      gpa_minimum, first_generation, financial_need, gender, residency, community_service_hours,
      renewable, renewable_conditions,
      application_requirements_json, tags_json
    FROM scholarships
    ORDER BY deadline ASC, amount DESC
  `).all();

  const scholarships = rows.map(r => ({
    ...r,
    application_requirements: r.application_requirements_json ? JSON.parse(r.application_requirements_json) : [],
    tags: r.tags_json ? JSON.parse(r.tags_json) : [],
    application_requirements_json: undefined,
    tags_json: undefined,
  }));

  res.json({ scholarships });
});

module.exports = router;
