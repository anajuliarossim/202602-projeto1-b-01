// Central de Faturas: apenas as funções desta tela.
// O cabeçalho e o rodapé continuam no template.js do grupo.

import { buscarFaturasDoCliente } from './api.js';
import { formatarSaldoCheckin, lerSaldoCheckin } from './saldo-checkin.js';

// Atalho para encontrar elementos do HTML pelo ID.
function pegar(id) {
  return document.getElementById(id);
}

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function dataCompleta(data) {
  if (!data) return '--/--/----';
  return data.split('-').reverse().join('/');
}

// Na fatura mostramos 18/10, igual à Home.
function dataCurta(data) {
  if (!data) return '--/--';

  const partes = data.split('-');
  return `${partes[2]}/${partes[1]}`;
}

function estaPaga(fatura) {
  return fatura.status === 'paga' || fatura.status === 'pago';
}

function nomeMes(referencia) {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [ano, mes] = referencia.split('-').map(Number);
  return `${meses[mes - 1]} ${ano}`;
}

let faturas = [];
let faturaAtual = null;
let filtroAtual = 'todas';
let metodoAtual = 'pix';
let descontoAtivo = false;

function atualizarValores() {
  if (!faturaAtual) return;

  const saldo = lerSaldoCheckin();
  const podeDescontar = faturaAtual.status === 'aberta';
  const desconto = descontoAtivo && podeDescontar
    ? Math.min(saldo, faturaAtual.valor)
    : 0;

  const total = Math.max(0, faturaAtual.valor - desconto);

  pegar('saldoCheckin').textContent = formatarSaldoCheckin(saldo);
  pegar('valorFatura').textContent = dinheiro(total);
  pegar('totalPagar').textContent = dinheiro(total);
  pegar('descontoCheckin').textContent = `- ${dinheiro(desconto)}`;
  pegar('linhaDescontoCheckin').hidden = desconto === 0;
  
  const botao = pegar('aplicarDesconto');

    botao.disabled = !podeDescontar || (saldo === 0 && !descontoAtivo);

    if (desconto > 0) {
      botao.textContent = 'Remover desconto';
    } else {
      botao.textContent = 'Aplicar desconto';
    }
}

function mostrarFatura(fatura) {
  faturaAtual = fatura;

  const detalhes = fatura.detalhamento || {};
  const consumo = Number(detalhes.consumoKwh || 0);
  const [ano, mes] = fatura.referencia.split('-').map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const mesTexto = String(mes).padStart(2, '0');

  pegar('instalacaoNumero').value = fatura.instalacao || '30014365849';
  pegar('statusFatura').textContent = estaPaga(fatura) ? 'Paga' : 'Em aberto';
  pegar('vencimento').textContent = dataCurta(fatura.vencimento);
  pegar('economiaValor').textContent = dinheiro(fatura.economia);

  pegar('consumoKwh').textContent = `${consumo} kWh`;
  pegar('tarifaKwh').textContent = consumo
    ? dinheiro(detalhes.energia / consumo)
    : '—';
  pegar('periodo').textContent = `01/${mesTexto} - ${ultimoDia}/${mesTexto}`;

  pegar('valorEnergia').textContent = dinheiro(detalhes.energia);
  pegar('valorImpostos').textContent = dinheiro(detalhes.impostos);
  pegar('valorIluminacao').textContent = dinheiro(detalhes.iluminacaoPublica);
  pegar('descontoBulbe').textContent = `- ${dinheiro(detalhes.descontoBulbe)}`;

  atualizarValores();
}

// Cria uma linha do histórico sem escrever as faturas no HTML.
function criarLinha(fatura) {
  const linha = document.createElement('article');
  linha.className = 'linha-historico';

  const informacoes = document.createElement('div');
  const mes = document.createElement('strong');
  const data = document.createElement('small');
  const situacao = document.createElement('span');
  const valor = document.createElement('strong');

  mes.textContent = nomeMes(fatura.referencia);
  data.textContent = estaPaga(fatura)
    ? `Paga em ${dataCompleta(fatura.pagaEm)}`
    : `Vence em ${dataCompleta(fatura.vencimento)}`;
  situacao.textContent = estaPaga(fatura) ? 'Paga' : 'Pendente';
  situacao.className = estaPaga(fatura) ? 'paga' : 'pendente';
  valor.textContent = dinheiro(fatura.valor);

  informacoes.append(mes, data, situacao);
  linha.append(informacoes, valor);

  return linha;
}

function mostrarHistorico() {
  const lista = pegar('listaFaturas');
  lista.replaceChildren();

  const visiveis = faturas.filter(function (fatura) {
    if (filtroAtual === 'todas') return true;
    if (filtroAtual === 'pagas') return estaPaga(fatura);
    return !estaPaga(fatura);
  });

  if (visiveis.length === 0) {
    lista.textContent = 'Nenhuma fatura encontrada.';
    return;
  }

  visiveis.forEach(function (fatura) {
    lista.append(criarLinha(fatura));
  });
}

// O pagamento real depende de uma rota no servidor do projeto.
// Em caso de falha, não mostramos a mensagem de indisponibilidade.
async function iniciarPagamento() {
  if (!faturaAtual || faturaAtual.status !== 'aberta') return;

  const botao = pegar('pagarAgora');
  botao.disabled = true;

  try {
    const resposta = await fetch('/api/pagamentos/iniciar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        faturaId: faturaAtual.id,
        metodo: metodoAtual,
        usarSaldoCheckin: descontoAtivo
      })
    });

    if (!resposta.ok) throw new Error('Checkout não configurado');

    const dados = await resposta.json();
    if (!dados.checkoutUrl) throw new Error('Checkout sem endereço');

    const destino = new URL(dados.checkoutUrl, location.origin);
    if (destino.protocol !== 'https:' && destino.origin !== location.origin) {
      throw new Error('Endereço de pagamento inseguro');
    }

    location.assign(destino.href);
  } catch (erro) {
    console.warn('Pagamento não iniciado:', erro);
    botao.disabled = false;
  }
}

  // Aplicar ou remover o desconto do check-in
pegar('aplicarDesconto').addEventListener('click', function () {

  if (!faturaAtual || faturaAtual.status !== 'aberta') {
    return;
  }

  if (lerSaldoCheckin() <= 0) {
    return;
  }

  descontoAtivo = !descontoAtivo;

  atualizarValores();

});

// Notificações do cabeçalho.
pegar('notificacoesBotao').addEventListener('click', function () {
  pegar('notificacoesPainel').hidden = !pegar('notificacoesPainel').hidden;
});

// Escolha entre Pix, boleto e cartão.
document.querySelectorAll('[data-metodo]').forEach(function (botao) {
  botao.addEventListener('click', function () {
    metodoAtual = botao.dataset.metodo;

    document.querySelectorAll('[data-metodo]').forEach(function (item) {
      item.classList.toggle('selecionada', item === botao);
      item.setAttribute('aria-pressed', String(item === botao));
    });

    const nomes = { pix: 'Pix', boleto: 'Boleto', cartao: 'Cartão' };
    pegar('pagarAgora').textContent = `Pagar com ${nomes[metodoAtual]}`;
  });
});

// Filtros do histórico.
document.querySelectorAll('[data-filtro]').forEach(function (botao) {
  botao.addEventListener('click', function () {
    filtroAtual = botao.dataset.filtro;

    document.querySelectorAll('[data-filtro]').forEach(function (item) {
      item.classList.toggle('ativo', item === botao);
    });

    mostrarHistorico();
  });
});

pegar('pagarAgora').addEventListener('click', iniciarPagamento);
window.addEventListener('pageshow', atualizarValores);
window.addEventListener('storage', atualizarValores);

// Carrega as faturas do cliente de demonstração.
try {
  faturas = await buscarFaturasDoCliente(3);
  faturas.sort((a, b) => b.referencia.localeCompare(a.referencia));

  const aberta = faturas.find(fatura => fatura.status === 'aberta');
  const escolhida = aberta || faturas[0];

  if (escolhida) mostrarFatura(escolhida);
  mostrarHistorico();
} catch (erro) {
  console.error('Erro ao carregar faturas:', erro);
  pegar('listaFaturas').textContent = 'Não foi possível carregar as faturas. Abra pelo Live Server.';
}
