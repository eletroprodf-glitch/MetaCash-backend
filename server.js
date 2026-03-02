import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin:"*" }));

app.use(express.json({

limit:"10mb"

}));


// ===== HEALTH =====

app.get("/",(req,res)=>{

res.send("🔥 MetaCash CEO ONLINE");

});

app.get("/saude",(req,res)=>{

res.send("🔥 CEO ONLINE");

});


// ===== GEMINI =====

const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function gerarGemini(prompt){

try{

if(!GEMINI_KEY){

console.log("SEM API KEY");

return null;

}

const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

contents:[{

parts:[{

text:prompt.slice(0,15000)

}]

}],

generationConfig:{

temperature:0.25,

maxOutputTokens:250

}

})

}

);

const text = await response.text();

console.log("Gemini:",text.substring(0,200));

if(!text.startsWith("{")){

return null;

}

const data = JSON.parse(text);

return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

}catch(e){

console.log("ERRO GEMINI:",e);

return null;

}

}



// ===== CFO =====

app.post("/api/insight", async(req,res)=>{

try{

const {transactions=[],settings={}} = req.body;


const receitas = transactions

.filter(t=>t.type==="income")

.reduce((a,b)=>a+(Number(b.amount)||0),0);


const despesas = transactions

.filter(t=>t.type==="expense")

.reduce((a,b)=>a+(Number(b.amount)||0),0);


const saldo = receitas - despesas;


const prompt = `

Você é CFO CEO brasileiro.

Empresa:

${settings.companyName || "Empresa"}

Receita:

${receitas}

Despesa:

${despesas}

Saldo:

${saldo}

Responda curto:

Situação:
Risco:
Oportunidade:
Conselho:

`;

const resposta = await gerarGemini(prompt);

res.json({

result:

resposta ||

"Fluxo de caixa precisa atenção.",

score: saldo > 0 ? 90 : 60,

risco: saldo > 0 ? "baixo" : "alto"

});

}catch(e){

console.log("ERRO CFO:",e);

res.status(500).json({

result:"Erro CFO"

});

}

});


// ===== CRM =====

app.post("/api/crm-message", async(req,res)=>{

try{

const {contact={},settings={}} = req.body;

const prompt=`

Mensagem WhatsApp profissional.

Empresa:

${settings.companyName}

Cliente:

${contact.name}

Agradeça serviço ou ofereça novos serviços.

Curto.

`;

const mensagem = await gerarGemini(prompt);

res.json({

message:

mensagem ||

"Olá! Posso ajudar em algo hoje?"

});

}catch(e){

console.log(e);

res.status(500).json({

message:"Erro CRM"

});

}

});


// ===== PDF ANALYZER =====

app.post("/api/analisar-projeto", async(req,res)=>{

try{

const {conteudoProjeto=""} = req.body;

if(!conteudoProjeto){

return res.status(400).json({

erro:"Sem texto"

});

}

const prompt=`

Você é engenheiro eletricista.

Analise projeto.

Extraia:

metros LED
tomadas
circuitos

Resumo técnico.

Projeto:

${conteudoProjeto.slice(0,15000)}

`;

const resposta = await gerarGemini(prompt);

res.json({

resultado:null,

resposta:

resposta ||

"Projeto analisado."

});

}catch(e){

console.log("GOD MODE:",e);

res.status(500).json({

erro:"Erro GOD MODE"

});

}

});


const PORT = process.env.PORT || 10000;

app.listen(PORT,()=>{

console.log("🔥 CEO BACKEND ONLINE");

});