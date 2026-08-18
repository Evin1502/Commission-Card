/* ============================================================
   COMMISSION CARD — app.js
   ============================================================ */

(function(){
  const STORAGE_KEY = 'commission-card-data-v1';

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
      activePanel.classList.add('active');
      if(btn.dataset.tab === 'sheet') popInSamples();
      if(btn.dataset.tab === 'home' || btn.dataset.tab === 'track') replayLinkAnim(activePanel);
    });
  });

  /* ============================================================
     EDIT MODE
     ============================================================ */
  const editToggle  = document.getElementById('editToggle');
  const editableEls = document.querySelectorAll('[contenteditable]');
  let editing = false;

  function setEditing(on){
    editing = on;
    document.body.classList.toggle('editing', on);
    editToggle.textContent = on ? '✓ Edit mode: ON' : '✎ Edit mode: OFF';
    editableEls.forEach(el => el.setAttribute('contenteditable', on ? 'true' : 'false'));
    renderSamples();
    if(!on) saveData();
  }

  editToggle.addEventListener('click', () => setEditing(!editing));

  /* ============================================================
     LINK EDITING — href prompt + click pop animation
     ============================================================ */
  document.querySelectorAll('.link-btn').forEach(a => {
    a.addEventListener('click', (e) => {
      // playful bounce every time the button is tapped
      if(!reduceMotion){
        a.classList.remove('clicked');
        void a.offsetWidth; // restart animation even on rapid re-clicks
        a.classList.add('clicked');
      }

      if(editing){
        e.preventDefault();
        const current = a.getAttribute('href') === '#' ? '' : a.getAttribute('href');
        const url = prompt(
          'Masukkan link untuk ' + a.querySelector('.linklabel').textContent + ':',
          current || 'https://'
        );
        if(url){ a.setAttribute('href', url); saveData(); }
      }
    });
    a.addEventListener('animationend', () => a.classList.remove('clicked'));
  });

  /* ============================================================
     SAMPLE GRIDS
     — Per commission type, 3–6 uploadable thumbnails each
     ============================================================ */
  const SAMPLE_CATEGORIES = [
    { key:'headshot', label:'Headshot samples' },
    { key:'bustup',   label:'Bust Up samples'  },
    { key:'fullbody', label:'Full Body samples' }
  ];
  const MIN_SLOTS = 3;
  const MAX_SLOTS = 6;

  // sampleData[category] = array of dataURLs or null
  const sampleData = {};
  SAMPLE_CATEGORIES.forEach(c => sampleData[c.key] = new Array(MIN_SLOTS).fill(null));

  const sampleGroupsEl = document.getElementById('sampleGroups');

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
    const slots = document.querySelectorAll('.sample-slot');
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

  /* -- render sample grid -- */
  function renderSamples(){
    sampleGroupsEl.innerHTML = '';

    SAMPLE_CATEGORIES.forEach(cat => {
      const slots       = sampleData[cat.key];
      const filledCount = slots.filter(Boolean).length;

      const group = document.createElement('div');
      group.className = 'sample-group';

      const title = document.createElement('div');
      title.className = 'sample-group-title';
      title.innerHTML =
        '<span>' + cat.label + '</span>' +
        '<span class="count">(' + filledCount + '/' + MAX_SLOTS + ')</span>';
      group.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'sample-grid';

      slots.forEach((src, idx) => {
        const slot = document.createElement('div');
        slot.className = 'sample-slot' + (src ? ' filled' : '');

        if(src){
          const img = document.createElement('img');
          img.src = src;
          slot.appendChild(img);

          const rm = document.createElement('span');
          rm.className = 'sample-remove';
          rm.textContent = '×';
          rm.addEventListener('click', (e) => {
            e.stopPropagation();
            sampleData[cat.key][idx] = null;
            renderSamples();
            saveData();
          });
          slot.appendChild(rm);
        } else {
          slot.textContent = '+ photo';
        }

        const input = document.createElement('input');
        input.type   = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if(!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            sampleData[cat.key][idx] = reader.result;
            renderSamples();
            saveData();
          };
          reader.readAsDataURL(file);
        });
        slot.appendChild(input);

        slot.addEventListener('click', () => {
          if(editing) input.click();
        });

        grid.appendChild(slot);
      });

      // "+ add slot" button
      if(slots.length < MAX_SLOTS){
        const addBtn = document.createElement('button');
        addBtn.type      = 'button';
        addBtn.className = 'add-sample-btn visible';
        addBtn.textContent = '+';
        addBtn.addEventListener('click', () => {
          sampleData[cat.key].push(null);
          renderSamples();
          saveData();
        });
        grid.appendChild(addBtn);
      }

      group.appendChild(grid);
      sampleGroupsEl.appendChild(group);
    });

    popInSamples();
  }


  /* ============================================================
     AVATAR UPLOAD
     ============================================================ */
  const avatarInput       = document.getElementById('avatarInput');
  const avatarImg         = document.getElementById('avatarImg');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      avatarImg.src = reader.result;
      avatarImg.style.display = 'block';
      avatarPlaceholder.style.display = 'none';
      saveData();
    };
    reader.readAsDataURL(file);
  });

  /* ============================================================
     PERSISTENCE (localStorage)
     ============================================================ */
  function collectEditableData(){
    const data = { editables:{}, links:{}, avatar:null };

    editableEls.forEach((el, i) => {
      if(!el.id) el.dataset.autoId = 'auto' + i;
      const key = el.id || el.dataset.autoId;
      data.editables[key] = el.innerHTML;
    });

    document.querySelectorAll('.link-btn').forEach((a, i) => {
      data.links[i] = a.getAttribute('href');
    });

    if(avatarImg.style.display === 'block') data.avatar = avatarImg.src;

    data.samples = sampleData;


    return data;
  }

  function saveData(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectEditableData()));
    } catch(err){
      console.warn('Could not save', err);
    }
  }

  function loadData(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const data = JSON.parse(raw);

      editableEls.forEach((el, i) => {
        const key = el.id || ('auto' + i);
        if(data.editables && data.editables[key] !== undefined){
          el.innerHTML = data.editables[key];
        }
      });

      document.querySelectorAll('.link-btn').forEach((a, i) => {
        if(data.links && data.links[i]) a.setAttribute('href', data.links[i]);
      });

      if(data.avatar){
        avatarImg.src = data.avatar;
        avatarImg.style.display   = 'block';
        avatarPlaceholder.style.display = 'none';
      }

      if(data.samples){
        SAMPLE_CATEGORIES.forEach(c => {
          if(Array.isArray(data.samples[c.key])){
            sampleData[c.key] = data.samples[c.key];
            while(sampleData[c.key].length < MIN_SLOTS) sampleData[c.key].push(null);
          }
        });
      }


    } catch(err){
      console.warn('Could not load', err);
    }
  }

  /* -- autosave while typing (debounced) -- */
  let saveTimer;
  document.addEventListener('input', (e) => {
    if(editing){
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveData, 500);
    }
  });

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
      '.edit-hint',
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
  loadData();
  renderSamples();

  // small delay so browser paints the page before animations fire
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      triggerEntranceAnimations();
      popInLinks();
    });
  });

})();