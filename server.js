import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// =====================
// SAUDE
// =====================

app.get("/saude",(req,res)=>{

res.send("Backend CEO ONLINE");

});


// =====================
// IA GEMINI CEO
// =====================

async function gerarIA(prompt){

try{

const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API}`,

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

]

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



// =====================
// CFO CEO MODE
// =====================

app.post("/api/insight",async(req,res)=>{

try{

const {

transactions=[],
settings={},
loans=[]

}=req.body;


// normaliza texto

function tipo(t){

return String(t||"")

.toLowerCase()

.normalize("NFD")

.replace(/[\u0300-\u036f]/g,"");

}


// receitas

const receitas = transactions

.filter(t=>{

const tp=tipo(t.type);

return(

tp.includes("income")||
tp.includes("receita")||
tp.includes("entrada")||
tp.includes("ganho")||
tp.includes("credito")

);

})

.reduce((a,b)=>a+Number(b.amount||0),0);


// despesas

const despesas = transactions

.filter(t=>{

const tp=tipo(t.type);

return(

tp.includes("expense")||
tp.includes("despesa")||
tp.includes("saida")||
tp.includes("gasto")

);

})

.reduce((a,b)=>a+Number(b.amount||0),0);



const saldo = receitas - despesas;

const previsao90dias = saldo - ((despesas/30)*90);


// score CEO

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


// PROMPT CEO

const prompt = `

Você é um CFO executivo de grandes empresas brasileiras.

Responda EXTREMAMENTE PROFISSIONAL.

SEM markdown.
SEM **.
SEM emojis.
SEM textos longos.

Máximo 3 frases.

Empresa:

${settings.companyName || "Empresa"}

Receita:

${receitas}

Despesas:

${despesas}

Saldo:

${saldo}

Score:

${score}

Risco:

${risco}

Faça análise executiva direta.

`;

const resposta = await gerarIA(prompt);


// fallback CEO

const fallback =

`Fluxo financeiro ${risco}. Score ${score}/100. Priorize aumento de receita e redução de custos.`;


res.json({

result:resposta || fallback,

receitas,
despesas,
saldo,
score,
risco

});

}catch(e){

console.log(e);

res.status(500).json({

result:"Erro CFO"

});

}

});


// =====================

const PORT=process.env.PORT||5000;

app.listen(PORT,()=>{

console.log("CEO MODE ONLINE");

});