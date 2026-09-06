// PWA install + offline bootstrap. Kept separate from game scene controllers.
(function setupPWA(){
  const installBtn = document.getElementById('installBtn');
  const installToast = document.getElementById('installToast');
  let deferredInstallPrompt = null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  function toast(message, ms=5000){
    if(!installToast) return;
    installToast.textContent = message;
    installToast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(()=>installToast.classList.remove('show'), ms);
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker registration failed:', err));
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installBtn && !isStandalone) installBtn.classList.add('show');
  });

  if (installBtn) {
    if (isIOS && !isStandalone) installBtn.classList.add('show');
    installBtn.addEventListener('click', async () => {
      if (isStandalone) return;
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') toast('安裝完成後，可從桌面或開始功能表直接啟動。');
        deferredInstallPrompt = null;
        installBtn.classList.remove('show');
        return;
      }
      if (isIOS) {
        toast('iPhone / iPad：請用 Safari 的「分享」→「加入主畫面」安裝。', 8000);
        return;
      }
      if (location.protocol === 'file:') {
        toast('安裝功能需要用 localhost 或 HTTPS 開啟。請使用附帶的啟動方式或部署到網站。', 8000);
        return;
      }
      toast('若瀏覽器支援安裝，請從網址列或瀏覽器選單選擇「安裝應用程式」。', 7000);
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.remove('show');
    toast('機甲九九大作戰已安裝。');
  });
})();
