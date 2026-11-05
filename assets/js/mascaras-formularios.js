/* Máscaras de formato; CPF não tem os dígitos verificadores conferidos. */
(() => {
  'use strict';
  const limites = { telefone: 11, cpf: 11, cep: 8 };
  function formatar(valor, tipo) {
    const d = valor.replace(/[^0-9]/g, '').slice(0, limites[tipo]);
    if (tipo === 'cep') return d.slice(0, 5) + (d.length > 5 ? '-' + d.slice(5) : '');
    if (tipo === 'cpf') return d.slice(0, 3) + (d.length > 3 ? '.' + d.slice(3, 6) : '') + (d.length > 6 ? '.' + d.slice(6, 9) : '') + (d.length > 9 ? '-' + d.slice(9) : '');
    return (d ? '(' + d.slice(0, 2) : '') + (d.length > 2 ? ') ' + d.slice(2, 7) : '') + (d.length > 7 ? '-' + d.slice(7) : '');
  }
  function aplicar(campo) {
    const antes = campo.value;
    const posicao = campo.selectionStart;
    const digitosAntes = antes.slice(0, posicao ?? antes.length).replace(/[^0-9]/g, '').length;
    campo.value = formatar(antes, campo.dataset.mascara);
    if (document.activeElement === campo && posicao !== null) {
      let pos = 0, contagem = 0;
      while (pos < campo.value.length && contagem < digitosAntes) {
        if (/[0-9]/.test(campo.value[pos])) contagem++;
        pos++;
      }
      // Mantém o cursor junto ao dígito editado, inclusive no meio do campo.
      campo.setSelectionRange(pos, pos);
    }
  }
  document.querySelectorAll('[data-mascara]').forEach(campo => {
    campo.addEventListener('input', () => aplicar(campo));
    campo.addEventListener('change', () => aplicar(campo));
    aplicar(campo);
  });
  document.querySelectorAll('form[data-navegacao-validada]').forEach(form => {
    form.addEventListener('submit', evento => {
      evento.preventDefault();
      form.querySelectorAll('[data-mascara]').forEach(aplicar);
      // O evento submit nativo já respeita required, type e pattern.
      if (form.reportValidity()) window.location.assign(form.getAttribute('action'));
    });
  });
})();
