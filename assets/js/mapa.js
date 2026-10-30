const formulario = document.querySelector('.mapa-pesquisa');
const campoCidade = document.querySelector('#cidade');
const mensagem = document.querySelector('#mapa-mensagem');
const mapa = document.querySelector('#mapa-contagem');
let mapaLeaflet;

// Pontos ilustrativos: não representam endereços reais nem o total de clientes.
const pontosDemonstracao = [
  [-19.920, -44.067],
  [-19.925, -44.050],
  [-19.935, -44.075],
  [-19.940, -44.055],
  [-19.950, -44.040],
  [-19.955, -44.065],
  [-19.915, -44.040],
  [-19.930, -44.030]
];

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
    if (!window.L) {
      mensagem.textContent = 'Não foi possível carregar o mapa. Confira a internet e atualize a página.';
      return;
    }

    mapa.hidden = false;
    mensagem.innerHTML = '<strong class="mapa-quantidade">1284</strong> <span class="mapa-clientes">clientes ativos</span>';

    if (!mapaLeaflet) {
      mapaLeaflet = L.map(mapa, { scrollWheelZoom: false })
        .setView([-19.932, -44.054], 12);
      mapaLeaflet.attributionControl.setPrefix(false);

      const camada = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      }).addTo(mapaLeaflet);

      pontosDemonstracao.forEach((coordenadas) => {
        L.circleMarker(coordenadas, {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: '#4269ff',
          fillOpacity: 1
        })
          .addTo(mapaLeaflet)
          .bindPopup('Ponto ilustrativo de cliente em Contagem. Não representa um endereço real.');
      });

      camada.on('tileerror', () => {
        mensagem.textContent = 'Não foi possível carregar parte do mapa. Confira sua conexão e pesquise novamente.';
      });
    }

    requestAnimationFrame(() => {
      mapaLeaflet.invalidateSize();
      mapaLeaflet.fitBounds(pontosDemonstracao, {
        padding: [24, 24],
        maxZoom: 13
      });
    });
  } else {
    mensagem.textContent =
      'Esta cidade ainda não está disponível nesta demonstração. Pesquise Contagem.';
  }
});
