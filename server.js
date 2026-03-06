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

app.post("/api/financeiro", async (req,res)=>{

const { receitas, despesas } = req.body;

const prompt = `
Analise o fluxo financeiro desta empresa:

Receitas:
${JSON.stringify(receitas)}

Despesas:
${JSON.stringify(despesas)}

Retorne:

- diagnóstico financeiro
- riscos
- sugestões de crescimento
`;

const resposta = await model.generateContent(prompt);

res.json({
resultado: resposta.response.text()
});

});
app.post("/api/crm", async (req,res)=>{

const { nome, servico, cidade } = req.body;

const prompt = `
Crie uma mensagem curta para WhatsApp.

Cliente: ${nome}
Serviço solicitado: ${servico}
Cidade: ${cidade}

Objetivo:
agradecer contato e perguntar se precisa de mais algum serviço.

Tom profissional.
`;

const resposta = await model.generateContent(prompt);

res.json({
mensagem: resposta.response.text()
});

});

// ===== GEMINI =====

const GEMINI_KEY = process.env.GEMINI_API_KEY;

import axios from "axios";

async function chamarGemini(prompt){

const response = await axios.post(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,

{

contents:[{

parts:[{

text: prompt

}]

}]

}

);

return response.data
.candidates?.[0]
?.content?.parts?.[0]
?.text;

}
const data = JSON.parse(text);

return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

}catch(e){

console.log("ERRO GEMINI:",e);

return null;

}

}

let resposta = await chamarGemini(prompt);

if(!resposta){

resposta = "IA não conseguiu analisar totalmente, porém o projeto foi recebido.";

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

app.post("/api/analisar", upload.single("pdf"), async(req,res)=>{

try{

let texto = await extrairTexto(req.file.buffer);

if(texto.length < 200){

texto = await fazerOCR(req.file.buffer);

}

texto = texto.slice(0,15000);

const prompt = montarPrompt(texto);

const resposta = await chamarGemini(prompt);

res.json({

resultado: resposta,
resposta:"Projeto analisado com sucesso"

});

}catch(e){

console.log(e);

res.status(500).json({

erro:"Falha análise"

});

}

});// ===== PROMPT GOD MODE =====

function montarPrompt(texto){

return `

Você é um engenheiro civil especialista em leitura de projetos arquitetônicos.

Analise COMPLETAMENTE o texto abaixo.

Mesmo bagunçado ou incompleto:

Extraia:

- Cliente
- Endereço
- Responsável técnico
- Ambientes
- Áreas m²
- Demolições
- Construções
- Layout
- Iluminação
- Quantidade luminárias
- Potência
- BTUs ar condicionado
- Observações técnicas.

Organize como RELATÓRIO PROFISSIONAL.

Texto:

${texto}

`;

}
"lighting":{

"ledStripsMeters":0,

"fixtureTypes":[],

"lightPoints":0

},

"outletsAndSwitches":{

"totalOutlets":0,

"tugOutlets":0,

"tueOutlets":0,

"switches":0,

"relocations":""

},

"electricalDistribution":{

"circuits":0,

"breakers":0,

"installedLoad":""

},

"observations":""

}

Projeto:

${conteudoProjeto.slice(0,15000)}

`;


const resposta = await gerarGemini(prompt);


// ===== SEGURANÇA JSON =====

if(!resposta){

return res.json({

resultado:null,

resposta:"IA não encontrou informações."

});

}


let jsonIA;

try{

jsonIA = JSON.parse(resposta);

}catch{

return res.json({

resultado:null,

resposta:resposta

});

}


// ===== SUCESSO =====

res.json({

resultado:jsonIA,

resposta:"Projeto analisado com sucesso."

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