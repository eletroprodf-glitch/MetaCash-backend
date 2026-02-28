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
// FUNÇÃO IA
// =======================

async function gerarIA(prompt){

const HF_API = process.env.HF_API;

if(!HF_API){

console.log("HF_API não configurada");

return null;

}

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

max_tokens:600,
temperature:0.4

})

}

);

const text = await response.text();

let data;

try{

data = JSON.parse(text);

}catch{

console.log("HF NÃO RETORNOU JSON:",text);

return null;

}

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
// INSIGHT CFO
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
// CALCULOS SEGUROS
// ====================

const receitas = transactions

.filter(t=>

t.type==="income" ||
t.type==="receita" ||
t.type==="entrada"

)

.reduce((a,b)=>a + Number(b.amount || 0),0);



const despesas = transactions

.filter(t=>

t.type==="expense" ||
t.type==="despesa"

)

.reduce((a,b)=>a + Number(b.amount || 0),0);



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
// PROMPT CFO INTELIGENTE
// ====================

const prompt = `

Você é um CFO brasileiro profissional.

Analise SOMENTE os números abaixo.

Empresa:

${settings.companyName || "Empresa"}

Receita mensal:

R$ ${receitas.toFixed(2)}

Despesas mensais:

R$ ${despesas.toFixed(2)}

Saldo atual:

R$ ${saldo.toFixed(2)}

Previsão financeira 90 dias:

R$ ${previsao90dias.toFixed(2)}

Score financeiro:

${score}/100

Risco:

${risco}

Responda em no máximo 4 linhas.

Formato:

Situação:
Problema:
Conselho:
Oportunidade:

Sem textos longos.

`;


// 🔥 AGORA SIM CHAMA IA

const resposta = await gerarIA(prompt);


// ====================
// FALLBACK
// ====================

const fallback = `

Situação: Score ${score}/100.

Risco ${risco}.

Revise despesas e aumente fluxo de caixa.

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