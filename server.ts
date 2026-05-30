import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Gemini AI feedback
  app.post("/api/gemini", async (req, res) => {
    try {
      const { title, score, time } = req.body;
      
      const prompt = `Anda adalah ahli edukasi perkebunan kelapa sawit ("Mandor AI"). Pemain baru saja menyelesaikan simulasi panen kelapa sawit.
Data pemain:
- Titel Performa: ${title}
- Skor Panen: ${score}
- Waktu Bermain: ${time} detik

Berikan evaluasi sangat singkat (maksimal 2 kalimat pendek).
Kategorisasikan evaluasi berdasarkan tingkat titelnya. 
Pujilah pencapaian mereka dan berikan satu fakta edukatif industri kelapa sawit terkait kecepatan, ketepatan, atau manajemen kebun (misal: pentingnya ketepatan waktu dalam menjaga FFA / Free Fatty Acid).
Gunakan bahasa Indonesia yang semangat dan profesional!`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil data dari AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
