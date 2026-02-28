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
// FUNÇÃO IA (HF CHAT API)
// =======================

async function gerarIA(prompt){

const HF_API = process.env.HF_API;

try{

const response = await fetch(

"https://router.huggingface.co/v1/chat/completions",

{

method:"POST",

headers:{

Authorization:`Bearer ${HF_API}`,
"Content-Type":"application/json"

},

body:JSON.stringify({

model:"meta-llama/Llama-3.1-8B-Instruct",

messages:[

{

role:"user",
content:prompt

}

],

max_tokens:300

})

}

);


// caso venha erro HTML ou texto

const text = await response.text();

let data;

try{

data = JSON.parse(text);

}catch{

console.log("HF NÃO RETORNOU JSON:",text);

return null;

}

console.log("HF RESPONSE:",data);

if(data.error){

console.log("HF ERRO:",data.error);

return null;

}

return data?.choices?.[0]?.message?.content || null;

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

const mediaDiariaDespesa = despesas / 30;

const previsao90dias = saldo - (mediaDiariaDespesa * 90);


// ====================
// SCORE
// ====================

let score = 100;

if(despesas > receitas) score -= 40;

if(loans.length > 0) score -= 20;

if(previsao90dias < 0) score -= 30;

if(score < 0) score = 0;


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
// PROMPT
// ====================

const prompt = `

Você é um CFO especialista financeiro brasileiro.

Responda em português.

Empresa:

${settings.companyName || "Empresa"}

Receitas:

${receitas}

Despesas:

${despesas}

Saldo atual:

${saldo}

Previsão 90 dias:

${previsao90dias}

Score:

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

4 Oportunidade.

Resposta curta.

`;

const resposta = await gerarIA(prompt);


// ====================
// FALLBACK
// ====================

const fallback = `

Empresa ${settings.companyName || ""}

Score Financeiro ${score}/100.

Risco ${risco}.

Controle despesas fixas e aumente caixa.

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