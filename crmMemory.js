export function gerarMemoriaCliente(contact,budgets,loans,activities){

const orcamentos = budgets.filter(

b=> b.cpfNormalized === contact.cpfNormalized ||
b.clientName === contact.name

);

const emprestimos = loans.filter(

l=> l.cpfNormalized === contact.cpfNormalized ||
l.clientName === contact.name

);

const historico = activities
.filter(a=>a.contactId===contact.id)
.slice(-5)
.map(a=>a.description)
.join(",");


// SCORE LEAD

let scoreLead = 50;

if(emprestimos.length>0) scoreLead+=30;

if(orcamentos.some(o=>o.status==="ACCEPTED")) scoreLead+=20;

if(orcamentos.some(o=>o.status==="PENDING")) scoreLead+=10;

if(scoreLead>100) scoreLead=100;


// TEMPERATURA

let temperatura="frio";

if(scoreLead>70) temperatura="quente";
else if(scoreLead>50) temperatura="morno";

return{

orcamentos,
emprestimos,
historico,
scoreLead,
temperatura

};

}