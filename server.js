import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// =======================
// GEMINI IA
// =======================

async function gerarGemini(prompt){

try{

const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API}`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

contents:[{

parts:[{

text:prompt

}]

}],

generationConfig:{

temperature:0.25,
maxOutputTokens:150

}

})

}

);

const data = await response.json();

return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

}catch(e){

console.log(e);

return null;

}

}


// =======================
// SAUDE
// =======================

app.get("/saude",(req,res)=>{

res.send("🔥 CEO ONLINE");

});


// =======================
// CFO INSIGHT (VOLTOU)
// =======================

app.post("/api/insight", async(req,res)=>{

try{

const {

transactions=[],
settings={}

}=req.body;


const receitas = transactions

.filter(t=>t.type==="income")

.reduce((a,b)=>a+(b.amount||0),0);


const despesas = transactions

.filter(t=>t.type==="expense")

.reduce((a,b)=>a+(b.amount||0),0);


const saldo = receitas - despesas;


const prompt = `

Você é CFO brasileiro.

Empresa:

${settings.companyName || "Empresa"}

Receita:

${receitas}

Despesa:

${despesas}

Saldo:

${saldo}

Responda curto.

Situação:
Problema:
Conselho:
Oportunidade:

`;

const resposta = await gerarGemini(prompt);


res.json({

result:

resposta ||

"Controle despesas e fortaleça entrada de caixa.",

score:100,

risco:"baixo"

});

}catch(e){

console.log(e);

res.status(500).json({

result:"Erro IA"

});

}

});


// =======================
// CRM CEO MESSAGE
// =======================

app.post("/api/crm-message", async(req,res)=>{

try{

const {

contact,
settings={}

}=req.body;

const prompt = `

Crie mensagem WhatsApp profissional.

Empresa:

${settings.companyName}

Cliente:

${contact.name}

Mensagem curta CEO.

`;

const mensagem = await gerarGemini(prompt);

res.json({

message:

mensagem ||

"Gostaria de saber se posso ajudar em algo hoje."

});

}catch(e){

console.log(e);

res.status(500).json({

message:"Erro"

});

}

});


// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{

console.log("🔥 CEO BACKEND RODANDO");

});