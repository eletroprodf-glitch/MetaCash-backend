import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();


// =======================
// MIDDLEWARES
// =======================

app.use(cors({ origin:"*" }));

app.use(express.json({ limit:"20mb" }));


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

async function gerarGeminiVision(base64Image){

try{

const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

contents:[{

parts:[

{

text:`

Você é engenheiro eletricista especialista NBR5410.

Analise a planta elétrica da imagem.

Responda APENAS JSON:

{

"lighting":{
"ledStripsMeters":numero,
"lightPoints":numero,
"fixtureTypes":[]
},

"outletsAndSwitches":{
"tugOutlets":numero,
"tueOutlets":numero,
"switches":numero
},

"electricalDistribution":{
"circuits":numero,
"breakers":numero,
"installedLoad":"texto"
},

"observations":"texto técnico"

}

Se não identificar colocar 0.

`

},

{

inlineData:{

mimeType:"image/png",

data:base64Image

}

}

]

}]

})

}

);

const data = await response.json();

return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

}catch(e){

console.log("VISION ERROR",e);

return null;

}

}


// =======================
// HEALTH CHECK
// =======================

app.get("/",(req,res)=>{

res.send("🔥 MetaCash CEO ONLINE");

});

app.get("/saude",(req,res)=>{

res.send("🔥 CEO ONLINE");

});




// =======================
// 1️⃣ CFO FINANCEIRO IA
// =======================

app.post("/api/insight", async(req,res)=>{

try{

const { transactions=[], settings={} } = req.body;

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

Dados reais:

Receitas = ${receitas}

Despesas = ${despesas}

Saldo = ${saldo}

Analise objetivo:

Situação financeira:
Principais riscos:
Oportunidades crescimento:
Conselho CEO direto.

Responda curto.

`;

const resposta = await gerarGemini(prompt);

res.json({

result:

resposta ||

"Revise despesas e fortaleça fluxo de caixa.",

score: saldo>0 ? 90 : 60,

risco: saldo>0 ? "baixo":"alto"

});

}catch(e){

console.log(e);

res.status(500).json({

result:"Erro IA CFO"

});

}

});




// =======================
// 2️⃣ CRM WHATSAPP IA
// =======================

app.post("/api/crm-message", async(req,res)=>{

try{

const {

contact={},
orcamento={},
settings={}

}=req.body;


const nome = contact.name || "Cliente";

const servico = orcamento.service || "serviço solicitado";

const empresa = settings.companyName || "Empresa";


const prompt = `

Você é especialista relacionamento cliente WhatsApp.

Empresa:

${empresa}

Cliente:

${nome}

Serviço:

${servico}

Objetivo:

Mensagem pós orçamento ou pós serviço.

REGRAS:

- agradecer interesse.
- perguntar se precisa outro serviço.
- tom humano profissional.
- curto.
- NÃO inventar valores.

Mensagem pronta WhatsApp somente.

`;

const mensagem = await gerarGemini(prompt);

res.json({

message:

mensagem ||

`Olá ${nome}! 😊 Obrigado pelo interesse em ${servico}. Caso precise de algo mais estamos à disposição.`

});

}catch(e){

console.log(e);

res.status(500).json({

message:"Erro IA CRM"

});

}

});




// =======================
// 3️⃣ ANALISADOR PROJETO
// =======================

app.post("/api/analisar-projeto", async(req,res)=>{

try{

const {

conteudoProjeto="",
imagemProjeto=null

}=req.body;


// ===== TEXTO =====

if(conteudoProjeto){

const resposta = await gerarGemini(`

Você é engenheiro eletricista.

Projeto:

${conteudoProjeto}

Responder JSON técnico NBR5410 igual:

{

"lighting":{
"ledStripsMeters":numero,
"lightPoints":numero,
"fixtureTypes":[]
},

"outletsAndSwitches":{
"tugOutlets":numero,
"tueOutlets":numero,
"switches":numero
},

"electricalDistribution":{
"circuits":numero,
"breakers":numero,
"installedLoad":"texto"
},

"observations":"texto"

}

`);

if(resposta){

const limpar = resposta
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();

try{

return res.json({

resultado:JSON.parse(limpar)

});

}catch{}

}

}


// ===== IMAGEM (GOD MODE) =====

if(imagemProjeto){

const respostaVision = await gerarGeminiVision(imagemProjeto);

if(respostaVision){

const limpar = respostaVision
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();

return res.json({

resultado:JSON.parse(limpar)

});

}

}


res.json({

resultado:null

});

}catch(e){

console.log(e);

res.status(500).json({

erro:"Erro GOD MODE"

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