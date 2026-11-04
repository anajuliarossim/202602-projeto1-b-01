
const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const modal = document.getElementById("modalLateral");
const fundo = document.getElementById("fundoModal");
const btnInicio = document.getElementById("btnInicio");
const btnFaturas = document.getElementById("btnFaturas");
const btnConsumo = document.getElementById("btnConsumo");

function mostrarModal() {
    modal.classList.add("ativo");
    fundo.classList.add("ativo");

    modal.setAttribute("aria-hidden", "false");
    abrirModal.setAttribute("aria-expanded", "true");
    fecharModal.focus();
}

function esconderModal() {
    modal.classList.remove("ativo");
    fundo.classList.remove("ativo");

    modal.setAttribute("aria-hidden", "true");
    abrirModal.setAttribute("aria-expanded", "false");
    abrirModal.focus();
}

abrirModal.addEventListener("click", mostrarModal);
fecharModal.addEventListener("click", esconderModal);
fundo.addEventListener("click", esconderModal);

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" &&
        modal.classList.contains("ativo")) {
        esconderModal();
    }
});

btnInicio.addEventListener("click", function() {
    window.location.href = "Home.html";
});

btnFaturas.addEventListener("click", function() {
    window.location.href = "Fatura.html";
});

btnConsumo.addEventListener("click", function() {
    window.location.href = "Consumo.html";
});
