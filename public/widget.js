(function () {
  const container = document.currentScript.parentElement || document.body;

  const iframe = document.createElement('iframe');
  iframe.src = 'https://news1.kz/widget/latest-news';
  iframe.style.width = '100%';
  iframe.style.height = '400px';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.scrolling = 'no';

  container.appendChild(iframe);
})();
