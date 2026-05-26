// ── Google Analytics 4 ──
// Troque G-XXXXXXXXXX pelo seu Measurement ID
// Crie em: https://analytics.google.com → Admin → Criar propriedade
(function(){
  var GA_ID = 'G-6MPJKBMZR8';
  if(!GA_ID || GA_ID === 'G-XXXXXXXXXX') return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
})();
