import { formatarSaldoCheckin, lerSaldoCheckin } from './saldo-checkin.js';

function atualizarSaldoCheckin() {
  const elemento = document.getElementById('saldoCheckinHome');
  if (!elemento) return;

  elemento.textContent = formatarSaldoCheckin(lerSaldoCheckin());
}

atualizarSaldoCheckin();
window.addEventListener('pageshow', atualizarSaldoCheckin);
window.addEventListener('storage', atualizarSaldoCheckin);
