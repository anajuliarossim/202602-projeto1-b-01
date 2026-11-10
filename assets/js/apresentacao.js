const telas = [
  { grupo: "Começar", nome: "Boas-vindas", arquivo: "Acesso.html" },
  { grupo: "Começar", nome: "Entrar na conta", arquivo: "Entrar.html" },
  { grupo: "Começar", nome: "Cadastro: dados pessoais", arquivo: "Cadastro1.html" },
  { grupo: "Começar", nome: "Cadastro: endereço", arquivo: "Cadastro2.html" },
  { grupo: "Começar", nome: "Cadastro: instalação", arquivo: "Cadastro3.html" },
  { grupo: "Começar", nome: "Criar senha", arquivo: "CadastroSenha.html" },
  { grupo: "Conhecer a Bulbe", nome: "Onboarding: boas-vindas", arquivo: "Onboarding-1.html" },
  { grupo: "Conhecer a Bulbe", nome: "Onboarding: conta de luz", arquivo: "Onboarding-2.html" },
  { grupo: "Conhecer a Bulbe", nome: "Onboarding: economia mensal", arquivo: "Onboarding-3.html" },
  { grupo: "Conhecer a Bulbe", nome: "Onboarding: consumo", arquivo: "Onboarding-4.html" },
  { grupo: "Conhecer a Bulbe", nome: "Onboarding: seu desconto", arquivo: "Onboarding-5.html" },
  { grupo: "Conhecer a Bulbe", nome: "Onboarding: indique e ganhe", arquivo: "Onboarding-6.html" },
  { grupo: "Conhecer a Bulbe", nome: "Check-in diário", arquivo: "Checkin.html" },
  { grupo: "Conhecer a Bulbe", nome: "Mapa de pertencimento", arquivo: "Mapa.html" },
  { grupo: "Conhecer a Bulbe", nome: "Conexão informativa", arquivo: "Blog.html" },
  { grupo: "Área do cliente", nome: "Início", arquivo: "Home.html" },
  { grupo: "Área do cliente", nome: "Calculadora inicial", arquivo: "Calculadora_Inicial.html" },
  { grupo: "Área do cliente", nome: "Calculadora de economia", arquivo: "Calculadora.html" },
  { grupo: "Área do cliente", nome: "Resultado de consumo", arquivo: "Consumo.html" },
  { grupo: "Área do cliente", nome: "Consumo do cliente", arquivo: "Consumo_Cliente.html" },
  { grupo: "Área do cliente", nome: "Resultado da economia", arquivo: "Economia.html" },
  { grupo: "Área do cliente", nome: "Economia do cliente", arquivo: "Economia_Cliente.html" },
  { grupo: "Área do cliente", nome: "Faturas", arquivo: "Fatura.html" },
  { grupo: "Área do cliente", nome: "Informações do cartão", arquivo: "Cartão.html" },
  { grupo: "Outras telas", nome: "Exemplo de página", arquivo: "exemplo.html" }
];

const listaTelas = document.querySelector("#lista-telas");
const iframe = document.querySelector("#tela-ativa");
const tituloSlide = document.querySelector("#titulo-slide");
const etapaSlide = document.querySelector("#etapa-slide");
const contadorSlide = document.querySelector("#contador-slide");
const seletorTela = document.querySelector("#seletor-tela");
const botaoAnterior = document.querySelector("#tela-anterior");
const botaoProxima = document.querySelector("#proxima-tela");
const linkNovaAba = document.querySelector("#abrir-tela");
const botaoTelaCheia = document.querySelector("#tela-cheia");
const slide = document.querySelector("#slide");

let indiceAtivo = 0;
const botoesTelas = [];

function selecionarTela(indice, recarregar = true) {
  if (!Number.isInteger(indice) || indice < 0 || indice >= telas.length) {
    return;
  }

  indiceAtivo = indice;
  const tela = telas[indice];

  tituloSlide.textContent = tela.nome;
  etapaSlide.textContent = tela.grupo;
  contadorSlide.textContent = `${String(indice + 1).padStart(2, "0")} / ${String(telas.length).padStart(2, "0")}`;
  botaoAnterior.disabled = indice === 0;
  botaoProxima.disabled = indice === telas.length - 1;
  linkNovaAba.href = tela.arquivo;
  iframe.title = `Tela interativa: ${tela.nome}`;
  seletorTela.value = String(indice);

  botoesTelas.forEach((botao, numero) => {
    if (numero === indice) {
      botao.setAttribute("aria-current", "true");
    } else {
      botao.removeAttribute("aria-current");
    }
  });

  if (recarregar && iframe.getAttribute("src") !== tela.arquivo) {
    iframe.src = tela.arquivo;
  }
}

function criarNavegacao() {
  const grupos = new Map();

  telas.forEach((tela, indice) => {
    if (!grupos.has(tela.grupo)) {
      const secao = document.createElement("section");
      const titulo = document.createElement("h2");
      const lista = document.createElement("div");
      const opcoes = document.createElement("optgroup");
      secao.className = "grupo-telas";
      lista.className = "itens-grupo";
      titulo.textContent = tela.grupo;
      opcoes.label = tela.grupo;
      secao.append(titulo, lista);
      listaTelas.append(secao);
      seletorTela.append(opcoes);
      grupos.set(tela.grupo, { lista, opcoes });
    }

    const opcao = document.createElement("option");
    opcao.value = String(indice);
    opcao.textContent = `${String(indice + 1).padStart(2, "0")} · ${tela.nome}`;
    grupos.get(tela.grupo).opcoes.append(opcao);

    const botao = document.createElement("button");
    const numero = document.createElement("span");
    const nome = document.createElement("span");
    botao.className = "item-tela";
    botao.type = "button";
    botao.setAttribute("aria-label", `Tela ${indice + 1}: ${tela.nome}`);
    numero.className = "numero-tela";
    numero.setAttribute("aria-hidden", "true");
    numero.textContent = String(indice + 1).padStart(2, "0");
    nome.className = "nome-tela";
    nome.textContent = tela.nome;
    botao.append(numero, nome);
    botao.addEventListener("click", () => selecionarTela(indice));
    grupos.get(tela.grupo).lista.append(botao);
    botoesTelas.push(botao);
  });
}

botaoAnterior.addEventListener("click", () => selecionarTela(indiceAtivo - 1));
botaoProxima.addEventListener("click", () => selecionarTela(indiceAtivo + 1));
seletorTela.addEventListener("change", () => selecionarTela(Number(seletorTela.value)));

function navegarComTeclado(evento) {
  const alvo = evento.target;
  const digitando = alvo && (alvo.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName));

  if (digitando || evento.altKey || evento.ctrlKey || evento.metaKey) {
    return;
  }

  if (evento.key === "ArrowLeft" && indiceAtivo > 0) {
    evento.preventDefault();
    selecionarTela(indiceAtivo - 1);
  } else if (evento.key === "ArrowRight" && indiceAtivo < telas.length - 1) {
    evento.preventDefault();
    selecionarTela(indiceAtivo + 1);
  }
}

document.addEventListener("keydown", navegarComTeclado);

iframe.addEventListener("load", () => {
  try {
    iframe.contentWindow.addEventListener("keydown", navegarComTeclado);
    const nomeArquivo = decodeURIComponent(new URL(iframe.contentWindow.location.href).pathname.split("/").pop());
    const indiceDaTela = telas.findIndex((tela) => tela.arquivo === nomeArquivo);

    if (indiceDaTela !== -1 && indiceDaTela !== indiceAtivo) {
      selecionarTela(indiceDaTela, false);
    }
  } catch (erro) {
    console.error("Não foi possível sincronizar a tela atual da apresentação.", erro);
  }
});

botaoTelaCheia.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement === slide) {
      await document.exitFullscreen();
      botaoTelaCheia.setAttribute("aria-label", "Abrir apresentação em tela cheia");
    } else {
      await slide.requestFullscreen();
      botaoTelaCheia.setAttribute("aria-label", "Sair da tela cheia");
    }
  } catch (erro) {
    console.error("Não foi possível abrir a apresentação em tela cheia.", erro);
  }
});

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement !== slide) {
    botaoTelaCheia.setAttribute("aria-label", "Abrir apresentação em tela cheia");
  }
});

criarNavegacao();
selecionarTela(0);
