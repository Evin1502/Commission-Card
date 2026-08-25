/* ============================================================
   COMMISSION CARD — app.js
   ============================================================ */

(function(){
  /* ============================================================
     TABS
     ============================================================ */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p  => p.classList.remove('active'));
      btn.classList.add('active');
      const activePanel = document.querySelector('.panel[data-panel="' + btn.dataset.tab + '"]');
      if(activePanel){
        activePanel.classList.add('active');
        if(btn.dataset.tab === 'sheet' || btn.dataset.tab === 'home') popInSamples();
        if(btn.dataset.tab === 'home' || btn.dataset.tab === 'track') replayLinkAnim(activePanel);
      }
    });
  });

  /* ============================================================
     LINK BUTTON BOUNCE ANIMATION
     ============================================================ */
  document.querySelectorAll('.link-btn').forEach(a => {
    a.addEventListener('click', () => {
      if(!reduceMotion){
        a.classList.remove('clicked');
        void a.offsetWidth;
        a.classList.add('clicked');
      }
    });
    a.addEventListener('animationend', () => a.classList.remove('clicked'));
  });

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sampleObserver = null;
  let linkObserver   = null;

  /* -- scroll direction tracking (for pop-in animation) -- */
  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let scrollDir   = 'down';

  window.addEventListener('scroll', () => {
    const y = window.scrollY || window.pageYOffset || 0;
    if(y > lastScrollY)      scrollDir = 'down';
    else if(y < lastScrollY) scrollDir = 'up';
    lastScrollY = y;
  }, { passive:true });

  /* -- IntersectionObserver callback -- */
  function popInCallback(entries, obs){
    entries.forEach(entry => {
      const el = entry.target;
      if(entry.isIntersecting){
        if(scrollDir === 'down'){
          // entering view while scrolling down → play pop-in
          el.classList.remove('no-anim');
          el.classList.add('in-view');
        } else {
          // entering view while scrolling up → show instantly, no animation
          el.classList.add('no-anim');
          el.classList.add('in-view');
        }
      } else {
        // leaving view → reset so it can animate again next time
        el.classList.add('no-anim');
        el.classList.remove('in-view');
      }
    });
  }

  function popInSamples(){
    const slots = document.querySelectorAll('.sample-slot, .gallery-slot');
    if(reduceMotion || !('IntersectionObserver' in window)){
      slots.forEach(el => el.classList.add('in-view'));
      return;
    }
    if(sampleObserver) sampleObserver.disconnect();

    sampleObserver = new IntersectionObserver(popInCallback, {
      threshold: 0.01,
      rootMargin: '0px 0px -5% 0px'
    });

    slots.forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 70 + 'ms';
      sampleObserver.observe(el);
    });
  }

  function popInLinks(){
    const links = document.querySelectorAll('.link-btn');
    if(reduceMotion || !('IntersectionObserver' in window)){
      links.forEach(el => el.classList.add('in-view'));
      return;
    }
    if(linkObserver) linkObserver.disconnect();
    linkObserver = new IntersectionObserver(popInCallback, {
      threshold: 0.01,
      rootMargin: '0px 0px -5% 0px'
    });
    links.forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 80 + 'ms';
      linkObserver.observe(el);
    });
  }

  /* -- replay pop-in for link buttons inside a specific panel -- */
  function replayLinkAnim(panelEl){
    const links = panelEl.querySelectorAll('.link-btn');
    if(reduceMotion){
      links.forEach(el => el.classList.add('in-view'));
      return;
    }
    // disconnect observer so scroll events don't interfere
    if(linkObserver){ linkObserver.disconnect(); linkObserver = null; }
    // step 1: reset instantly (no transition)
    links.forEach(el => {
      el.classList.add('no-anim');
      el.classList.remove('in-view');
    });
    // step 2: after one frame remove no-anim, then animate in with stagger
    requestAnimationFrame(() => {
      links.forEach((el, i) => {
        el.classList.remove('no-anim');
        el.style.transitionDelay = i * 90 + 'ms';
      });
      requestAnimationFrame(() => {
        links.forEach(el => el.classList.add('in-view'));
      });
    });
  }



  /* ============================================================
     ENTRANCE ANIMATION — triggers on first page load
     ============================================================ */
  function triggerEntranceAnimations(){
    // elements animate in staggered order via CSS animation-delay
    const targets = [
      '.sheet',
      '.tape.t1',
      '.tape.t2',
      '.avatar-wrap',
      '.name',
      '.tagline',
      '.tabs'
    ];
    targets.forEach(sel => {
      const el = document.querySelector(sel);
      if(el) el.classList.add('animate-in');
    });
  }
    /* ============================================================
     BACKGROUND MUSIC (autoplay on load + manual toggle button)
     ============================================================ */

  const musicToggle = document.getElementById('musicToggle');
  const bgMusic      = document.getElementById('bgMusic');
  const MUSIC_PREF_KEY = 'commission-card-music-on';

  if(musicToggle && bgMusic){

    bgMusic.volume = 0.6;

    // user's last choice; default = musik nyala kalau belum pernah diatur
    const stored = localStorage.getItem(MUSIC_PREF_KEY);
    let wantsMusic = stored === null ? true : stored === 'true';

    function setButtonState(isPlaying){
      musicToggle.classList.toggle('on', isPlaying);
      musicToggle.classList.toggle('muted', !isPlaying);
      musicToggle.textContent = isPlaying ? '♪' : '×';
      musicToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    }

    function playMusic(){
      const p = bgMusic.play();
      if(p !== undefined){
        p.then(() => {
          setButtonState(true);
        }).catch(() => {
          // browser blokir autoplay (belum ada interaksi user) -> tunggu klik/tap pertama
          setButtonState(false);
          waitForFirstInteraction();
        });
      }
    }

    function pauseMusic(){
      bgMusic.pause();
      setButtonState(false);
    }

    function waitForFirstInteraction(){
      const resume = () => {
        if(wantsMusic && bgMusic.paused) playMusic();
        document.removeEventListener('click', resume);
        document.removeEventListener('touchstart', resume);
        document.removeEventListener('keydown', resume);
      };
      document.addEventListener('click', resume, { once: true });
      document.addEventListener('touchstart', resume, { once: true });
      document.addEventListener('keydown', resume, { once: true });
    }

    // coba autoplay begitu halaman dibuka
    if(wantsMusic){
      playMusic();
    } else {
      setButtonState(false);
    }

    // tombol untuk stop/mainkan lagi secara manual
    musicToggle.addEventListener('click', () => {
      if(bgMusic.paused){
        wantsMusic = true;
        playMusic();
      } else {
        wantsMusic = false;
        pauseMusic();
      }
      localStorage.setItem(MUSIC_PREF_KEY, wantsMusic ? 'true' : 'false');
    });
  }

  /* ============================================================
     INIT
     ============================================================ */


  // small delay so browser paints the page before animations fire
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      triggerEntranceAnimations();
      popInSamples();
      popInLinks();
    });
  });

})();