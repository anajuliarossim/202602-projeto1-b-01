const LIMITE_CHECKINS = 90;
const VALOR_POR_CHECKIN = 50;
const CHAVE_CHECKINS = 'bulbe-checkins-diarios';

const botaoCheckin = document.querySelector('#botao-checkin');
const valorSaldo = document.querySelector('#valor-saldo');
const valorSequencia = document.querySelector('#valor-sequencia');
const diasCheckin = document.querySelector('#dias-checkin');
const barraProgresso = document.querySelector('#barra-progresso');
const listaCheckins = document.querySelector('#lista-checkins');
const mensagemMotivacional = document.querySelector('.checkin-motivacao p');
const mensagemStatusCheckin = document.querySelector('#mensagem-status-checkin');

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

function formatarDataHistorico(dataCheckin) {
    const hoje = obterDataDeHoje();
    const ontem = new Date(`${hoje}T00:00:00Z`);
    ontem.setUTCDate(ontem.getUTCDate() - 1);
    const dataDeOntem = ontem.toISOString().slice(0, 10);

    if (dataCheckin === hoje) {
        return 'Hoje ✓';
    }

    if (dataCheckin === dataDeOntem) {
        return 'Ontem ✓';
    }

    const [ano, mes, dia] = dataCheckin.split('-');
    return `${dia}/${mes} ✓`;
}

function atualizarHistorico(checkins) {
    const ultimosCheckins = [...checkins].sort().reverse().slice(0, 4);
    listaCheckins.replaceChildren();

    if (ultimosCheckins.length === 0) {
        const mensagemVazia = document.createElement('li');
        mensagemVazia.textContent = 'Seus check-ins aparecerão aqui.';
        listaCheckins.append(mensagemVazia);
        return;
    }

    for (const dataCheckin of ultimosCheckins) {
        const item = document.createElement('li');
        item.textContent = formatarDataHistorico(dataCheckin);
        listaCheckins.append(item);
    }
}

function atualizarTela(checkins) {
    const quantidadeCheckins = checkins.length;
    const jaFezCheckinHoje = checkins.includes(obterDataDeHoje());
    const checkinsCompletos = quantidadeCheckins >= LIMITE_CHECKINS;
    const sequencia = calcularSequencia(checkins);

    valorSaldo.textContent = formatarSaldoEmReais(quantidadeCheckins * VALOR_POR_CHECKIN);
    valorSequencia.textContent = `${sequencia} ${sequencia === 1 ? 'dia seguido' : 'dias seguidos'}`;
    diasCheckin.textContent = `${quantidadeCheckins} de ${LIMITE_CHECKINS} dias`;
    barraProgresso.value = quantidadeCheckins;
    mensagemMotivacional.textContent = sequencia > 0
        ? `Continue assim! Você está há ${sequencia} ${sequencia === 1 ? 'dia' : 'dias'} sem perder um check-in.`
        : 'Faça seu check-in hoje para começar sua sequência.';
    atualizarHistorico(checkins);

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

    const novosCheckins = [...checkinsRegistrados, obterDataDeHoje()];

    try {
        localStorage.setItem(CHAVE_CHECKINS, JSON.stringify(novosCheckins));
    } catch (erro) {
        console.error('Não foi possível salvar o check-in no navegador.', erro);
        mensagemStatusCheckin.textContent = 'Não foi possível salvar seu check-in. Verifique o armazenamento do navegador e tente novamente.';
        return;
    }

    checkinsRegistrados = novosCheckins;
    mensagemStatusCheckin.textContent = '';
    atualizarTela(checkinsRegistrados);
});
