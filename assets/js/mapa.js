const formulario = document.querySelector('.mapa-pesquisa');
const campoCidade = document.querySelector('#cidade');
const mensagem = document.querySelector('#mapa-mensagem');
const mapa = document.querySelector('#mapa-contagem');
let mapaLeaflet;
const totalClientesContagem = 1284;
const totalClientesBeloHorizonte = 4813;
const totalClientesValadares = 652;
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
  [-18.817, -41.976],
  [-18.825, -41.959],
  [-18.831, -41.986],
  [-18.835, -41.944],
  [-18.840, -41.969],
  [-18.844, -41.928],
  [-18.849, -41.954],
  [-18.853, -41.985],
  [-18.858, -41.938],
  [-18.862, -41.965],
  [-18.867, -41.947],
  [-18.873, -41.925],
  [-18.878, -41.952],
  [-18.884, -41.970],
  [-18.890, -41.940],
  [-18.900, -41.955]
];

// Pontos ilustrativos: não representam endereços reais nem o total de clientes.
const pontosDemonstracao = [
  [-19.866, -44.060],
  [-19.878, -44.045],
  [-19.889, -44.074],
  [-19.898, -44.058],
  [-19.905, -44.092],
  [-19.910, -44.035],
  [-19.916, -44.068],
  [-19.920, -44.100],
  [-19.925, -44.048],
  [-19.931, -44.079],
  [-19.937, -44.028],
  [-19.942, -44.061],
  [-19.947, -44.094],
  [-19.953, -44.041],
  [-19.959, -44.075],
  [-19.965, -44.020],
  [-19.971, -44.055],
  [-19.977, -44.085],
  [-19.984, -44.038],
  [-19.990, -44.063],
  [-19.934, -44.110],
  [-19.955, -44.105],
  [-19.902, -44.015],
  [-19.945, -44.012]
];

function normalizar(texto) {
  return texto
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function iniciarMapa() {
  if (!window.L || !L.markerClusterGroup) {
    mensagem.textContent = 'Não foi possível carregar o mapa. Confira a internet e atualize a página.';
    return false;
  }
  mapa.hidden = false;
    if (!mapaLeaflet) {
      mapaLeaflet = L.map(mapa, { scrollWheelZoom: false, maxZoom: 15 })
        .setView([-19.932, -44.054], 12);
      mapaLeaflet.attributionControl.setPrefix(false);

      const camada = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      }).addTo(mapaLeaflet);

      pontosContagem = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        maxClusterRadius: 45,
        iconCreateFunction: (grupo) => L.divIcon({
          html: `<span>${grupo.getChildCount()}</span>`,
          className: 'mapa-grupo-clientes',
          iconSize: [42, 42]
        })
      });
      const iconeCliente = L.divIcon({
        className: 'mapa-ponto-cliente',
        iconSize: [12, 12]
      });
      // Distribuição determinística fictícia ao redor dos pontos de referência.
      // As mesmas posições são mantidas ao atualizar a página.
      for (let indice = 0; indice < totalClientesContagem; indice++) {
        const base = pontosDemonstracao[indice % pontosDemonstracao.length];
        const angulo = indice * 2.3999632297;
        const raio = 0.004 * Math.sqrt(((indice * 37) % totalClientesContagem + 1) / totalClientesContagem);
        const coordenadas = [
          base[0] + Math.cos(angulo) * raio,
          base[1] + Math.sin(angulo) * raio
        ];
        L.marker(coordenadas, { icon: iconeCliente, title: 'Cliente ilustrativo' })
          .bindPopup('Cliente ilustrativo em Contagem. Localização fictícia para demonstração.')
          .addTo(pontosContagem);
      }

      pontosValadares = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        maxClusterRadius: 45,
        iconCreateFunction: (grupo) => L.divIcon({
          html: `<span>${grupo.getChildCount()}</span>`,
          className: 'mapa-grupo-clientes',
          iconSize: [42, 42]
        })
      });
      // Posições fictícias e estáveis ao redor das referências de Valadares.
      for (let indice = 0; indice < totalClientesValadares; indice++) {
        const base = coordenadasValadares[indice % coordenadasValadares.length];
        const angulo = indice * 2.3999632297;
        const raio = 0.004 * Math.sqrt(((indice * 37) % totalClientesValadares + 1) / totalClientesValadares);
        const coordenadas = [
          base[0] + Math.cos(angulo) * raio,
          base[1] + Math.sin(angulo) * raio
        ];
        L.marker(coordenadas, { icon: iconeCliente, title: 'Cliente ilustrativo' })
          .bindPopup('Cliente ilustrativo em Governador Valadares. Localização fictícia para demonstração.')
          .addTo(pontosValadares);
      }

      pontosBeloHorizonte = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        maxClusterRadius: 45,
        iconCreateFunction: (grupo) => L.divIcon({
          html: `<span>${grupo.getChildCount()}</span>`,
          className: 'mapa-grupo-clientes',
          iconSize: [42, 42]
        })
      });
      // Posições fictícias e estáveis, distribuídas pelas referências de BH.
      for (let indice = 0; indice < totalClientesBeloHorizonte; indice++) {
        const base = coordenadasBeloHorizonte[indice % coordenadasBeloHorizonte.length];
        const angulo = indice * 2.3999632297;
        const raio = 0.004 * Math.sqrt(((indice * 37) % totalClientesBeloHorizonte + 1) / totalClientesBeloHorizonte);
        const coordenadas = [
          base[0] + Math.cos(angulo) * raio,
          base[1] + Math.sin(angulo) * raio
        ];
        L.marker(coordenadas, { icon: iconeCliente, title: 'Cliente ilustrativo' })
          .bindPopup('Cliente ilustrativo em Belo Horizonte. Localização fictícia para demonstração.')
          .addTo(pontosBeloHorizonte);
      }

      camada.on('tileerror', () => {
        mensagem.textContent = 'Não foi possível carregar parte do mapa. Confira sua conexão e pesquise novamente.';
      });
    }

  return true;
}

function mostrarMinas() {
  if (!iniciarMapa()) return;
  mapaLeaflet.removeLayer(pontosContagem);
  mapaLeaflet.removeLayer(pontosValadares);
  mapaLeaflet.removeLayer(pontosBeloHorizonte);
  mapa.setAttribute('aria-label', 'Mapa de Minas Gerais');
  mapaLeaflet.invalidateSize();
  mapaLeaflet.fitBounds([[-22.92, -51.05], [-14.23, -39.85]], { padding: [8, 8] });
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const cidade = normalizar(campoCidade.value);

  mostrarMinas();

  if (!cidade) {
    mensagem.textContent = 'Digite o nome de uma cidade.';
    return;
  }

  if (cidade === 'contagem' || cidade === 'governador valadares' || cidade === 'belo horizonte') {
    if (!window.L || !L.markerClusterGroup) {
      mensagem.textContent = 'Não foi possível carregar o mapa. Confira a internet e atualize a página.';
      return;
    }

    mapa.hidden = false;
    if (cidade === 'contagem') {
      mensagem.innerHTML = `<strong class="mapa-quantidade">${totalClientesContagem}</strong> <span class="mapa-clientes">clientes ativos</span>`;
    } else if (cidade === 'governador valadares') {
      mensagem.innerHTML = `<strong class="mapa-quantidade">${totalClientesValadares}</strong> <span class="mapa-clientes">clientes ativos</span>`;
    } else {
      mensagem.innerHTML = `<strong class="mapa-quantidade">${totalClientesBeloHorizonte}</strong> <span class="mapa-clientes">clientes ativos</span>`;
    }

    requestAnimationFrame(() => {
      mapaLeaflet.invalidateSize();
      mapaLeaflet.removeLayer(pontosContagem);
      mapaLeaflet.removeLayer(pontosValadares);
      mapaLeaflet.removeLayer(pontosBeloHorizonte);
      if (cidade === 'contagem') {
        pontosContagem.addTo(mapaLeaflet);
        mapa.setAttribute('aria-label', 'Mapa da região de Contagem, Minas Gerais');
        mapaLeaflet.fitBounds(pontosContagem.getBounds(), {
          padding: [24, 24],
          maxZoom: 13
        });
      } else if (cidade === 'governador valadares') {
        pontosValadares.addTo(mapaLeaflet);
        mapa.setAttribute('aria-label', 'Mapa da região de Governador Valadares, Minas Gerais');
        mapaLeaflet.fitBounds(pontosValadares.getBounds(), {
          padding: [24, 24],
          maxZoom: 14
        });
      } else {
        pontosBeloHorizonte.addTo(mapaLeaflet);
        mapa.setAttribute('aria-label', 'Mapa da região de Belo Horizonte, Minas Gerais');
        mapaLeaflet.fitBounds(pontosBeloHorizonte.getBounds(), {
          padding: [24, 24],
          maxZoom: 13
        });
      }
    });
  } else {
    mensagem.textContent = 'Cidade não disponível.';
  }
});

mostrarMinas();
