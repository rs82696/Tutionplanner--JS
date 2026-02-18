const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbFile = process.env.DATABASE_URL?.startsWith("file:")
  ? process.env.DATABASE_URL.replace("file:", "")
  : "./dev.db";

const db = new Database(dbFile);

function initDb() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

module.exports = { db, initDb };
