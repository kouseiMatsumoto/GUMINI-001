import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Assistant for R: Generate, Explain, Fix R Code & Statistical Analysis
  app.post("/api/gemini/assist", async (req, res) => {
    try {
      const { task, code, error, prompt, context } = req.body;
      const ai = getGemini();

      let systemInstruction = `You are an expert R programmer and statistician specializing in R and WebR (WebAssembly R).
You help users write clean, modern, and idiomatic R code (Base R, tidyverse, ggplot2, dplyr).
Keep explanations concise, well-structured, and provide copy-paste ready R code blocks.
Note that in WebR, packages like ggplot2, dplyr, tidyr, stringr, jsonlite, palmerpenguins, MASS, lattice, and stats work great in WebAssembly.
Respond in clear, helpful Japanese by default, or match the user's language.`;

      let userMessage = "";
      if (task === "generate") {
        userMessage = `以下の要望に基づき、WebRで動作するRコードを生成してください:
要望: ${prompt || "データ分析とグラフ描画"}
${context ? `現在のコンテキスト / データ情報:\n${context}` : ""}`;
      } else if (task === "explain") {
        userMessage = `以下のRコードの動作と統計的意味を分かりやすく解説してください:
\`\`\`r
${code}
\`\`\``;
      } else if (task === "fix") {
        userMessage = `以下のRコードでエラーが発生しました。原因を分析し、修正された動作するRコードと変更点を提示してください:
コード:
\`\`\`r
${code}
\`\`\`
エラー内容:
${error || "実行時エラー"}`;
      } else {
        userMessage = prompt || "R言語に関する質問";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const text = response.text || "AIからの応答がありませんでした。";
      res.json({ success: true, text });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      res.status(500).json({
        success: false,
        error: err?.message || "AI支援リクエストの処理中にエラーが発生しました。",
      });
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WebR Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
