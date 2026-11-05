// HU03: apenas o comportamento da tela de faturas.
// Cabeçalho, menu e rodapé ficam no template.js do grupo.
import { buscarFaturasDoCliente } from './api.js';

const $ = id => document.getElementById(id);
const real = valor => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = data => data ? data.split('-').reverse().join('/') : '--/--';
const paga = fatura => fatura.status === 'paga' || fatura.status === 'pago';
const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
let faturas = [];
let atual = null;
let filtro = 'todas';
let metodo = 'pix';
let usarDesconto = false;

function nomeMes(referencia) {
  const [ano, mes] = referencia.split('-').map(Number);
  return `${meses[mes - 1] || 'Mês'} ${ano}`;
}