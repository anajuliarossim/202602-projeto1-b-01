// template.js — menu lateral e navegação compartilhada (Início, Faturas, Consumo e Mapa).

const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const modal = document.getElementById("modalLateral");
const fundo = document.getElementById("fundoModal");

function mostrarModal() {
    if (!modal || !fundo) return;
    modal.classList.add("ativo");
    fundo.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
    if (abrirModal) abrirModal.setAttribute("aria-expanded", "true");
    if (fecharModal) fecharModal.focus();
}

function esconderModal() {
    if (!modal || !fundo) return;
    modal.classList.remove("ativo");
    fundo.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
    if (abrirModal) {
        abrirModal.setAttribute("aria-expanded", "false");
        abrirModal.focus();
    }
}

if (abrirModal) abrirModal.addEventListener("click", mostrarModal);
if (fecharModal) fecharModal.addEventListener("click", esconderModal);
if (fundo) fundo.addEventListener("click", esconderModal);

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && modal?.classList.contains("ativo")) {
        esconderModal();
    }
});

// A aba ativa é determinada pela página real, não pelo botão clicado anteriormente.
const nomePagina = decodeURIComponent(window.location.pathname.split("/").pop() || "").toLowerCase();
let abaAtual = null;

if (nomePagina === "mapa.html" || document.body.classList.contains("pagina-mapa")) {
    abaAtual = "btnMapa";
} else if (nomePagina === "fatura.html" || nomePagina === "faturas.html" || document.body.classList.contains("pagina-faturas")) {
    abaAtual = "btnFaturas";
} else if (/^(consumo|economia)(?:_cliente)?\.html$/.test(nomePagina)
        || /^calculadora(?:_inicial)?\.html$/.test(nomePagina)
        || document.querySelector('main[data-tela="consumo"], main[data-tela="economia"]')) {
    abaAtual = "btnConsumo";
} else if (document.body.classList.contains("pagina-home")
        || /^home(?:\(\d+\))?\.html$/.test(nomePagina)
        || nomePagina === "checkin.html") {
    abaAtual = "btnInicio";
}

const paginasFooter = {
    btnInicio: { destino: "Home.html", ativo: "../assets/img/Icone-Inicio-Azul.png" },
    btnFaturas: { destino: "Fatura.html", ativo: "../assets/img/Icone-Fatura-Azul.png" },
    btnConsumo: { destino: "Consumo_Cliente.html", ativo: "../assets/img/Icone-Consumo-Azul.png" },
    btnMapa: { destino: "Mapa.html", ativo: "../assets/img/Icone-Mapa-Azul.png" }
};

for (const [id, config] of Object.entries(paginasFooter)) {
    const botao = document.getElementById(id);
    if (!botao) continue;

    // Compatibilidade com outras páginas que ainda tenham apenas um ícone cinza.
    const imagens = Array.from(botao.querySelectorAll("img"));
    if (imagens.length === 1) {
        imagens[0].classList.add("icone-footer", "icone-cinza");
        const imagemAzul = document.createElement("img");
        imagemAzul.src = config.ativo;
        imagemAzul.alt = "";
        imagemAzul.className = "icone-footer icone-azul";
        botao.appendChild(imagemAzul);
    } else if (imagens.length >= 2) {
        imagens[0].classList.add("icone-footer", "icone-cinza");
        imagens[1].classList.add("icone-footer", "icone-azul");
    }

    const ativo = id === abaAtual;
    botao.classList.toggle("ativo", ativo);
    if (ativo) {
        botao.setAttribute("aria-current", "page");
    } else {
        botao.removeAttribute("aria-current");
    }

    botao.addEventListener("click", function() {
        if (id !== abaAtual) window.location.href = config.destino;
    });
}
