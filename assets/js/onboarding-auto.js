(() => {
  'use strict';

  // Válido na mesma aba/sessão; não armazena dados do cartão.
  const chave = 'bulbe:onboarding:v1';
  const atraso = 2000;
  let temporizador;

  document.querySelectorAll('#card-cadastro, #pular-card').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey ||
          event.shiftKey || event.altKey || event.button !== 0) return;
      try {
        if (sessionStorage.getItem(chave) !== 'exibido') {
          sessionStorage.setItem(chave, 'pendente');
        }
      } catch (erro) {
        // Se o armazenamento estiver bloqueado, o link continua funcionando.
      }
    });
  });

  if (!document.body.hasAttribute('data-onboarding-home')) return;

  function agendar() {
    clearTimeout(temporizador);
    try {
      if (sessionStorage.getItem(chave) !== 'pendente') return;
    } catch (erro) {
      return;
    }
    temporizador = setTimeout(() => {
      try {
        if (sessionStorage.getItem(chave) !== 'pendente') return;
        // Consome antes de abrir: fechar ou voltar não repete a apresentação.
        sessionStorage.setItem(chave, 'exibido');
      } catch (erro) {
        return;
      }
      window.location.assign('Onboarding-1.html');
    }, atraso);
  }

  // Também funciona ao retornar pelo histórico (cache de navegação).
  window.addEventListener('pageshow', agendar);
  window.addEventListener('pagehide', () => clearTimeout(temporizador));
  agendar();
})();
