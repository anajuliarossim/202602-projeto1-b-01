const formulario = document.querySelector('.mapa-pesquisa');
const campoCidade = document.querySelector('#cidade');
const mensagem = document.querySelector('#mapa-mensagem');
const mapa = document.querySelector('#mapa-contagem');
let mapaLeaflet;
let pontosContagem;

// Pontos ilustrativos: não representam endereços reais nem o total de clientes.
const pontosDemonstracao = [
  [-19.905, -44.092],
  [-19.910, -44.075],
  [-19.920, -44.100],
  [-19.925, -44.080],
  [-19.935, -44.065],
  [-19.940, -44.090],
  [-19.900, -44.065],
  [-19.915, -44.055],
  [-19.903, -44.085],
  [-19.908, -44.097],
  [-19.913, -44.088],
  [-19.918, -44.073],
  [-19.923, -44.091],
  [-19.928, -44.098],
  [-19.933, -44.083],
  [-19.938, -44.074],
  [-19.943, -44.082],
  [-19.930, -44.058],
  [-19.922, -44.063],
  [-19.912, -44.067],
  [-19.898, -44.077],
  [-19.907, -44.060],
  [-19.917, -44.107],
  [-19.932, -44.105]
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

  if (cidade === 'contagem' || cidade === 'governador valadares') {
    if (!window.L) {
      mensagem.textContent = 'Não foi possível carregar o mapa. Confira a internet e atualize a página.';
      return;
    }

    mapa.hidden = false;
    if (cidade === 'contagem') {
      mensagem.innerHTML = '<strong class="mapa-quantidade">1284</strong> <span class="mapa-clientes">clientes ativos</span>';
    } else {
      mensagem.textContent = 'Governador Valadares — MG';
    }

    if (!mapaLeaflet) {
      mapaLeaflet = L.map(mapa, { scrollWheelZoom: false })
        .setView([-19.932, -44.054], 12);
      mapaLeaflet.attributionControl.setPrefix(false);

      const camada = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      }).addTo(mapaLeaflet);

      pontosContagem = L.layerGroup();
      pontosDemonstracao.forEach((coordenadas) => {
        L.circleMarker(coordenadas, {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: '#4269ff',
          fillOpacity: 1
        })
          .addTo(pontosContagem)
          .bindPopup('Ponto ilustrativo de cliente em Contagem. Não representa um endereço real.');
      });

      camada.on('tileerror', () => {
        mensagem.textContent = 'Não foi possível carregar parte do mapa. Confira sua conexão e pesquise novamente.';
      });
    }

    requestAnimationFrame(() => {
      mapaLeaflet.invalidateSize();
      if (cidade === 'contagem') {
        pontosContagem.addTo(mapaLeaflet);
        mapa.setAttribute('aria-label', 'Mapa da região de Contagem, Minas Gerais');
        mapaLeaflet.fitBounds(pontosDemonstracao, {
          padding: [24, 24],
          maxZoom: 13
        });
      } else {
        mapaLeaflet.removeLayer(pontosContagem);
        mapa.setAttribute('aria-label', 'Mapa da região de Governador Valadares, Minas Gerais');
        mapaLeaflet.setView([-18.851, -41.949], 13);
      }
    });
  } else {
    mensagem.textContent =
      'Cidade não disponível.';
  }
});
