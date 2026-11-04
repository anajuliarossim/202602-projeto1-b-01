const LIMITE_CHECKINS = 90;
const VALOR_POR_CHECKIN = 50;
const CHAVE_CHECKINS = 'bulbe-checkins-diarios';

const botaoCheckin = document.querySelector('#botao-checkin');
const valorSaldo = document.querySelector('#valor-saldo');
const diasCheckin = document.querySelector('#dias-checkin');
const barraProgresso = document.querySelector('#barra-progresso');

function obterDataDeHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function carregarCheckins() {
    const dadosSalvos = localStorage.getItem(CHAVE_CHECKINS);

    if (!dadosSalvos) {
        return [];
    }

    const checkins = JSON.parse(dadosSalvos);

    if (!Array.isArray(checkins) || !checkins.every((data) => typeof data === 'string')) {
        throw new Error('Os dados salvos do check-in estão inválidos.');
    }

    return [...new Set(checkins)].slice(0, LIMITE_CHECKINS);
}

function formatarSaldoEmReais(valorEmCentavos) {
    return (valorEmCentavos / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function atualizarTela(checkins) {
    const quantidadeCheckins = checkins.length;
    const jaFezCheckinHoje = checkins.includes(obterDataDeHoje());
    const checkinsCompletos = quantidadeCheckins >= LIMITE_CHECKINS;

    valorSaldo.textContent = formatarSaldoEmReais(quantidadeCheckins * VALOR_POR_CHECKIN);
    diasCheckin.textContent = `${quantidadeCheckins} de ${LIMITE_CHECKINS} dias`;
    barraProgresso.value = quantidadeCheckins;

    if (checkinsCompletos) {
        botaoCheckin.textContent = 'Você completou os 90 check-ins!';
        botaoCheckin.disabled = true;
    } else if (jaFezCheckinHoje) {
        botaoCheckin.textContent = 'Check-in realizado hoje ✓';
        botaoCheckin.disabled = true;
    } else {
        botaoCheckin.textContent = 'Fazer check-in de hoje';
        botaoCheckin.disabled = false;
    }
}

let checkinsRegistrados = carregarCheckins();
atualizarTela(checkinsRegistrados);

botaoCheckin.addEventListener('click', () => {
    if (checkinsRegistrados.includes(obterDataDeHoje()) || checkinsRegistrados.length >= LIMITE_CHECKINS) {
        atualizarTela(checkinsRegistrados);
        return;
    }

    checkinsRegistrados = [...checkinsRegistrados, obterDataDeHoje()];
    localStorage.setItem(CHAVE_CHECKINS, JSON.stringify(checkinsRegistrados));
    atualizarTela(checkinsRegistrados);
});
