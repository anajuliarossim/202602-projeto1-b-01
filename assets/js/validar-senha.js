/* Validação local da criação de senha. Não armazena nem envia senhas. */
(() => {
  'use strict';
  const form = document.getElementById('form-cadastro-senha');
  if (!form) return;
  const senha = document.getElementById('nova-senha');
  const confirmar = document.getElementById('confirmar-senha');
  const mensagem = document.getElementById('mensagem-confirmacao');

  function validarConfirmacao() {
    const diferentes = Boolean(confirmar.value) && senha.value !== confirmar.value;
    confirmar.setCustomValidity(diferentes ? 'As senhas não coincidem.' : '');
    mensagem.textContent = diferentes ? 'As senhas não coincidem. Digite novamente.' : '';
    return !diferentes;
  }

  senha.addEventListener('input', validarConfirmacao);
  confirmar.addEventListener('input', validarConfirmacao);

  document.querySelectorAll('[data-alternar-senha]').forEach(botao => {
    const campo = document.getElementById(botao.dataset.alternarSenha);
    if (!campo) return;
    botao.addEventListener('click', () => {
      const mostrar = campo.type === 'password';
      campo.type = mostrar ? 'text' : 'password';
      botao.textContent = mostrar ? 'Ocultar' : 'Mostrar';
      botao.setAttribute('aria-pressed', String(mostrar));
      botao.setAttribute('aria-label', (mostrar ? 'Ocultar' : 'Mostrar') + ' ' +
        (campo.id === 'confirmar-senha' ? 'confirmação da senha' : 'senha'));
    });
  });

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    validarConfirmacao();
    if (!form.reportValidity()) return;
    // Protótipo: avança para os termos sem persistir a senha no navegador.
    window.location.assign(form.getAttribute('action'));
  });
})();
