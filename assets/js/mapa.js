import { buscarClientes } from './api.js';

const formulario = document.querySelector('.mapa-pesquisa');
const campoCidade = document.querySelector('#cidade');
const totalClientes = document.querySelector('#total-clientes');
const totalCidades = document.querySelector('#total-cidades');
const mensagem = document.querySelector('.mapa-area p');
const botao = formulario.querySelector('button');

function normalizar(texto) {
  return texto
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function iniciarMapa() {
  botao.disabled = true;
  mensagem.textContent = 'Carregando dados...';

  try {
    const clientes = await buscarClientes();

    const cidades = new Set(
      clientes.map((cliente) => normalizar(cliente.cidade))
    );

    totalCidades.textContent = cidades.size;
    mensagem.textContent = 'Pesquise uma cidade para consultar a quantidade de clientes.';

    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const cidade = normalizar(campoCidade.value);

      if (!cidade) {
        totalClientes.textContent = '—';
        mensagem.textContent = 'Digite o nome de uma cidade.';
        return;
      }

      const encontrados = clientes.filter(
        (cliente) => normalizar(cliente.cidade) === cidade
      );

      totalClientes.textContent = encontrados.length;

      mensagem.textContent = encontrados.length > 0
        ? `Clientes em ${encontrados[0].cidade}: ${encontrados.length}.`
        : 'Nenhum cliente encontrado nessa cidade na base de demonstração.';
    });

    botao.disabled = false;
  } catch (erro) {
    mensagem.textContent = 'Não foi possível carregar os dados. Abra a página pelo Live Server e tente novamente.';
    console.error(erro);
  }
}

iniciarMapa();