/* Ajuste estes dois valores ao integrar no aplicativo. */
const onboardingConfig = {
  destinoSaida: 'Home.html',
  mensagemIndicacao: 'Conheça a Bulbe! Quero indicar você para economizar na conta de luz.'
  // Acrescente seu link pessoal de indicação à mensagem acima.
};
document.querySelectorAll('.onboardingBulbe [data-sair]').forEach(link => {
  link.href = onboardingConfig.destinoSaida;
});
const indicar = document.querySelector('.onboardingBulbe #Indicar');
if (indicar) indicar.addEventListener('click', () => {
  // Abre o seletor de contato do WhatsApp; o usuário confirma o envio.
  window.location.href = 'https://wa.me/?text=' + encodeURIComponent(onboardingConfig.mensagemIndicacao);
});
