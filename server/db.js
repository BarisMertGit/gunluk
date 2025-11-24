const Database = require("better-sqlite3");
const path = require("path");

// SQLite dosyasını proje içindeki server klasöründe tutuyoruz
const dbPath = path.join(__dirname, "journal.db");
const db = new Database(dbPath);

// Tablo yoksa oluştur
// Basit şema: mobil ve web istemciler için yeterli metadata
// id: metin (uuid benzeri); date: ISO string; mood: string; notes: text; video_url & thumbnail_url: string
// created_at: kayıt zamanı
const createTableSQL = `
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  mood TEXT,
  notes TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  created_at TEXT NOT NULL
);
`;

db.exec(createTableSQL);

module.exports = db;
