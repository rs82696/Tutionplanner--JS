PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS scholarships (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  amount INTEGER NOT NULL,
  amount_type TEXT,
  deadline TEXT,
  url TEXT,
  description TEXT,

  gpa_minimum REAL,
  first_generation INTEGER,
  financial_need INTEGER,
  gender TEXT,
  residency TEXT,
  community_service_hours INTEGER,

  renewable INTEGER,
  renewable_conditions TEXT,

  application_requirements_json TEXT,
  tags_json TEXT,

  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scholarship_allowed_enrollment (
  scholarship_id TEXT NOT NULL,
  enrollment_status TEXT NOT NULL,
  PRIMARY KEY (scholarship_id, enrollment_status),
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scholarship_allowed_citizenship (
  scholarship_id TEXT NOT NULL,
  citizenship_status TEXT NOT NULL,
  PRIMARY KEY (scholarship_id, citizenship_status),
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scholarship_fields_of_study (
  scholarship_id TEXT NOT NULL,
  field TEXT NOT NULL,
  PRIMARY KEY (scholarship_id, field),
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scholarship_allowed_ethnicity (
  scholarship_id TEXT NOT NULL,
  ethnicity TEXT NOT NULL,
  PRIMARY KEY (scholarship_id, ethnicity),
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scholarship_allowed_military_affiliation (
  scholarship_id TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  PRIMARY KEY (scholarship_id, affiliation),
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  gpa REAL,
  major TEXT,
  enrollment_status TEXT NOT NULL,
  citizenship_status TEXT,
  financial_need INTEGER,
  first_generation INTEGER,
  gender TEXT,
  residency TEXT,
  community_service_hours INTEGER,
  military_affiliation TEXT,
  ethnicity_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
