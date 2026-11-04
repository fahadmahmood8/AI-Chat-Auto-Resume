(() => {
  if (window.__chatAutoResume) return;
  window.__chatAutoResume = true;
  const api = globalThis.browser ?? globalThis.chrome; // Firefox or Chrome

  const D = { autoClick: true, fallbackSend: false, tick: true, grace: 5, debug: false };
  let S = { ...D };
  const log = (...a) => { if (S.debug) console.log('%c[Chat Auto-Resume]', 'color:#d97757;font-weight:bold', ...a); };
  const force = (...a) => console.log('%c[Chat Auto-Resume]', 'color:#d97757;font-weight:bold', ...a);

  api.storage.local.get(D).then(s => { S = s; log('active on', location.host, '| settings:', JSON.stringify(S)); });
  api.storage.onChanged.addListener((c) => { for (const k in c) S[k] = c[k].newValue; });

  const KEY = 'car:' + location.host; // per-site, survives reloads
  // one gate: text must hint at a limit AND contain a digit (checked separately)
  const HINT_RE = /(limit|quota|too many|usage|reached|resets?|try again|come back|available again|wait|out of (free )?(messages|usage|requests|credits)|more messages)/i;
  const BTN_RE = /^\s*(continue|resume|retry|try again|continue generating|regenerate)\s*[.!]?\s*$/i;

  // ---------- parse wait time out of text ----------
  function parseWaitMs(t) {
    // relative: "in 2 hours 15 minutes", "try again in 45 min", "wait 30 seconds"
    const rel = t.match(/\b(?:in|after|wait(?:ing)?(?: for)?|for)\s+((?:\d+\s*(?:hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b[\s,and]*)+)/i);
    if (rel) {
      let ms = 0, any = false;
      for (const m of rel[1].matchAll(/(\d+)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/gi)) {
        const n = +m[1], u = m[2][0].toLowerCase();
        ms += n * (u === 'h' ? 3600e3 : u === 'm' ? 60e3 : 1e3); any = true;
      }
      if (any && ms > 0) return ms;
    }
    // absolute: "resets at 3:30 PM", "until 10:00 PM", "try again at 15:00", "resets 5pm"
    const abs = t.match(/(?:resets?|reset at|available|try again|until|back|again)\s*(?:at|on|after)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (abs) {
      let h = +abs[1], mi = +(abs[2] || 0); const ap = (abs[3] || '').toLowerCase();
      if (!ap && !abs[2]) return 0; // bare number, too ambiguous
      if (ap === 'pm' && h < 12) h += 12;
      if (ap === 'am' && h === 12) h = 0;
      if (h > 23 || mi > 59) return 0;
      const now = new Date(), tgt = new Date(now);
      tgt.setHours(h, mi, 0, 0);
      if (tgt <= now) {
        if (now - tgt < 90 * 60e3) return 0; // time just passed: stale banner, not a new 24h wait
        tgt.setDate(tgt.getDate() + 1);
      }
      return tgt - now;
    }
    return 0;
  }

  function visible(el) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }

  const seen = new Set();
  let lastNoneLog = 0;

  // returns { ms, text }; verbose = print every candidate to the console
  function scanForLimit(verbose) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode: n => /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|PRE|CODE)$/.test(n.tagName) || n.id === 'car-host'
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let ms = 0, text = '', n, cands = 0;
    while ((n = walker.nextNode())) {
      const raw = n.textContent;
      if (!raw || raw.length > 400 || raw.length < 12) continue;
      const t = raw.replace(/\s+/g, ' ').trim();
      if (t.length > 260 || t.length < 12) continue;
      if (n.children.length > 6) continue;
      if (!HINT_RE.test(t) || !/\d/.test(t)) continue;
      // ignore the conversation itself (what you or Claude wrote), only look at UI notices
      if (n.closest('[data-testid="user-message"], .standard-markdown')) continue;
      if (!visible(n)) continue;
      cands++;
      const w = parseWaitMs(t);
      if (verbose || (S.debug && !seen.has(t))) {
        seen.add(t);
        (verbose ? force : log)('candidate:', JSON.stringify(t), '→', w ? Math.round(w / 1000) + 's' : 'could not parse a wait time');
      }
      if (w > 0 && w < 24 * 3600e3 + 1) { ms = w; text = t; } // keep the last (newest) match
    }
    if (!cands && Date.now() - lastNoneLog > 60e3) { lastNoneLog = Date.now(); (verbose ? force : log)('scan: no limit-like text on the page'); }
    return { ms, text };
  }

  // ---------- state ----------
  let target = 0, total = 0, fired = false, isTest = false;
  let armedText = '';
  let needClear = false, handledText = '', handledAt = 0, rmTimer = null; // re-arm bookkeeping
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (s && s.target > Date.now() - 120e3) { target = s.target; total = s.total; armedText = s.armedText || ''; log('restored countdown after reload'); }
  } catch {}
  const save = () => { try { target ? sessionStorage.setItem(KEY, JSON.stringify({ target, total, armedText })) : sessionStorage.removeItem(KEY); } catch {} };

  function startCountdown(ms, why) {
    total = ms; target = Date.now() + total; fired = false; save();
    clearTimeout(rmTimer); ensureBar(); if (fill) fill.classList.remove('done');
    log('countdown started (' + why + '):', fmt(Math.ceil(ms / 1000)));
  }

  function scan() {
    if (target) return; // never reset an active countdown
    if (Date.now() < cooldownUntil) return;
    const r = scanForLimit(false);
    if (!r.ms) {
      if (needClear) { needClear = false; log('limit banner gone — watching for the next one'); }
      return;
    }
    // same banner we already resumed from, still on screen: don't re-arm on it
    if (needClear && r.text === handledText && Date.now() - handledAt < 20 * 60e3) return;
    needClear = false; isTest = false; armedText = r.text;
    startCountdown(r.ms + S.grace * 1000, 'detected "' + r.text + '"');
  }
  let cooldownUntil = 0, timer = null;
  const obs = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(scan, 800); });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  setInterval(scan, 5000);

  // ---------- messages from the popup (test / scan now) ----------
  api.runtime.onMessage.addListener((m, _sender, reply) => {
    if (!m) return;
    if (m.cmd === 'test') { cooldownUntil = 0; isTest = true; startCountdown(15e3, 'manual test'); reply({ ok: true }); return; }
    if (m.cmd === 'scan') { const r = scanForLimit(true); force('scan result:', r.ms ? r.text + ' → ' + Math.round(r.ms / 1000) + 's' : 'nothing usable found'); reply(r); return; }
  });

  // ---------- bar ----------
  let host, fill, label, audio;
  function ensureBar() {
    if (host && host.isConnected) return;
    host = document.createElement('div'); host.id = 'car-host';
    host.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;pointer-events:none';
    const sh = host.attachShadow({ mode: 'open' });
    sh.innerHTML = `
      <style>
        .bar{position:relative;height:30px;background:#1f1f1f;color:#fff;font:600 13px system-ui;display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:auto}
        .fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#d97757,#e9a23b);transition:width .25s linear}
        .fill.done{background:#2e9e5b}
        span{position:relative;text-shadow:0 1px 2px #0008}
        button{position:absolute;right:8px;top:4px;border:0;background:#0006;color:#fff;border-radius:4px;cursor:pointer;pointer-events:auto;padding:2px 8px}
        .pulse{animation:p 1s steps(2) infinite}@keyframes p{50%{opacity:.6}}
      </style>
      <div class="bar"><div class="fill"></div><span></span><button title="Cancel auto-resume">✕</button></div>`;
    fill = sh.querySelector('.fill'); label = sh.querySelector('span');
    sh.querySelector('button').onclick = cancel;
    document.documentElement.appendChild(host);
    addEventListener('click', () => { try { audio = audio || new AudioContext(); audio.resume(); } catch {} }, { once: true });
  }
  function cancel() { log('cancelled by user'); target = 0; total = 0; isTest = false; save(); host && host.remove(); cooldownUntil = Date.now() + 5 * 60e3; }

  const fmt = s => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':');
  let tickFlip = false;
  function tick() {
    if (!S.tick || !audio || audio.state !== 'running') return;
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = tickFlip ? 700 : 950; tickFlip = !tickFlip;
    g.gain.value = 0.04; o.connect(g); g.connect(audio.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.06); o.stop(audio.currentTime + 0.07);
  }

  // ---------- resume actions ----------
  function findContinueButton() {
    const els = document.querySelectorAll('button, [role="button"], a[role="button"]');
    for (const b of els) {
      if (b.closest('#car-host')) continue;
      const t = (b.innerText || b.getAttribute('aria-label') || '').trim();
      if (BTN_RE.test(t) && visible(b) && !b.disabled && b.getAttribute('aria-disabled') !== 'true') return b;
    }
    return null;
  }
  function sendContinueText() {
    const box = document.querySelector('div[contenteditable="true"], textarea, [role="textbox"]');
    if (!box) return false;
    box.focus();
    if (box.tagName === 'TEXTAREA') {
      const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      set.call(box, 'continue'); box.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      document.execCommand('selectAll'); document.execCommand('insertText', false, 'continue');
    }
    setTimeout(() => {
      const send = document.querySelector('button[aria-label*="send" i], button[data-testid*="send" i], button[type="submit"]');
      if (send && !send.disabled) send.click();
      else box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    }, 400);
    return true;
  }

  let attempts = 0;
  function resume() {
    log('time is up. autoClick =', S.autoClick, '| fallbackSend =', S.fallbackSend);
    if (!S.autoClick) return finish('Time is up — resume manually');
    const iv = setInterval(() => {
      attempts++;
      const b = findContinueButton();
      log('attempt', attempts, b ? 'found button: ' + (b.innerText || b.getAttribute('aria-label')) : 'no Continue/Retry button yet');
      if (b) { b.click(); clearInterval(iv); return finish('Resumed ✔'); }
      if (attempts === 8 && S.fallbackSend && sendContinueText()) { clearInterval(iv); return finish('Sent "continue" ✔'); }
      if (attempts > 40) { clearInterval(iv); finish('Time is up — no Continue button found'); }
    }, 3000);
  }
  function finish(msg) {
    log('finished:', msg);
    label.textContent = msg; fill.classList.add('done'); fill.style.width = '100%';
    target = 0; isTest = false; save(); attempts = 0;
    needClear = true; handledText = armedText; handledAt = Date.now(); cooldownUntil = Date.now() + 10e3;
    log('watching again — a new limit message will start a new countdown');
    clearTimeout(rmTimer); rmTimer = setTimeout(() => { if (!target && host) host.remove(); }, 8000);
  }

  // ---------- main loop ----------
  setInterval(() => {
    if (!target) return;
    ensureBar();
    const left = target - Date.now();
    if (left <= 0) {
      if (!fired) {
        fired = true;
        if (isTest) { finish('Test OK — real runs would resume now'); return; }
        label.textContent = 'Time is up — resuming…'; resume();
      }
      return;
    }
    fill.style.width = Math.max(0, Math.min(100, (left / total) * 100)) + '%';
    label.textContent = (isTest ? '🧪 TEST — ' : '⏳ ') + 'Chat resumes in ' + fmt(Math.ceil(left / 1000));
    tick();
  }, 1000);
  if (target) ensureBar();
  setTimeout(scan, 1500);
})();
