export function lerSaldoCheckin() {
  try {
    const texto = localStorage.getItem('bulbe-checkins-diarios') || '[]';
    const dias = JSON.parse(texto);

    if (!Array.isArray(dias)) return 0;
    if (dias.length === 0) return 10;

    return Math.min(new Set(dias).size, 90) * 0.50;
  } catch (erro) {
    console.warn('Não foi possível ler o saldo do check-in.', erro);
    return 0;
  }
}

export function formatarSaldoCheckin(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
