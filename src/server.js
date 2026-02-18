require("dotenv").config();
const express = require("express");
const { initDb } = require("./db");

const scholarshipsRoutes = require("./routes/scholarships");
const studentsRoutes = require("./routes/students");

initDb();

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/scholarships", scholarshipsRoutes);
app.use("/api/students", studentsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
