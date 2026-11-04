/* HU03 — Central de Faturas Bulbe.
 * Os dados são fictícios e vêm de data/faturas.json via API compartilhada.
 * Não há integração com sistemas reais de pagamento. */
'use strict';

import { buscarFaturasDoCliente } from './api.js';

const CLIENTE_DEMONSTRACAO = 3;
const VALOR = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const estado = {faturas: [], filtro: 'todas'};
const $ = (id) => document.getElementById(id);

function moeda(valor) {return VALOR.format(Number(valor) || 0);}
function mesReferencia(iso) {
  const [ano, mes] = String(iso || '').split('-').map(Number);
  if (!ano || !mes || mes > 12) return 'Período indisponível';
  return `${MESES[mes - 1][0].toUpperCase()}${MESES[mes - 1].slice(1)} ${ano}`;
}
function diaMes(iso) {
  const partes = String(iso || '').split('-');
  const dia = Number(partes[2]);
  const mes = Number(partes[1]);
  return dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12 ? `${dia} de ${MESES[mes - 1]}` : 'Não informado';
}
function paga(fatura) {return fatura.status === 'paga' || fatura.status === 'pago';}
function campo(id, valor) {$(id).textContent = valor;}

function preencherAtual(fatura) {
  const itens = fatura.detalhamento || {};
  campo('hu03-installation-number', fatura.instalacao || 'Não informada');
  campo('hu03-status', paga(fatura) ? 'paga' : fatura.status === 'prevista' ? 'prevista' : 'em aberto');
  campo('hu03-due-date', diaMes(fatura.vencimento));
  campo('hu03-total-current', moeda(fatura.valor));
  campo('hu03-breakdown-total', moeda(fatura.valor));
  campo('hu03-savings-value', moeda(fatura.economia));
  campo('hu03-energy-kwh', Number(itens.consumoKwh || 0).toLocaleString('pt-BR'));
  campo('hu03-energy-cost', moeda(itens.energia));
  campo('hu03-taxes', moeda(itens.impostos));
  campo('hu03-lighting', moeda(itens.iluminacaoPublica));
  campo('hu03-discount', `−${moeda(itens.descontoBulbe)}`);
  // Informa se o registro demonstrativo não fecha matematicamente.
  const soma = Number(itens.energia || 0) + Number(itens.impostos || 0)
    + Number(itens.iluminacaoPublica || 0) - Number(itens.descontoBulbe || 0);
  const explicacao = document.querySelector('.hu03-breakdown-explain');
  if (Object.keys(itens).length && Math.abs(soma - Number(fatura.valor)) > 0.011) {
    explicacao.textContent = 'Os valores demonstrativos desta fatura precisam de conferência.';
  } else {
    explicacao.textContent = 'O desconto Bulbe é subtraído dos demais valores para chegar ao total desta conta.';
  }
}

function elemento(tag, classe, conteudo) {
  const node = document.createElement(tag);
  if (classe) node.className = classe;
  if (conteudo !== undefined) node.textContent = conteudo;
  return node;
}
function criarLinha(fatura) {
  const linha = elemento('article', 'hu03-history-row');
  const icone = elemento('span', 'hu03-history-icon');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'hu03-icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#hu03-icon-calendar');
  svg.append(use); icone.append(svg);

  const infos = elemento('div', 'hu03-history-main');
  infos.append(elemento('strong', null, mesReferencia(fatura.referencia)));
  infos.append(elemento('small', null,
    paga(fatura) && fatura.pagaEm
      ? `Pago em ${diaMes(fatura.pagaEm)}`
      : `Vence em ${diaMes(fatura.vencimento)}`));
  const status = elemento('span', `hu03-history-status${paga(fatura) ? ' is-paid' : ''}`, paga(fatura) ? 'Paga' : fatura.status === 'prevista' ? 'Prevista' : 'Pendente');
  infos.append(status);
  const valor = elemento('strong', 'hu03-history-value', moeda(fatura.valor));
  linha.append(icone, infos, valor);
  return linha;
}
function renderizarHistorico() {
  const lista = $('hu03-history-list');
  const visiveis = estado.faturas.filter((fatura) =>
    estado.filtro === 'todas' || (estado.filtro === 'pagas' ? paga(fatura) : !paga(fatura))
  );
  lista.replaceChildren();
  if (!visiveis.length) {
    lista.append(elemento('p', 'hu03-history-empty', 'Nenhuma fatura encontrada neste filtro.'));
    return;
  }
  visiveis.forEach((fatura) => lista.append(criarLinha(fatura)));
}

function configurarInteracoes() {
  function alternarPainel(botaoId, painelId, concorrenteId, concorrentePainelId) {
    const botao = $(botaoId);
    const painel = $(painelId);
    botao.addEventListener('click', () => {
      const abrir = botao.getAttribute('aria-expanded') !== 'true';
      botao.setAttribute('aria-expanded', String(abrir));
      painel.hidden = !abrir;
      if (abrir) {
        $(concorrenteId).setAttribute('aria-expanded','false');
        $(concorrentePainelId).hidden = true;
      }
    });
  }
  alternarPainel('hu03-menu-button','hu03-quick-menu','hu03-notification-button','hu03-notifications');
  alternarPainel('hu03-notification-button','hu03-notifications','hu03-menu-button','hu03-quick-menu');
  const instalacao = $('hu03-installation-button');
  const informacao = $('hu03-installation-info');
  instalacao.addEventListener('click', () => {
    const abrir = instalacao.getAttribute('aria-expanded') !== 'true';
    instalacao.setAttribute('aria-expanded', String(abrir));
    informacao.hidden = !abrir;
  });

  const descricoes = {
    pix: 'Pix selecionado. Esta é apenas uma demonstração: nenhum QR Code ou cobrança real será gerado.',
    boleto: 'Boleto selecionado. Esta é apenas uma demonstração: nenhum boleto real será emitido.',
    cartao: 'Cartão selecionado. Esta é apenas uma demonstração: nenhum dado de cartão será solicitado.'
  };
  document.querySelectorAll('.hu03-method').forEach((botao) => {
    botao.addEventListener('click', () => {
      document.querySelectorAll('.hu03-method').forEach((outro) =>
        outro.setAttribute('aria-pressed', String(outro === botao))
      );
      campo('hu03-payment-feedback', descricoes[botao.dataset.payment]);
    });
  });
  document.querySelectorAll('.hu03-tab').forEach((aba) => {
    aba.addEventListener('click', () => {
      estado.filtro = aba.dataset.filter;
      document.querySelectorAll('.hu03-tab').forEach((outra) =>
        outra.setAttribute('aria-selected', String(outra === aba))
      );
      renderizarHistorico();
    });
  });
}

async function iniciar() {
  configurarInteracoes();
  try {
    const dados = await buscarFaturasDoCliente(CLIENTE_DEMONSTRACAO);
    estado.faturas = dados.sort((a, b) => String(b.referencia).localeCompare(String(a.referencia)));
    const atual = estado.faturas.find((fatura) => fatura.status === 'aberta') || estado.faturas[0];
    if (atual) preencherAtual(atual);
    renderizarHistorico();
  } catch (erro) {
    console.error('HU03: erro ao carregar dados de demonstração:', erro);
    $('hu03-history-list').replaceChildren(elemento('p', 'hu03-history-empty', 'Não foi possível carregar as faturas. Abra o projeto pelo Live Server e tente novamente.'));
  }
}

iniciar();
