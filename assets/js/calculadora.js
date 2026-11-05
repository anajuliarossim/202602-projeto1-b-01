/* Calculadora de economia Bulbe: fluxo do app e fluxo inicial. */
'use strict';

/* ---------- Premissas: ajuste só aqui ---------- */
const CONFIG = {
  // R$/kWh sem tributos (TE + TUSD), Cemig B1 residencial.
  // Base: fatura de mar/2026 (0,85858) com o reajuste de 5,21% projetado para B1.
  // Confirme o valor homologado pela Aneel/Cemig antes de publicar.
  tarifaSemTributos: 0.9033,
  bandeira: 0,              // R$/kWh adicional. Verde = 0. Amarela ≈ 0,01885
  bandeiraNome: 'verde',
  icms: 0.18,               // MG, residencial
  pisCofins: 0.0574,        // varia mês a mês na fatura
  descontoMax: 0.15,        // "desconto de até 15%"
  pontosGrafico: 6,
  limites: { meses: 120, consumo: 100000 },
};

const CHAVE = 'bulbe:simulacao';
const PAGINAS = {
  calculadora: 'Calculadora.html',
  consumo: 'Consumo.html',
};

/* ---------- Formatação ---------- */
const fmtNum = (v) => Math.round(v).toLocaleString('pt-BR');
const fmtKwh = (v) => `${fmtNum(v)} kWh`;
const fmtBRL = (v, casas = 2) =>
  v.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: casas, maximumFractionDigits: casas,
  });
const rotuloMeses = (m) => `${m} ${m === 1 ? 'mês' : 'meses'}`;
const pct = (v) => (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/* ---------- Armazenamento entre telas ---------- */
function salvar(dados) {
  try { sessionStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) { /* ignora */ }
}
function ler() {
  try {
    const d = JSON.parse(sessionStorage.getItem(CHAVE));
    return d && d.meses >= 1 && d.consumo >= 1 ? d : null;
  } catch (e) { return null; }
}

/* ---------- Cálculo ---------- */
function calcular({ consumo, meses }) {
  // O ICMS e o PIS/COFINS incidem "por dentro": o imposto faz parte do preço final.
  const aliquota = CONFIG.icms + CONFIG.pisCofins;
  const tarifaFinal = (CONFIG.tarifaSemTributos + CONFIG.bandeira) / (1 - aliquota);
  const faturaMes = consumo * tarifaFinal;
  const economiaMes = faturaMes * CONFIG.descontoMax;
  return {
    tarifaFinal,
    faturaComDescontoMes: faturaMes - economiaMes,
    economiaMes,
    economiaTotal: economiaMes * meses,
    consumoTotal: consumo * meses,
  };
}

// Divide o período em pontos (ex.: 12 meses -> 2, 4, 6, 8, 10, 12)
function marcosDoPeriodo(meses, qtd) {
  const n = Math.min(qtd, meses);
  return Array.from({ length: n }, (_, i) => Math.max(1, Math.round((meses * (i + 1)) / n)));
}

/* ---------- Tela: calculadora (HU02.html) ---------- */
function iniciarCalculadora(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const meses = form.elements.tempo.valueAsNumber;
    const consumo = form.elements.consumo.valueAsNumber;
    const { limites } = CONFIG;

    const valido =
      meses >= 1 && meses <= limites.meses &&
      consumo >= 1 && consumo <= limites.consumo;
    if (!valido) { form.reportValidity(); return; }

    salvar({ meses: Math.round(meses), consumo });
    window.location.href = form.dataset.destino || PAGINAS.consumo;
  });
}

/* ---------- Telas: consumo e economia ---------- */
function preencher(mapa) {
  Object.entries(mapa).forEach(([campo, texto]) => {
    document.querySelectorAll(`[data-campo="${campo}"]`).forEach((el) => {
      el.textContent = texto;
    });
  });
}

function desenharGrafico(valores, rotulos, formatar) {
  const grafico = document.getElementById('grafico');
  const eixo = document.getElementById('rotulos');
  if (!grafico || !eixo) return;

  const max = Math.max(...valores);
  grafico.replaceChildren(...valores.map((v) => {
    const col = document.createElement('div');
    col.className = 'col';
    const barra = document.createElement('div');
    barra.className = 'b';
    barra.style.setProperty('--h', `${(v / max) * 100}%`);
    barra.dataset.v = formatar(v);
    col.append(barra);
    return col;
  }));
  eixo.replaceChildren(...rotulos.map((r) => {
    const s = document.createElement('span');
    s.textContent = r;
    return s;
  }));
}

function textoPremissas(r) {
  return `Estimativa com tarifa de ${fmtBRL(r.tarifaFinal, 4)}/kWh ` +
    `(inclui ICMS de ${pct(CONFIG.icms)}% e PIS/COFINS de ${pct(CONFIG.pisCofins)}%), ` +
    `bandeira ${CONFIG.bandeiraNome} e desconto de até ${pct(CONFIG.descontoMax)}%. ` +
    'Não inclui iluminação pública nem custo de disponibilidade. Valores sujeitos a alteração.';
}

function iniciarResultado(tela) {
  const dados = ler();
  if (!dados) {
    window.location.replace(PAGINAS.calculadora);
    return;
  }

  const r = calcular(dados);
  const marcos = marcosDoPeriodo(dados.meses, CONFIG.pontosGrafico);
  const rotulos = marcos.map((m) => `${m}m`);

  if (tela === 'consumo') {
    preencher({
      titulo: `Seu consumo em ${rotuloMeses(dados.meses)}`,
      valor1: fmtKwh(dados.consumo),
      valor2: fmtKwh(r.consumoTotal),
      valor3: rotuloMeses(dados.meses),
    });
    desenharGrafico(marcos.map((m) => dados.consumo * m), rotulos, fmtNum);
  } else {
    preencher({
      titulo: `Sua economia em ${rotuloMeses(dados.meses)}`,
      valor1: fmtBRL(r.economiaMes),
      valor2: fmtBRL(r.economiaTotal),
      valor3: fmtBRL(r.faturaComDescontoMes),
    });
    desenharGrafico(marcos.map((m) => r.economiaMes * m), rotulos, (v) => fmtBRL(v, 0));
  }
  preencher({ premissas: textoPremissas(r) });
}

/* ---------- Carrossel dos cartões ---------- */
function iniciarCarrossel() {
  const trilho = document.querySelector('.resumo');
  const pontos = document.getElementById('pontos');
  if (!trilho || !pontos) return;

  const cards = [...trilho.children];
  const margem = parseFloat(getComputedStyle(trilho).paddingLeft) || 0;

  const botoes = cards.map((card, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Ver cartão ${i + 1} de ${cards.length}`);
    b.addEventListener('click', () =>
      card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' }));
    return b;
  });
  pontos.replaceChildren(...botoes);

  const marcar = () => {
    const base = trilho.getBoundingClientRect().left + margem;
    let ativo = 0, menor = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.getBoundingClientRect().left - base);
      if (d < menor) { menor = d; ativo = i; }
    });
    // No fim da rolagem, o último cartão não chega ao início: marca ele
    if (trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 2) ativo = cards.length - 1;
    botoes.forEach((b, i) => b.setAttribute('aria-current', String(i === ativo)));
  };

  trilho.addEventListener('scroll', marcar, { passive: true });
  marcar();
}

/* ---------- Inicialização compartilhada ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCalculadora');
  if (form) {
    iniciarCalculadora(form);
    return;
  }

  const main = document.querySelector('main[data-tela]');
  if (main) {
    iniciarResultado(main.dataset.tela);
    iniciarCarrossel();
  }
});
