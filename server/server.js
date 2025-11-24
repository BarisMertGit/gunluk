const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Upload klasörünü hazırla ve statik servis et
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Multer ile dosya upload ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({ storage });

// Basit id üretici
function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Journal API is running" });
});

// Video upload endpoint
// İstek: multipart/form-data içinde field name: "file"
// Yanıt: { video_url, thumbnail_url }
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    video_url: fileUrl,
    thumbnail_url: fileUrl,
  });
});

// Entry listeleme
app.get("/api/entries", (req, res) => {
  const stmt = db.prepare(
    "SELECT id, date, mood, notes, video_url, thumbnail_url, created_at FROM journal_entries ORDER BY date DESC, created_at DESC"
  );
  const rows = stmt.all();
  res.json(rows);
});

// Tek entry detay
app.get("/api/entries/:id", (req, res) => {
  const stmt = db.prepare(
    "SELECT id, date, mood, notes, video_url, thumbnail_url, created_at FROM journal_entries WHERE id = ?"
  );
  const row = stmt.get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Entry not found" });
  }
  res.json(row);
});

// Yeni entry oluşturma
// Body JSON: { date, mood, notes, video_url, thumbnail_url }
app.post("/api/entries", (req, res) => {
  const { date, mood, notes, video_url, thumbnail_url } = req.body || {};

  if (!date) {
    return res.status(400).json({ error: "date is required" });
  }

  const id = generateId();
  const created_at = new Date().toISOString();

  const stmt = db.prepare(
    "INSERT INTO journal_entries (id, date, mood, notes, video_url, thumbnail_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  stmt.run(id, date, mood || null, notes || null, video_url || null, thumbnail_url || null, created_at);

  res.status(201).json({
    id,
    date,
    mood: mood || null,
    notes: notes || null,
    video_url: video_url || null,
    thumbnail_url: thumbnail_url || null,
    created_at,
  });
});

// Entry silme
app.delete("/api/entries/:id", (req, res) => {
  const stmt = db.prepare("DELETE FROM journal_entries WHERE id = ?");
  const result = stmt.run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Journal API listening on http://localhost:${PORT}`);
});
