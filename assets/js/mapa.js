const formulario = document.querySelector('.mapa-pesquisa');
const campoCidade = document.querySelector('#cidade');
const mensagem = document.querySelector('#mapa-mensagem');
const mapa = document.querySelector('#mapa-contagem');

function normalizar(texto) {
  return texto
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const cidade = normalizar(campoCidade.value);

  mapa.hidden = true;

  if (!cidade) {
    mensagem.textContent = 'Digite o nome de uma cidade.';
    return;
  }

  if (cidade === 'contagem') {
    mensagem.textContent = 'Contagem — MG: região de demonstração.';

    if (!mapa.hasAttribute('src')) {
      mapa.src = mapa.dataset.src;
    }

    mapa.hidden = false;
  } else {
    mensagem.textContent =
      'Esta cidade ainda não está disponível nesta demonstração. Pesquise Contagem.';
  }
});