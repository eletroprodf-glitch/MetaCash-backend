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

app.get("/saude",(req,res)=>{

res.send("Backend OK ✅");

});

// =======================
// FUNÇÃO IA
// =======================

async function gerarIA(prompt){

const HF_API = process.env.HF_API;

const modelos=[

"google/flan-t5-large",
"HuggingFaceH4/zephyr-7b-beta"

];

// tenta modelos diferentes
for(const modelo of modelos){

try{

const response = await fetch(

`https://api-inference.huggingface.co/models/${modelo}`,

{

method:"POST",

headers:{

Authorization:`Bearer ${HF_API}`,

"Content-Type":"application/json"

},

body:JSON.stringify({

inputs:prompt

})

}

);

const data = await response.json();

console.log("HF:",modelo,data);

if(data?.error){

continue;

}

// formatos diferentes HF
if(Array.isArray(data)){

return data[0]?.generated_text;

}

if(data.generated_text){

return data.generated_text;

}

}catch(e){

console.log("Erro modelo:",modelo,e);

}

}

return null;

}

// =======================
// IA INSIGHT CFO
// =======================

app.post("/api/insight", async (req,res)=>{

try{

const { transactions=[],budgets=[],loans=[],settings={} } = req.body;


// calcula números rápidos

const receitas = transactions
.filter(t=>t.type==="income")
.reduce((a,b)=>a+(b.amount||0),0);

const despesas = transactions
.filter(t=>t.type==="expense")
.reduce((a,b)=>a+(b.amount||0),0);

const saldo = receitas - despesas;


// PROMPT NIVEL CFO

const prompt = `

Você é um CFO especialista financeiro.

Empresa: ${settings.companyName || "Empresa"}

Receita total: ${receitas}

Despesas totais: ${despesas}

Saldo atual: ${saldo}

Créditos:

${JSON.stringify(loans)}

Analise e responda:

1 Situação financeira atual.

2 Grau de risco (baixo médio alto).

3 Maior erro financeiro.

4 Melhor ação HOJE.

Resposta curta objetiva profissional.

`;

const respostaIA = await gerarIA(prompt);

res.json({

result:

respostaIA ||

"Situação equilibrada. Revise despesas recorrentes e fortaleça fluxo de caixa semanal."

});

}catch(e){

console.log(e);

res.status(500).json({

result:"Erro IA backend"

});

}

});

// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{

console.log("🔥 Backend rodando");

});