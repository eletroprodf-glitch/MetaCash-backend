import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// SAUDE
// =======================

app.get("/saude",(req,res)=>{

res.send("Backend OK ✅");

});

// =======================
// IA MULTI MODELO
// =======================

async function gerarIA(prompt){

const HF_API = process.env.HF_API;

try{

const response = await fetch(

"https://router.huggingface.co/hf-inference/models/google/flan-t5-large",

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


// 👇 NÃO PARSEIA DIRETO

const texto = await response.text();

console.log("HF RAW:",texto);


// tenta converter

let data;

try{

data = JSON.parse(texto);

}catch{

console.log("HF não retornou JSON");

return null;

}


// erro HF

if(data.error){

console.log("HF ERRO:",data.error);

return null;

}


// formatos HF

if(Array.isArray(data)){

return data[0]?.generated_text;

}

return data.generated_text || null;

}catch(e){

console.log("Erro IA:",e);

return null;

}

}
// =======================
// INSIGHT CFO PROFISSIONAL
// =======================

app.post("/api/insight", async (req,res)=>{

try{

const {

transactions=[],
budgets=[],
loans=[],
settings={}

}=req.body;


// ====================
// CALCULOS
// ====================

const receitas = transactions
.filter(t=>t.type==="income")
.reduce((a,b)=>a+(b.amount||0),0);

const despesas = transactions
.filter(t=>t.type==="expense")
.reduce((a,b)=>a+(b.amount||0),0);

const saldo = receitas - despesas;


// média diária

const mediaDiariaDespesa = despesas / 30;


// previsão 90 dias

const previsao90dias = saldo - (mediaDiariaDespesa * 90);


// ====================
// SCORE FINANCEIRO
// ====================

let score = 100;

if(despesas > receitas){

score -= 40;

}

if(loans.length > 0){

score -= 20;

}

if(previsao90dias < 0){

score -= 30;

}

if(score < 0){

score = 0;

}


// ====================
// RISCO
// ====================

let risco="baixo";

if(previsao90dias <0){

risco="alto";

}else if(previsao90dias < saldo*0.5){

risco="medio";

}


// ====================
// PROMPT CFO PREMIUM
// ====================

const prompt = `

Você é um CFO especialista financeiro brasileiro.

Responda SEMPRE em português.

Empresa:

${settings.companyName || "Empresa"}

Receita total:

${receitas}

Despesas totais:

${despesas}

Saldo atual:

${saldo}

Previsão financeira 90 dias:

${previsao90dias}

Score financeiro:

${score}

Risco:

${risco}

Créditos:

${JSON.stringify(loans)}

Orçamentos:

${JSON.stringify(budgets)}

Responda:

1 Situação financeira.

2 Maior problema.

3 Conselho do dia.

4 Oportunidade de crescimento.

Resposta curta objetiva.

`;

const resposta = await gerarIA(prompt);


// ====================
// FALLBACK (NUNCA FICA SEM)
// ====================

const fallback = `

Empresa ${settings.companyName || ""}

Score Financeiro: ${score}/100.

Risco ${risco}.

Controle despesas fixas, aumente entrada de caixa e revise créditos ativos semanalmente.

`;

res.json({

result: resposta || fallback,

score,

risco,

previsao90dias

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

console.log("🔥 Backend rodando CFO PRO");

});