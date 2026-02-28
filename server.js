import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// SAUDE
// =========================

app.get("/saude",(req,res)=>{

res.send("Backend CEO OK 🚀");

});


// =========================
// GEMINI CEO
// =========================

async function gerarIA(prompt){

try{

const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API}`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

contents:[

{

parts:[

{

text:prompt

}

]

}

],

generationConfig:{

temperature:0.4,

maxOutputTokens:220

}

})

}

);

const data = await response.json();

console.log("GEMINI RESPONSE:",data);

return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

}catch(e){

console.log("Erro Gemini:",e);

return null;

}

}



// =========================
// INSIGHT CFO CEO
// =========================

app.post("/api/insight", async (req,res)=>{

try{

const {

transactions=[],
budgets=[],
loans=[],
settings={}

}=req.body;


// ================= CALCULOS

const receitas = transactions
.filter(t=>t.type==="income")
.reduce((a,b)=>a+(Number(b.amount)||0),0);

const despesas = transactions
.filter(t=>t.type==="expense")
.reduce((a,b)=>a+(Number(b.amount)||0),0);

const saldo = receitas - despesas;

const mediaDespesa = despesas / 30;

const previsao90dias = saldo - (mediaDespesa*90);


// ================= SCORE

let score = 100;

if(despesas > receitas) score -=40;

if(loans.length>0) score -=15;

if(previsao90dias<0) score -=35;

if(score<0) score=0;


// ================= RISCO

let risco="baixo";

if(previsao90dias<0){

risco="alto";

}else if(previsao90dias < saldo*0.5){

risco="medio";

}


// ================= PROMPT CEO

const prompt = `

Você é um CFO CEO brasileiro especialista em empresas SaaS.

Analise APENAS números.

Nunca diga que não existe receita quando houver valor maior que zero.

Empresa:

${settings.companyName || "Empresa"}

Receita mensal:

${receitas}

Despesas mensais:

${despesas}

Saldo:

${saldo}

Previsão 90 dias:

${previsao90dias}

Score:

${score}/100

Risco:

${risco}

Créditos ativos:

${loans.length}

Responda curto profissional.

Formato:

Situação:
Problema:
Conselho:
Oportunidade:

Máximo 4 linhas.

Tom CEO direto.

`;


// ================= IA

const resposta = await gerarIA(prompt);


// ================= FALLBACK

const fallback = `

Situação: Receita ${receitas>0?"positiva":"crítica"} com saldo ${saldo}.

Problema: despesas elevadas ou projeção negativa.

Conselho: priorize caixa e corte custos variáveis.

Oportunidade: expandir vendas mantendo margem.

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

result:"Erro backend CEO"

});

}

});


// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{

console.log("🔥 Backend GEMINI CEO rodando");

});