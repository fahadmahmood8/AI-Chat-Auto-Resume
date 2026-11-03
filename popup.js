const api = globalThis.browser ?? globalThis.chrome; // Firefox or Chrome
const D = { autoClick: true, fallbackSend: false, tick: true, grace: 5, debug: true };
api.storage.local.get(D).then(s => {
  for (const k in D) {
    const el = document.getElementById(k);
    if (el.type === 'checkbox') el.checked = s[k]; else el.value = s[k];
    el.addEventListener('change', () =>
      api.storage.local.set({ [k]: el.type === 'checkbox' ? el.checked : Number(el.value) || 0 }));
  }
});

const out = document.getElementById('out');
const NOREPLY = 'No reply from this tab. Open a supported chat site and reload that tab once after installing.';
async function send(cmd) {
  try {
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    return await api.tabs.sendMessage(tab.id, { cmd });
  } catch (e) { return null; }
}
document.getElementById('test').onclick = async () => {
  const r = await send('test');
  out.textContent = r ? 'Test bar started at the top of the page.' : NOREPLY;
};
document.getElementById('scan').onclick = async () => {
  const r = await send('scan');
  out.textContent = !r ? NOREPLY
    : r.ms ? 'Found: "' + r.text + '" → ' + Math.round(r.ms / 1000) + 's left'
    : 'No usable limit message found. Details are in the page console (F12).';
};
