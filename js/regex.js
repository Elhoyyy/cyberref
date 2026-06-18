// ══════════════════════════════════════════════
// REGEX TESTER
// ══════════════════════════════════════════════
function runRx() {
  const p = document.getElementById('rx-p').value;
  const f = document.getElementById('rx-f').value;
  const t = document.getElementById('rx-t').value;
  const out = document.getElementById('rx-out');
  document.getElementById('rx-err').textContent = '';
  if (!p) {
    out.textContent = t;
    document.getElementById('rx-count').textContent = '0 matches';
    return;
  }
  try {
    const flagsG = f.includes('g') ? f : f + 'g';
    const ms = [...t.matchAll(new RegExp(p, flagsG))];
    document.getElementById('rx-count').textContent = ms.length + ' match' + (ms.length !== 1 ? 'es' : '');
    const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escPattern = p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    out.innerHTML = esc.replace(new RegExp(escPattern, f), '<mark class="regex-match">$&</mark>');
  } catch (e) {
    document.getElementById('rx-err').textContent = e.message;
    out.textContent = t;
    document.getElementById('rx-count').textContent = 'error';
  }
}

const rxP = {
  ip: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
  ip6: '(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}',
  cidr: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}/\\d{1,2}\\b',
  email: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',
  url: 'https?://[^\\s"\'<>]+',
  mac: '(?:[0-9a-fA-F]{2}[:\\-]){5}[0-9a-fA-F]{2}',
  jwt: 'eyJ[A-Za-z0-9_\\-]+\\.eyJ[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+',
  b64: '[A-Za-z0-9+/]{20,}={0,2}',
  hash32: '\\b[0-9a-fA-F]{32}\\b',
  hash40: '\\b[0-9a-fA-F]{40}\\b',
  hash64: '\\b[0-9a-fA-F]{64}\\b',
  cve: 'CVE-\\d{4}-\\d{4,}',
  privkey: '-----BEGIN [A-Z ]+ PRIVATE KEY-----',
  winpath: '[A-Z]:\\\\\\\\(?:[^\\\\\\\\/:*?"<>|\\r\\n]+\\\\\\\\)*[^\\\\\\\\/:*?"<>|\\r\\n]*',
  unixpath: '/(?:[\\w.-]+/)*[\\w.-]*',
  sqlstr: "'[^']*'|\\\"[^\\\"]*\\\"|'\\\\s*OR\\\\s*'",
  xss: '<script|onerror=|onload=|javascript:|<svg|<img[^>]+on',
  ssn: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
  cc: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\\b'
};

function loadRxP() {
  const s = document.getElementById('rx-preset').value;
  if (rxP[s]) {
    document.getElementById('rx-p').value = rxP[s];
    runRx();
  }
}
