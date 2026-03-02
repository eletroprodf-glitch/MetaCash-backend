import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// ================= GEMINI CEO

async function gemini(prompt){

try{

const r = await fetch(

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
maxOutputTokens:160

}

})

}

);

const data = await r.json();

return data?.candidates?.[0]?.content?.parts?.[0]?.text;

}catch(e){

console.log("Gemini erro:",e);

return null;

}

}



// ================= SAUDE

app.get("/saude",(req,res)=>{

res.send("🔥 APOCALIPSE CEO ONLINE");

});



// ================= CRM CEO MESSAGE

app.post("/api/crm-message",async(req,res)=>{

try{

const{

contact,
budgets=[],
loans=[],
activities=[],
settings={}

}=req.body;


// ===== HISTORICO

const orcamentos = budgets.filter(

b=>b.clientName===contact.name

);

const emprestimos = loans.filter(

l=>l.clientName===contact.name

);


// ===== ULTIMA ATIVIDADE

let diasSemContato=999;

const ultAtividade = activities

.filter(a=>a.contactId===contact.id)

.sort((a,b)=>

new Date(b.createdAt)-new Date(a.createdAt)

)[0];

if(ultAtividade){

const hoje=new Date();

const ult=new Date(ultAtividade.createdAt);

diasSemContato=Math.floor(

(hoje-ult)/(1000*60*60*24)

);

}



// ===== SCORE CLIENTE

let score=30;

if(emprestimos.length) score+=30;

if(orcamentos.some(o=>o.status==="ACCEPTED")) score+=30;

if(orcamentos.some(o=>o.status==="PENDING")) score+=15;

if(diasSemContato>30) score-=10;

if(score>100)score=100;



// ===== TEMPERATURA

let temp="frio";

if(score>=70) temp="quente";
else if(score>=50) temp="morno";



// ===== CONTEXTO

let contexto="novo lead";

const accepted = orcamentos.find(o=>o.status==="ACCEPTED");

const pending = orcamentos.find(o=>o.status==="PENDING");

if(emprestimos.length){

contexto="cliente possui contrato ativo";

}

else if(accepted){

contexto=`já realizou ${accepted.items?.[0]?.description||"serviço"} conosco`;

}

else if(pending){

contexto=`orçamento pendente ${pending.items?.[0]?.description||""}`;

}



// ===== FOLLOWUP AUTOMATICO

let followup="";

if(diasSemContato>20){

followup="cliente está há muito tempo sem contato.";

}



// ===== PROMPT CEO

const prompt=`

Você é especialista em relacionamento premium brasileiro.

Empresa:

${settings.companyName}

Cliente:

${contact.name}

Contexto:

${contexto}

Temperatura:

${temp}

Score:

${score}

${followup}

Crie UMA mensagem WhatsApp:

Profissional.
Curta.
Tom CEO.
Venda sem parecer venda.
Sem emoji.

`;

const msg = await gemini(prompt);

res.json({

message: msg || "Gostaria de saber se posso ajudar em algo hoje.",
score,
temperatura:temp,
diasSemContato

});

}catch(e){

console.log(e);

res.status(500).json({

message:"erro IA"

});

}

});



const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{

console.log("🔥 APOCALIPSE CEO RODANDO");

});