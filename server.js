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
// IA MULTI MODELO
// =======================

async function gerarIA(prompt){

const HF_API = process.env.HF_API;

const modelos=[

"google/flan-t5-large",
"HuggingFaceH4/zephyr-7b-beta"

];

for(const modelo of modelos){

try{

const response = await fetch(

`https://api-inference.huggingface.co/models/${modelo}`,

{

method:"POST",

headers:{

Authorization:`Bearer ${HF_API}`,

"Content-Type":"application/json"

},

body:JSON.stringify({

inputs:prompt

})

}

);

const data = await response.json();

console.log("HF:",modelo,data);

if(data?.error){

continue;

}

if(Array.isArray(data)){

return data[0]?.generated_text;

}

if(data.generated_text){

return data.generated_text;

}

}catch(e){

console.log(e);

}

}

return null;

}

// =======================
// INSIGHT CFO PROFISSIONAL
// =======================

app.post("/api/insight", async (req,res)=>{

try{

const {

transactions=[],
budgets=[],
loans=[],
settings={}

}=req.body;


// CALCULOS

const receitas = transactions
.filter(t=>t.type==="income")
.reduce((a,b)=>a+(b.amount||0),0);

const despesas = transactions
.filter(t=>t.type==="expense")
.reduce((a,b)=>a+(b.amount||0),0);

const saldoAtual = receitas - despesas;


// previsão simples

const mediaDespesa = despesas/30;

const previsao30dias = saldoAtual - (mediaDespesa*30);


// risco

let risco="baixo";

if(previsao30dias <0){

risco="alto";

}else if(previsao30dias < saldoAtual*0.3){

risco="medio";

}


// PROMPT CFO

const prompt = `

Você é um CFO especialista financeiro empresarial.

Empresa:

${settings.companyName || "Empresa"}

Receitas:

${receitas}

Despesas:

${despesas}

Saldo atual:

${saldoAtual}

Previsão 30 dias:

${previsao30dias}

Risco financeiro:

${risco}

Créditos:

${JSON.stringify(loans)}

Orçamentos:

${JSON.stringify(budgets)}

Analise e responda:

1 Situação financeira atual.

2 Maior erro financeiro detectado.

3 Risco de caixa.

4 Melhor ação HOJE.

Resposta curta direta profissional.

`;

const resposta = await gerarIA(prompt);

res.json({

result:

resposta ||

`Empresa ${settings.companyName || ""} apresenta risco ${risco}. 
Revise despesas fixas imediatamente e fortaleça fluxo de caixa semanal.`

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