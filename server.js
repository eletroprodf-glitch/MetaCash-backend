import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();


// =======================
// MIDDLEWARES
// =======================

app.use(cors({

origin:"*"

}));

app.use(express.json({

limit:"10mb"

}));


// =======================
// GEMINI CONFIG
// =======================

const GEMINI_KEY = process.env.GEMINI_API_KEY;

if(!GEMINI_KEY){

console.error("❌ GEMINI_API_KEY NÃO ENCONTRADA");

}



// =======================
// GEMINI FUNCTION
// =======================

async function gerarGemini(prompt){

try{

const controller = new AbortController();

const timeout = setTimeout(()=>{

controller.abort();

},25000);


const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

signal:controller.signal,

body:JSON.stringify({

contents:[{

parts:[{

text:prompt

}]

}],

generationConfig:{

temperature:0.25,

maxOutputTokens:250

}

})

}

);

clearTimeout(timeout);

const data = await response.json();

return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

}catch(e){

console.log("ERRO GEMINI:",e);

return null;

}

}



// =======================
// HEALTH CHECK (RENDER)
// =======================

app.get("/",(req,res)=>{

res.send("🔥 MetaCash CEO ONLINE");

});

app.get("/saude",(req,res)=>{

res.send("🔥 CEO ONLINE");

});



// =======================
// CFO FINANCEIRO
// =======================

app.post("/api/insight", async(req,res)=>{

try{

const {

transactions=[],
settings={}

}=req.body;



const receitas = transactions

.filter(t=>t.type==="income")

.reduce((a,b)=>a+(Number(b.amount)||0),0);


const despesas = transactions

.filter(t=>t.type==="expense")

.reduce((a,b)=>a+(Number(b.amount)||0),0);


const saldo = receitas - despesas;



const prompt = `

Você é CFO brasileiro profissional.

Empresa:

${settings.companyName || "Empresa"}

Receita total:

${receitas}

Despesa total:

${despesas}

Saldo atual:

${saldo}

Analise curto:

Situação:
Risco:
Oportunidade:
Conselho CEO direto.

`;

const resposta = await gerarGemini(prompt);


res.json({

result:

resposta ||

"Fluxo de caixa precisa atenção. Revise despesas e fortaleça receitas.",

score: saldo > 0 ? 90 : 60,

risco: saldo > 0 ? "baixo" : "alto"

});

}catch(e){

console.log(e);

res.status(500).json({

result:"Erro IA"

});

}

});



// =======================
// CRM WHATSAPP CEO
// =======================

app.post("/api/crm-message", async(req,res)=>{

try{

const {

contact={},
settings={}

}=req.body;


const prompt = `

Você é especialista vendas WhatsApp.

Empresa:

${settings.companyName || "Empresa"}

Cliente:

${contact.name || "Cliente"}

Crie mensagem curta profissional persuasiva.

`;

const mensagem = await gerarGemini(prompt);

res.json({

message:

mensagem ||

"Olá! Gostaria de saber se posso ajudar em algo hoje."

});

}catch(e){

console.log(e);

res.status(500).json({

message:"Erro IA"

});

}

});



// =======================
// START SERVER
// =======================

const PORT = process.env.PORT || 10000;

app.listen(PORT,()=>{

console.log("🔥 CEO BACKEND ONLINE PORT:",PORT);

});