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

// O checkin.js do grupo salva uma data por check-in, valendo R$ 0,50.
function lerSaldo() {
  try {
    const dias = JSON.parse(localStorage.getItem('bulbe-checkins-diarios') || '[]');
    if (!Array.isArray(dias) || !dias.every(d => /^\d{4}-\d{2}-\d{2}$/.test(d))) return 0;
    return new Set(dias.slice(-90)).size * 0.50;
  } catch {
    return 0;
  }
}

function atualizarValores() {
  if (!atual) return;
  const saldo = lerSaldo();
  const aberto = atual.status === 'aberta';
  const desconto = usarDesconto && aberto ? Math.min(saldo, atual.valor) : 0;
  const total = Math.max(0, atual.valor - desconto);

  $('saldoCheckin').textContent = real(saldo);
  $('valorFatura').textContent = real(total);
  $('totalPagar').textContent = real(total);
  $('descontoCheckin').textContent = `− ${real(desconto)}`;
  $('linhaDescontoCheckin').hidden = desconto === 0;
  $('aplicarDesconto').disabled = !aberto || saldo === 0;
  $('aplicarDesconto').textContent = usarDesconto && desconto ? 'Remover desconto' : 'Aplicar desconto';
  $('mensagemDesconto').textContent = desconto
    ? `${real(desconto)} selecionados. O servidor precisa validar o desconto na cobrança.`
    : saldo ? 'Você pode usar seu saldo nesta fatura.' : 'Faça check-ins para acumular descontos.';
}

function exibirFatura(fatura) {
  atual = fatura;
  const d = fatura.detalhamento || {};
  const kwh = Number(d.consumoKwh || 0);
  const [ano, mes] = fatura.referencia.split('-').map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();

  $('instalacaoNumero').value = fatura.instalacao || '30014365849';
  $('statusFatura').textContent = paga(fatura) ? 'Paga' : fatura.status === 'prevista' ? 'Prevista' : 'Em aberto';
  $('vencimento').textContent = dataBR(fatura.vencimento);
  $('economiaValor').textContent = real(fatura.economia);
  $('consumoKwh').textContent = `${kwh} kWh`;
  $('tarifaKwh').textContent = kwh ? real(Number(d.energia || 0) / kwh) : '—';
  $('periodo').textContent = `01/${String(mes).padStart(2, '0')} - ${ultimoDia}/${String(mes).padStart(2, '0')}`;
  $('valorEnergia').textContent = real(d.energia);
  $('valorImpostos').textContent = real(d.impostos);
  $('valorIluminacao').textContent = real(d.iluminacaoPublica);
  $('descontoBulbe').textContent = `− ${real(d.descontoBulbe)}`;
  $('pagarAgora').disabled = fatura.status !== 'aberta';
  atualizarValores();
}

function criarLinha(fatura) {
  const linha = document.createElement('article');
  linha.className = 'linha-historico';
  const nome = document.createElement('div');
  const valor = document.createElement('strong');
  const titulo = document.createElement('strong');
  const descricao = document.createElement('small');
  const situacao = document.createElement('span');

  titulo.textContent = nomeMes(fatura.referencia);
  descricao.textContent = paga(fatura) ? `Paga em ${dataBR(fatura.pagaEm)}` : `Vence em ${dataBR(fatura.vencimento)}`;
  situacao.textContent = paga(fatura) ? 'Paga' : 'Pendente';
  situacao.className = paga(fatura) ? 'paga' : 'pendente';
  valor.textContent = real(fatura.valor);
  nome.append(titulo, descricao, situacao);
  linha.append(nome, valor);
  return linha;
}

function exibirHistorico() {
  const lista = $('listaFaturas');
  lista.replaceChildren();
  const visiveis = faturas.filter(f => filtro === 'todas' ||
    (filtro === 'pagas' ? paga(f) : !paga(f)));
  if (!visiveis.length) {
    lista.textContent = 'Nenhuma fatura encontrada.';
    return;
  }
  visiveis.forEach(f => lista.append(criarLinha(f)));
}

// O projeto ainda não tem o serviço /api/pagamentos/iniciar.
// A interface não pode confirmar uma cobrança sem a resposta do servidor.
async function pagar() {
  if (!atual || atual.status !== 'aberta') return;
  const botao = $('pagarAgora');
  botao.disabled = true;
  $('mensagemPagamento').textContent = 'Conectando ao pagamento seguro...';
  try {
    const resposta = await fetch('/api/pagamentos/iniciar', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faturaId: atual.id, metodo, usarSaldoCheckin: usarDesconto && lerSaldo() > 0 })
    });
    if (!resposta.ok) throw new Error('Serviço indisponível');
    const dados = await resposta.json();
    if (typeof dados.checkoutUrl !== 'string' || !dados.checkoutUrl.trim()) {
      throw new Error('O servidor não informou um checkout válido');
    }
    const url = new URL(dados.checkoutUrl, location.origin);
    if (url.protocol !== 'https:' && url.origin !== location.origin) throw new Error('URL insegura');
    location.assign(url.href);
  } catch (erro) {
    console.error(erro);
    $('mensagemPagamento').textContent = 'Pagamento indisponível. Falta integrar o servidor de cobrança.';
    botao.disabled = false;
  }
}

$('aplicarDesconto').addEventListener('click', () => {
  usarDesconto = !usarDesconto;
  atualizarValores();
});

$('notificacoesBotao').addEventListener('click', () => {
  const painel = $('notificacoesPainel');
  painel.hidden = !painel.hidden;
  $('notificacoesBotao').setAttribute('aria-expanded', String(!painel.hidden));
});
$('abrirModal').addEventListener('click', () => {
  $('notificacoesPainel').hidden = true;
  $('notificacoesBotao').setAttribute('aria-expanded', 'false');
});

for (const botao of document.querySelectorAll('[data-metodo]')) {
  botao.addEventListener('click', () => {
    metodo = botao.dataset.metodo;
    for (const item of document.querySelectorAll('[data-metodo]')) {
      const selecionado = item === botao;
      item.classList.toggle('selecionada', selecionado);
      item.setAttribute('aria-pressed', String(selecionado));
    }
    const nomes = {pix: 'Pix', boleto: 'Boleto', cartao: 'Cartão'};
    $('pagarAgora').textContent = `Pagar com ${nomes[metodo]}`;
  });
}

for (const botao of document.querySelectorAll('[data-filtro]')) {
  botao.addEventListener('click', () => {
    filtro = botao.dataset.filtro;
    for (const item of document.querySelectorAll('[data-filtro]')) {
      item.classList.toggle('ativo', item === botao);
      item.setAttribute('aria-pressed', String(item === botao));
    }
    exibirHistorico();
  });
}

$('pagarAgora').addEventListener('click', pagar);
window.addEventListener('pageshow', atualizarValores);
window.addEventListener('storage', e => {
  if (e.key === 'bulbe-checkins-diarios') atualizarValores();
});

try {
  faturas = (await buscarFaturasDoCliente(3)).sort((a, b) => b.referencia.localeCompare(a.referencia));
  const faturaAtual = faturas.find(f => f.status === 'aberta') || faturas[0];
  if (faturaAtual) exibirFatura(faturaAtual);
  exibirHistorico();
} catch (erro) {
  console.error(erro);
  $('listaFaturas').textContent = 'Não foi possível carregar os dados. Use o Live Server.';
}
