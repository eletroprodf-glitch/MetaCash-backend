import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// TESTE BACKEND
// =======================

app.get("/saude", (req, res) => {
  res.send("Backend OK ✅");
});

// =======================
// IA INSIGHT
// =======================

app.post("/api/insight", async (req, res) => {

  try {

    const { transactions, budgets, loans, contacts, settings } = req.body;

    const prompt = `
Você é um CFO profissional.

Empresa: ${settings?.companyName || "Empresa"}

Receitas:
${JSON.stringify(transactions)}

Orçamentos:
${JSON.stringify(budgets)}

Créditos:
${JSON.stringify(loans)}

Analise e responda:

- Situação financeira atual
- Risco
- Dica prática hoje

Resposta curta e direta.
`;

    // 👇 pega API do .env
    const HF_API = process.env.HF_API;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${HF_API}`, // ✅ correto
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

   const data = await response.json();

console.log("HF RESPONSE:", data);

    res.json({
      result: data?.[0]?.generated_text || "Sem resposta IA"
    });

  } catch (e) {

    console.log("Erro IA:", e);

    res.status(500).json({
      result: "Erro IA backend"
    });

  }

});

// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🔥 Backend rodando");
});