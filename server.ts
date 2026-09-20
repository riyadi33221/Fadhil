import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for Gemini AI instance
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", school: "SMP Negeri 2 Kutasari", subject: "PJOK Kelas VII" });
});

// API endpoint to generate Remedial & Pengayaan recommendations with Gemini
app.post("/api/ai/remedial-recommendation", async (req, res) => {
  try {
    const { subject, topicName, learningObjective, kkm, lowScoringItems, lowScoredStudentsCount } = req.body;
    const currentSubject = subject || 'PJOK';

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Kunci API Gemini belum dikonfigurasi. Silakan atur GEMINI_API_KEY di menu rahasia/pengaturan.",
      });
    }

    const prompt = `Anda adalah Asisten Guru Mata Pelajaran ${currentSubject} ahli Kurikulum Merdeka untuk tingkat SMP/MTs.
Buatkan rekomendasi program Perbaikan (Remedial) dan Pengayaan berdasarkan data analisis penilaian harian berikut:

- Mata Pelajaran: ${currentSubject}
- Topik/Materi Penilaian Harian: ${topicName || 'Asesmen Lingkup Materi'}
- Tujuan Pembelajaran (TP): ${learningObjective || 'Mencapai ketuntasan kompetensi materi'}
- KKM: ${kkm || 75}
- Jumlah Siswa Perlu Remedial: ${lowScoredStudentsCount || 0} siswa
- Indikator/Nomor Soal yang banyak salah: ${lowScoringItems || 'Soal pemahaman konsep dan penerapan'}

Berikan output dalam JSON rapi dengan format:
{
  "remedialStrategy": "Deskripsi langkah-langkah remedial yang efektif (2-3 kalimat)",
  "remedialTasks": ["Tugas/Latihan 1", "Tugas/Latihan 2", "Tugas/Latihan 3"],
  "pengayaanStrategy": "Deskripsi strategi pengayaan untuk siswa tuntas (2-3 kalimat)",
  "pengayaanTasks": ["Tugas/Tantangan Pengayaan 1", "Tugas/Tantangan Pengayaan 2"],
  "teacherNote": "Catatan motivasi singkat untuk guru mata pelajaran"
}
Pastikan jawaban dalam Bahasa Indonesia yang lugas, profesional, dan relevan dengan materi ${currentSubject} SMP.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    res.json(data);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Gagal membuat rekomendasi AI: " + (err.message || err) });
  }
});

// JSON fallback for unknown API endpoints
app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "Endpoint API tidak ditemukan (404)" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for HTML SPA routes in development mode
    app.get("*", async (req, res, next) => {
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server PJOK SMPN 2 Kutasari running on http://localhost:${PORT}`);
  });
}

startServer();
