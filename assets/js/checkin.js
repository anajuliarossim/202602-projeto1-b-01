const LIMITE_CHECKINS = 90;
const VALOR_POR_CHECKIN = 50;
const CHAVE_CHECKINS = 'bulbe-checkins-diarios';

const botaoCheckin = document.querySelector('#botao-checkin');
const valorSaldo = document.querySelector('#valor-saldo');
const valorSequencia = document.querySelector('#valor-sequencia');
const diasCheckin = document.querySelector('#dias-checkin');
const barraProgresso = document.querySelector('#barra-progresso');
const mensagemMotivacional = document.querySelector('.checkin-motivacao p');
const mensagemStatusCheckin = document.querySelector('#mensagem-status-checkin');

function dataDeCheckinValida(data) {
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const dataConvertida = new Date(`${data}T00:00:00Z`);
    return !Number.isNaN(dataConvertida.getTime()) && dataConvertida.toISOString().slice(0, 10) === data;
}

function obterDataDeHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function periodoDeCheckinEncerrado(checkins) {
    if (checkins.length === 0) {
        return false;
    }

    const primeiroCheckin = checkins[0];
    const diasDesdeInicio = (Date.parse(`${obterDataDeHoje()}T00:00:00Z`) - Date.parse(`${primeiroCheckin}T00:00:00Z`)) / 86400000;

    return diasDesdeInicio >= LIMITE_CHECKINS;
}

function carregarCheckins() {
    const dadosSalvos = localStorage.getItem(CHAVE_CHECKINS);

    if (!dadosSalvos) {
        return [];
    }

    let checkins;

    try {
        checkins = JSON.parse(dadosSalvos);
    } catch (erro) {
        throw new Error('Os dados salvos do check-in não puderam ser lidos.', { cause: erro });
    }

    if (!Array.isArray(checkins) || !checkins.every(dataDeCheckinValida)) {
        throw new Error('Os dados salvos do check-in estão inválidos.');
    }

    return [...new Set(checkins)].sort().slice(-LIMITE_CHECKINS);
}

function formatarSaldoEmReais(valorEmCentavos) {
    return (valorEmCentavos / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function calcularSequencia(checkins) {
    const datasOrdenadas = [...checkins].sort().reverse();
    let dataEsperada = obterDataDeHoje();
    let sequencia = 0;

    for (const dataCheckin of datasOrdenadas) {
        const diferencaDias = (Date.parse(`${dataEsperada}T00:00:00Z`) - Date.parse(`${dataCheckin}T00:00:00Z`)) / 86400000;

        if (diferencaDias < 0 || diferencaDias > 1) {
            break;
        }

        sequencia += 1;
        const data = new Date(`${dataCheckin}T00:00:00Z`);
        data.setUTCDate(data.getUTCDate() - 1);
        dataEsperada = data.toISOString().slice(0, 10);
    }

    return sequencia;
}

function atualizarTela(checkins) {
    const quantidadeCheckins = checkins.length;
    const jaFezCheckinHoje = checkins.includes(obterDataDeHoje());
    const checkinsCompletos = quantidadeCheckins >= LIMITE_CHECKINS;
    const periodoEncerrado = periodoDeCheckinEncerrado(checkins);
    const sequencia = calcularSequencia(checkins);

    valorSaldo.textContent = formatarSaldoEmReais(quantidadeCheckins * VALOR_POR_CHECKIN);
    valorSequencia.textContent = `${sequencia} ${sequencia === 1 ? 'dia seguido' : 'dias seguidos'}`;
    diasCheckin.textContent = `${quantidadeCheckins} de ${LIMITE_CHECKINS} dias`;
    barraProgresso.value = quantidadeCheckins;
    if (checkinsCompletos) {
        mensagemMotivacional.textContent = 'Parabéns! Você completou os 90 check-ins e acumulou R$ 45,00.';
    } else if (periodoEncerrado) {
        const saldoAtual = formatarSaldoEmReais(quantidadeCheckins * VALOR_POR_CHECKIN);
        mensagemMotivacional.textContent = `Seu período de 90 dias terminou. Você acumulou ${saldoAtual}.`;
    } else if (sequencia > 0) {
        mensagemMotivacional.textContent = `Continue assim! Você está há ${sequencia} ${sequencia === 1 ? 'dia' : 'dias'} sem perder um check-in.`;
    } else {
        mensagemMotivacional.textContent = 'Faça seu check-in hoje para começar sua sequência.';
    }

    if (checkinsCompletos) {
        botaoCheckin.textContent = 'Você completou os 90 check-ins!';
        botaoCheckin.disabled = true;
    } else if (periodoEncerrado) {
        botaoCheckin.textContent = 'Período de 90 dias encerrado';
        botaoCheckin.disabled = true;
    } else if (jaFezCheckinHoje) {
        botaoCheckin.textContent = 'Check-in realizado hoje ✓';
        botaoCheckin.disabled = true;
    } else {
        botaoCheckin.textContent = 'Fazer check-in de hoje';
        botaoCheckin.disabled = false;
    }
}

let checkinsRegistrados = [];

try {
    checkinsRegistrados = carregarCheckins();
    atualizarTela(checkinsRegistrados);
} catch (erro) {
    console.error('Não foi possível carregar os check-ins salvos.', erro);
    mensagemStatusCheckin.textContent = 'Não foi possível carregar seus check-ins salvos. Verifique o armazenamento do navegador.';
    mensagemStatusCheckin.className = 'checkin-erro';
    botaoCheckin.disabled = true;
}

botaoCheckin.addEventListener('click', () => {
    try {
        checkinsRegistrados = carregarCheckins();
    } catch (erro) {
        console.error('Não foi possível verificar os check-ins salvos.', erro);
        mensagemStatusCheckin.textContent = 'Não foi possível verificar seus check-ins. Tente novamente.';
        mensagemStatusCheckin.className = 'checkin-erro';
        botaoCheckin.disabled = true;
        return;
    }

    if (
        checkinsRegistrados.includes(obterDataDeHoje())
        || checkinsRegistrados.length >= LIMITE_CHECKINS
        || periodoDeCheckinEncerrado(checkinsRegistrados)
    ) {
        atualizarTela(checkinsRegistrados);
        return;
    }

    const novosCheckins = [...checkinsRegistrados, obterDataDeHoje()];

    try {
        localStorage.setItem(CHAVE_CHECKINS, JSON.stringify(novosCheckins));
    } catch (erro) {
        console.error('Não foi possível salvar o check-in no navegador.', erro);
        mensagemStatusCheckin.textContent = 'Não foi possível salvar seu check-in. Verifique o armazenamento do navegador e tente novamente.';
        mensagemStatusCheckin.className = 'checkin-erro';
        return;
    }

    checkinsRegistrados = novosCheckins;
    mensagemStatusCheckin.textContent = 'Check-in realizado! R$ 0,50 adicionados ao seu saldo.';
    mensagemStatusCheckin.className = 'checkin-sucesso';
    atualizarTela(checkinsRegistrados);
});

window.addEventListener('storage', (evento) => {
    if (evento.key !== CHAVE_CHECKINS && evento.key !== null) {
        return;
    }

    try {
        checkinsRegistrados = carregarCheckins();
        atualizarTela(checkinsRegistrados);
    } catch (erro) {
        console.error('Não foi possível sincronizar os check-ins salvos.', erro);
        mensagemStatusCheckin.textContent = 'Não foi possível sincronizar seus check-ins. Verifique o armazenamento do navegador.';
        mensagemStatusCheckin.className = 'checkin-erro';
        botaoCheckin.disabled = true;
    }
});

function atualizarNaViradaDoDia() {
    const proximaVirada = new Date();
    proximaVirada.setHours(24, 0, 0, 0);

    window.setTimeout(() => {
        atualizarTela(checkinsRegistrados);
        atualizarNaViradaDoDia();
    }, proximaVirada.getTime() - Date.now());
}

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        atualizarTela(checkinsRegistrados);
    }
});

atualizarNaViradaDoDia();
