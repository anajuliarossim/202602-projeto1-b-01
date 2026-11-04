/* =====================================
   HU03 - CENTRAL DE FATURAS
   ===================================== */

'use strict';

// Importa as faturas da API do projeto
import { buscarFaturasDoCliente } from './api.js';


// Cliente ficticio utilizado
const CLIENTE_DEMONSTRACAO = 3;


// Formata valores para reais
const VALOR = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});


// Nomes dos meses
const MESES = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro'
];


// Guarda as faturas e o filtro selecionado
const estado = {
    faturas: [],
    filtro: 'todas'
};


// Busca um elemento pelo ID
const $ = (id) => document.getElementById(id);


// =====================================
// FORMATACAO DOS DADOS
// =====================================


// Formata um numero como dinheiro
function moeda(valor) {

    return VALOR.format(Number(valor) || 0);

}


// Formata o mes de referencia
function mesReferencia(iso) {

    const [ano, mes] = String(iso || '')
        .split('-')
        .map(Number);

    if (!ano || !mes || mes > 12) {
        return 'Período indisponível';
    }

    const nomeMes = MESES[mes - 1];

    return (
        nomeMes[0].toUpperCase() +
        nomeMes.slice(1) +
        ' ' +
        ano
    );

}


// Formata a data de vencimento
function diaMes(iso) {

    const partes = String(iso || '').split('-');

    const dia = Number(partes[2]);
    const mes = Number(partes[1]);

    if (
        dia >= 1 &&
        dia <= 31 &&
        mes >= 1 &&
        mes <= 12
    ) {

        return `${dia} de ${MESES[mes - 1]}`;

    }

    return 'Não informado';

}


// Verifica se a fatura foi paga
function paga(fatura) {

    return (
        fatura.status === 'paga' ||
        fatura.status === 'pago'
    );

}


// Altera o texto de um elemento
function campo(id, valor) {

    $(id).textContent = valor;

}


// =====================================
// PREENCHER FATURA ATUAL
// =====================================

function preencherAtual(fatura) {

    const itens = fatura.detalhamento || {};


    // Numero da instalacao
    campo(
        'hu03-installation-number',
        fatura.instalacao || 'Não informada'
    );


    // Situacao da fatura
    let situacao = 'em aberto';

    if (paga(fatura)) {

        situacao = 'paga';

    } else if (fatura.status === 'prevista') {

        situacao = 'prevista';

    }

    campo('hu03-status', situacao);


    // Vencimento
    campo(
        'hu03-due-date',
        diaMes(fatura.vencimento)
    );


    // Valor da fatura
    campo(
        'hu03-total-current',
        moeda(fatura.valor)
    );


    // Total com desconto
    campo(
        'hu03-breakdown-total',
        moeda(fatura.valor)
    );


    // Economia
    campo(
        'hu03-savings-value',
        moeda(fatura.economia)
    );


    // Consumo de energia
    campo(
        'hu03-energy-kwh',
        Number(itens.consumoKwh || 0).toLocaleString('pt-BR')
    );


    // Valor da energia
    campo(
        'hu03-energy-cost',
        moeda(itens.energia)
    );


    // Impostos
    campo(
        'hu03-taxes',
        moeda(itens.impostos)
    );


    // Iluminacao publica
    campo(
        'hu03-lighting',
        moeda(itens.iluminacaoPublica)
    );


    // Desconto Bulbe
    campo(
        'hu03-discount',
        `−${moeda(itens.descontoBulbe)}`
    );


    // Verifica se a soma dos valores esta correta
    const soma =
        Number(itens.energia || 0) +
        Number(itens.impostos || 0) +
        Number(itens.iluminacaoPublica || 0) -
        Number(itens.descontoBulbe || 0);


    const explicacao = document.querySelector(
        '.hu03-breakdown-explain'
    );


    if (
        Object.keys(itens).length &&
        Math.abs(soma - Number(fatura.valor)) > 0.011
    ) {

        explicacao.textContent =
            'Os valores demonstrativos desta fatura precisam de conferência.';

    } else {

        explicacao.textContent =
            'O desconto Bulbe é subtraído dos demais valores para chegar ao total desta conta.';

    }

}


// =====================================
// CRIAR ELEMENTOS DO HISTORICO
// =====================================


// Cria um elemento HTML
function elemento(tag, classe, conteudo) {

    const node = document.createElement(tag);

    if (classe) {
        node.className = classe;
    }

    if (conteudo !== undefined) {
        node.textContent = conteudo;
    }

    return node;

}


// Cria uma linha para cada fatura
function criarLinha(fatura) {

    const linha = elemento(
        'article',
        'hu03-history-row'
    );


    // Icone da fatura
    const icone = elemento(
        'span',
        'hu03-history-icon'
    );


    const svg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
    );

    svg.setAttribute('class', 'hu03-icon');

    svg.setAttribute('aria-hidden', 'true');


    const use = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'use'
    );

    use.setAttribute(
        'href',
        '#hu03-icon-calendar'
    );

    svg.append(use);

    icone.append(svg);


    // Informacoes da fatura
    const infos = elemento(
        'div',
        'hu03-history-main'
    );


    // Mes de referencia
    infos.append(
        elemento(
            'strong',
            null,
            mesReferencia(fatura.referencia)
        )
    );


    // Data de pagamento ou vencimento
    let textoData;

    if (paga(fatura) && fatura.pagaEm) {

        textoData = `Pago em ${diaMes(fatura.pagaEm)}`;

    } else {

        textoData = `Vence em ${diaMes(fatura.vencimento)}`;

    }


    infos.append(
        elemento(
            'small',
            null,
            textoData
        )
    );


    // Situacao da fatura
    let textoStatus = 'Pendente';

    if (paga(fatura)) {

        textoStatus = 'Paga';

    } else if (fatura.status === 'prevista') {

        textoStatus = 'Prevista';

    }


    const classeStatus = paga(fatura)
        ? 'hu03-history-status is-paid'
        : 'hu03-history-status';


    const status = elemento(
        'span',
        classeStatus,
        textoStatus
    );


    infos.append(status);


    // Valor da fatura
    const valor = elemento(
        'strong',
        'hu03-history-value',
        moeda(fatura.valor)
    );


    // Adiciona os elementos a linha
    linha.append(
        icone,
        infos,
        valor
    );


    return linha;

}


// =====================================
// FILTRAR HISTORICO
// =====================================

function renderizarHistorico() {

    const lista = $('hu03-history-list');


    // Filtra as faturas
    const visiveis = estado.faturas.filter((fatura) => {

        if (estado.filtro === 'todas') {

            return true;

        }

        if (estado.filtro === 'pagas') {

            return paga(fatura);

        }

        return !paga(fatura);

    });


    // Limpa a lista
    lista.replaceChildren();


    // Se nao houver faturas
    if (visiveis.length === 0) {

        const mensagem = elemento(
            'p',
            'hu03-history-empty',
            'Nenhuma fatura encontrada neste filtro.'
        );

        lista.append(mensagem);

        return;

    }


    // Adiciona cada fatura a lista
    visiveis.forEach((fatura) => {

        lista.append(
            criarLinha(fatura)
        );

    });

}


// =====================================
// INTERACOES DA TELA
// =====================================

function configurarInteracoes() {


    // =================================
    // NOTIFICACOES
    // =================================

    const botaoNotificacao = $('hu03-notification-button');

    const painelNotificacao = $('hu03-notifications');


    botaoNotificacao.addEventListener('click', () => {

        const abrir =
            botaoNotificacao.getAttribute('aria-expanded') !== 'true';

        botaoNotificacao.setAttribute(
            'aria-expanded',
            String(abrir)
        );

        painelNotificacao.hidden = !abrir;

    });


    // Quando abrir o menu lateral,
    // fecha as notificacoes que estiverem abertas.

    const botaoMenu = $('abrirModal');

    botaoMenu.addEventListener('click', () => {

        botaoNotificacao.setAttribute(
            'aria-expanded',
            'false'
        );

        painelNotificacao.hidden = true;

    });


    // =================================
    // INSTALACAO
    // =================================

    const instalacao = $('hu03-installation-button');

    const informacao = $('hu03-installation-info');


    instalacao.addEventListener('click', () => {

        const abrir =
            instalacao.getAttribute('aria-expanded') !== 'true';


        instalacao.setAttribute(
            'aria-expanded',
            String(abrir)
        );


        informacao.hidden = !abrir;

    });


    // =================================
    // FORMAS DE PAGAMENTO
    // =================================

    const descricoes = {

        pix:
            'Pix selecionado. Esta é apenas uma demonstração: nenhum QR Code ou cobrança real será gerado.',

        boleto:
            'Boleto selecionado. Esta é apenas uma demonstração: nenhum boleto real será emitido.',

        cartao:
            'Cartão selecionado. Esta é apenas uma demonstração: nenhum dado de cartão será solicitado.'

    };


    // Seleciona os botoes
    const metodos = document.querySelectorAll(
        '.hu03-method'
    );


    metodos.forEach((botao) => {

        botao.addEventListener('click', () => {


            // Desmarca os outros botoes
            metodos.forEach((outro) => {

                outro.setAttribute(
                    'aria-pressed',
                    String(outro === botao)
                );

            });


            // Mostra a mensagem do pagamento
            campo(
                'hu03-payment-feedback',
                descricoes[botao.dataset.payment]
            );

        });

    });


    // =================================
    // FILTROS DO HISTORICO
    // =================================

    const abas = document.querySelectorAll(
        '.hu03-tab'
    );


    abas.forEach((aba) => {

        aba.addEventListener('click', () => {


            // Atualiza o filtro
            estado.filtro = aba.dataset.filter;


            // Atualiza a aba selecionada
            abas.forEach((outra) => {

                outra.setAttribute(
                    'aria-selected',
                    String(outra === aba)
                );

            });


            // Atualiza a lista
            renderizarHistorico();

        });

    });

}


// =====================================
// INICIAR A PAGINA
// =====================================

async function iniciar() {


    // Configura os botoes
    configurarInteracoes();


    try {

        // Busca as faturas ficticias
        const dados = await buscarFaturasDoCliente(
            CLIENTE_DEMONSTRACAO
        );


        // Organiza as faturas por data
        estado.faturas = dados.sort((a, b) => {

            return String(b.referencia).localeCompare(
                String(a.referencia)
            );

        });


        // Procura a fatura atual
        const atual =
            estado.faturas.find(
                (fatura) => fatura.status === 'aberta'
            ) || estado.faturas[0];


        // Preenche a fatura atual
        if (atual) {

            preencherAtual(atual);

        }


        // Mostra o historico
        renderizarHistorico();


    } catch (erro) {

        console.error(
            'HU03: erro ao carregar dados de demonstração:',
            erro
        );


        const mensagem = elemento(
            'p',
            'hu03-history-empty',
            'Não foi possível carregar as faturas. Abra o projeto pelo Live Server e tente novamente.'
        );


        $('hu03-history-list').replaceChildren(
            mensagem
        );

    }

}


// Inicia o programa
iniciar();