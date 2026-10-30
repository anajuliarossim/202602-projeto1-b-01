const formulario = document.querySelector('.mapa-pesquisa');
const campoCidade = document.querySelector('#cidade');
const mensagem = document.querySelector('#mapa-mensagem');
const mapa = document.querySelector('#mapa-contagem');
let mapaLeaflet;
let pontosContagem;
let pontosValadares;
let pontosBeloHorizonte;

// Pontos fictícios para a demonstração de Belo Horizonte.
const coordenadasBeloHorizonte = [
  [-19.906, -43.948],
  [-19.909, -43.935],
  [-19.912, -43.923],
  [-19.915, -43.955],
  [-19.918, -43.943],
  [-19.921, -43.931],
  [-19.924, -43.919],
  [-19.927, -43.949],
  [-19.930, -43.937],
  [-19.933, -43.925],
  [-19.936, -43.945],
  [-19.939, -43.933],
  [-19.903, -43.930],
  [-19.917, -43.965],
  [-19.929, -43.960],
  [-19.941, -43.951],
  [-19.821, -43.965],
  [-19.833, -43.986],
  [-19.845, -43.959],
  [-19.851, -43.978],
  [-19.860, -43.947],
  [-19.869, -43.970],
  [-19.877, -43.955],
  [-19.851, -44.002],
  [-19.866, -44.007],
  [-19.882, -44.013],
  [-19.895, -43.995],
  [-19.912, -43.985],
  [-19.930, -43.989],
  [-19.946, -43.978],
  [-19.963, -43.982],
  [-19.975, -43.966],
  [-19.967, -43.947],
  [-19.955, -43.934],
  [-19.943, -43.912],
  [-19.930, -43.904],
  [-19.916, -43.901],
  [-19.901, -43.907],
  [-19.885, -43.916],
  [-19.871, -43.927],
  [-19.859, -43.914],
  [-19.843, -43.925],
  [-19.825, -43.944],
  [-19.807, -43.968],
  [-19.795, -43.977],
  [-19.815, -43.993],
  [-19.893, -43.970],
  [-19.951, -44.001]
];

// Distribuição fictícia para a apresentação, sem endereços de clientes reais.
const coordenadasValadares = [
  [-18.844, -41.955],
  [-18.846, -41.948],
  [-18.848, -41.940],
  [-18.850, -41.958],
  [-18.852, -41.951],
  [-18.854, -41.943],
  [-18.856, -41.954],
  [-18.858, -41.946],
  [-18.841, -41.950],
  [-18.843, -41.941],
  [-18.847, -41.961],
  [-18.851, -41.936],
  [-18.855, -41.960],
  [-18.859, -41.951],
  [-18.845, -41.935],
  [-18.853, -41.947]
];

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

  if (cidade === 'contagem' || cidade === 'governador valadares' || cidade === 'belo horizonte') {
    if (!window.L) {
      mensagem.textContent = 'Não foi possível carregar o mapa. Confira a internet e atualize a página.';
      return;
    }

    mapa.hidden = false;
    if (cidade === 'contagem') {
      mensagem.innerHTML = '<strong class="mapa-quantidade">1284</strong> <span class="mapa-clientes">clientes ativos</span>';
    } else if (cidade === 'governador valadares') {
      mensagem.innerHTML = '<strong class="mapa-quantidade">652</strong> <span class="mapa-clientes">clientes ativos</span>';
    } else {
      mensagem.textContent = 'Belo Horizonte — MG';
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

      pontosValadares = L.layerGroup();
      coordenadasValadares.forEach((coordenadas) => {
        L.circleMarker(coordenadas, {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: '#4269ff',
          fillOpacity: 1
        })
          .addTo(pontosValadares)
          .bindPopup('Ponto ilustrativo de cliente em Governador Valadares. Não representa um endereço real.');
      });

      pontosBeloHorizonte = L.layerGroup();
      coordenadasBeloHorizonte.forEach((coordenadas) => {
        L.circleMarker(coordenadas, {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: '#4269ff',
          fillOpacity: 1
        })
          .addTo(pontosBeloHorizonte)
          .bindPopup('Ponto ilustrativo de cliente em Belo Horizonte. Não representa um endereço real.');
      });

      camada.on('tileerror', () => {
        mensagem.textContent = 'Não foi possível carregar parte do mapa. Confira sua conexão e pesquise novamente.';
      });
    }

    requestAnimationFrame(() => {
      mapaLeaflet.invalidateSize();
      mapaLeaflet.removeLayer(pontosContagem);
      mapaLeaflet.removeLayer(pontosValadares);
      mapaLeaflet.removeLayer(pontosBeloHorizonte);
      if (cidade === 'contagem') {
        pontosContagem.addTo(mapaLeaflet);
        mapa.setAttribute('aria-label', 'Mapa da região de Contagem, Minas Gerais');
        mapaLeaflet.fitBounds(pontosDemonstracao, {
          padding: [24, 24],
          maxZoom: 13
        });
      } else if (cidade === 'governador valadares') {
        pontosValadares.addTo(mapaLeaflet);
        mapa.setAttribute('aria-label', 'Mapa da região de Governador Valadares, Minas Gerais');
        mapaLeaflet.fitBounds(coordenadasValadares, {
          padding: [24, 24],
          maxZoom: 14
        });
      } else {
        pontosBeloHorizonte.addTo(mapaLeaflet);
        mapa.setAttribute('aria-label', 'Mapa da região de Belo Horizonte, Minas Gerais');
        mapaLeaflet.fitBounds(coordenadasBeloHorizonte, {
          padding: [24, 24],
          maxZoom: 13
        });
      }
    });
  } else {
    mensagem.textContent = 'Cidade não disponível.';
  }
});
