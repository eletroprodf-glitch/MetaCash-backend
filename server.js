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
// IA
// =======================

async function gerarIA(prompt){

try{

const response = await fetch(

"https://router.huggingface.co/v1/chat/completions",

{

method:"POST",

headers:{

Authorization:`Bearer ${process.env.HF_API}`,
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

max_tokens:250,
temperature:0.3

})

}

);

const data = await response.json();

return data?.choices?.[0]?.message?.content || null;

}catch{

return null;

}

}



// =======================
// INSIGHT SAAS CFO
// =======================

app.post("/api/insight", async (req,res)=>{

try{

const {

transactions=[],
settings={},
loans=[]

}=req.body;


// DEBUG (IMPORTANTE)

console.log("TRANSACTIONS RECEBIDO:");

console.log(transactions);


// ====================
// NORMALIZAÇÃO
// ====================

function tipo(t){

return String(t || "")

.toLowerCase()

.normalize("NFD")

.replace(/[\u0300-\u036f]/g,"");

}


// ====================
// RECEITAS
// ====================

const receitas = transactions

.filter(t=>{

const tp = tipo(t.type);

return(

tp.includes("income") ||
tp.includes("receita") ||
tp.includes("entrada") ||
tp.includes("ganho") ||
tp.includes("credito")

);

})

.reduce((a,b)=>a+Number(b.amount||0),0);


// ====================
// DESPESAS
// ====================

const despesas = transactions

.filter(t=>{

const tp = tipo(t.type);

return(

tp.includes("expense") ||
tp.includes("despesa") ||
tp.includes("saida") ||
tp.includes("gasto")

);

})

.reduce((a,b)=>a+Number(b.amount||0),0);



const saldo = receitas - despesas;


// previsão

const previsao90dias = saldo - ((despesas/30)*90);


// score matemático

let score=100;

if(despesas>receitas)score-=40;

if(loans.length>0)score-=20;

if(previsao90dias<0)score-=30;

if(score<0)score=0;


// risco

let risco="baixo";

if(previsao90dias<0){

risco="alto";

}else if(previsao90dias<saldo*0.5){

risco="medio";

}


// ====================
// PROMPT SAAS
// ====================

const prompt=`

Você é CFO brasileiro.

Empresa:

${settings.companyName || "Empresa"}

Receita:

${receitas}

Despesa:

${despesas}

Saldo:

${saldo}

Score:

${score}

Risco:

${risco}

Responda curto:

Situação:
Problema:
Conselho:

`;

const resposta = await gerarIA(prompt);


// fallback

const fallback =

`Situação financeira ${risco}.
Score ${score}/100.
Revise despesas.`;


res.json({

result:resposta || fallback,

saldo,
receitas,
despesas,
score,
risco

});

}catch(e){

console.log(e);

res.status(500).json({

result:"Erro IA"

});

}

});


// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{

console.log("🔥 CFO SAAS ONLINE");

});