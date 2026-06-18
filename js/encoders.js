// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function setOut(id, txt, cls = '') {
  const el = document.getElementById(id);
  el.innerHTML = txt;
  el.className = 'out' + (cls ? ' ' + cls : '');
}

function copyText(t) {
  navigator.clipboard.writeText(t).then(() => {
    const tmp = document.createElement('div');
    tmp.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#39d353;color:#0d1117;padding:8px 16px;border-radius:6px;font-family:monospace;font-size:13px;z-index:9999';
    tmp.textContent = 'Copiado!';
    document.body.appendChild(tmp);
    setTimeout(() => tmp.remove(), 1500);
  });
}

function openLink(u) { window.open(u, '_blank'); }

// ══════════════════════════════════════════════
// BASE64
// ══════════════════════════════════════════════
function b64enc() {
  try { setOut('b64-out', btoa(unescape(encodeURIComponent(document.getElementById('b64-in').value)))); }
  catch (e) { setOut('b64-out', 'Error: ' + e.message, 'err'); }
}
function b64dec() {
  try { setOut('b64-out', decodeURIComponent(escape(atob(document.getElementById('b64-in').value.trim())))); }
  catch (e) { setOut('b64-out', 'Error: no es Base64 válido', 'err'); }
}
function b64url_enc() {
  try {
    const v = document.getElementById('b64-in').value;
    setOut('b64-out', btoa(unescape(encodeURIComponent(v))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
  } catch (e) { setOut('b64-out', 'Error', 'err'); }
}
function b64url_dec() {
  try {
    let v = document.getElementById('b64-in').value.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (v.length % 4) v += '=';
    setOut('b64-out', decodeURIComponent(escape(atob(v))));
  } catch (e) { setOut('b64-out', 'Error', 'err'); }
}

// ══════════════════════════════════════════════
// ROT / CAESAR
// ══════════════════════════════════════════════
function rotStr(s, n) {
  return s.replace(/[a-zA-Z]/g, c => {
    const b = c < 'a' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - b + n) % 26) + b);
  });
}
function rotEnc() {
  const n = parseInt(document.getElementById('rot-n').value) || 13;
  setOut('rot-out', rotStr(document.getElementById('rot-in').value, n));
}
function rotDec() {
  const n = parseInt(document.getElementById('rot-n').value) || 13;
  setOut('rot-out', rotStr(document.getElementById('rot-in').value, 26 - n));
}
function rotBrute() {
  const t = document.getElementById('rot-in').value;
  let o = '';
  for (let i = 1; i <= 25; i++) o += `ROT${String(i).padStart(2, '0')}: ${rotStr(t, i)}\n`;
  setOut('rot-out', o);
}

// ══════════════════════════════════════════════
// HEX
// ══════════════════════════════════════════════
function hexEnc() {
  setOut('hex-out', Array.from(document.getElementById('hex-in').value).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
}
function hexDec() {
  try {
    const v = document.getElementById('hex-in').value.replace(/\s|0x/g, '').replace(/,/g, '');
    setOut('hex-out', String.fromCharCode(...v.match(/.{1,2}/g).map(h => parseInt(h, 16))));
  } catch (e) { setOut('hex-out', 'Error: hex inválido', 'err'); }
}
function hexToInt() {
  try {
    const v = document.getElementById('hex-in').value.trim();
    setOut('hex-out', String(parseInt(v.replace(/^0x/, ''), 16)));
  } catch (e) { setOut('hex-out', 'Error', 'err'); }
}
function hexXor() {
  try {
    const bytes = document.getElementById('hex-in').value.replace(/\s|0x/g, '').match(/.{1,2}/g).map(h => parseInt(h, 16));
    let o = '';
    for (let k = 0; k < 256; k++) {
      const d = bytes.map(b => b ^ k).map(b => (b >= 32 && b < 127) ? String.fromCharCode(b) : '.').join('');
      if (/flag|CTF|HTB|ctf|\{/i.test(d)) o += `key=0x${k.toString(16).padStart(2, '0')}: ${d}\n`;
    }
    setOut('hex-out', o || 'Sin hits. Prueba Hex→Texto normal.');
  } catch (e) { setOut('hex-out', 'Error: ' + e.message, 'err'); }
}

// ══════════════════════════════════════════════
// URL / HTML / UNICODE
// ══════════════════════════════════════════════
function urlEnc() { setOut('url-out', encodeURIComponent(document.getElementById('url-in').value)); }
function urlDec() {
  try { setOut('url-out', decodeURIComponent(document.getElementById('url-in').value)); }
  catch (e) { setOut('url-out', 'Error: ' + e.message, 'err'); }
}
function htmlEnc() {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(document.getElementById('url-in').value));
  setOut('url-out', d.innerHTML);
}
function htmlDec() {
  const d = document.createElement('div');
  d.innerHTML = document.getElementById('url-in').value;
  setOut('url-out', d.textContent);
}
function unicodePts() {
  const v = document.getElementById('url-in').value;
  setOut('url-out', Array.from(v).map(c => '\\u' + c.codePointAt(0).toString(16).padStart(4, '0')).join(''));
}

// ══════════════════════════════════════════════
// BINARY / OCTAL / MORSE
// ══════════════════════════════════════════════
const MO = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'};
const MOR = Object.fromEntries(Object.entries(MO).map(([k, v]) => [v, k]));

function binDec() {
  try { setOut('bin-out', document.getElementById('bin-in').value.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('')); }
  catch (e) { setOut('bin-out', 'Error: ' + e.message, 'err'); }
}
function textBin() {
  setOut('bin-out', Array.from(document.getElementById('bin-in').value).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '));
}
function octDec() {
  try { setOut('bin-out', document.getElementById('bin-in').value.trim().split(/\s+/).map(o => String.fromCharCode(parseInt(o, 8))).join('')); }
  catch (e) { setOut('bin-out', 'Error', 'err'); }
}
function morseEnc() {
  setOut('bin-out', document.getElementById('bin-in').value.toUpperCase().split('').map(c => c === ' ' ? '/' : (MO[c] || '?')).join(' '));
}
function morseDec() {
  setOut('bin-out', document.getElementById('bin-in').value.trim().split(' / ').map(w => w.split(' ').map(s => MOR[s] || '?').join('')).join(' '));
}

// ══════════════════════════════════════════════
// NUMBER BASES
// ══════════════════════════════════════════════
function convertBases() {
  const v = document.getElementById('base-in').value.trim();
  const from = parseInt(document.getElementById('base-from').value);
  if (!v) { setOut('base-out', 'Introduce un valor', 'dim'); return; }
  try {
    const n = parseInt(v, from);
    if (isNaN(n)) { setOut('base-out', 'Valor inválido para base ' + from, 'err'); return; }
    setOut('base-out', `Dec: ${n}\nBin: ${n.toString(2)}\nOct: ${n.toString(8)}\nHex: ${n.toString(16).toUpperCase()}`);
  } catch (e) { setOut('base-out', 'Error', 'err'); }
}

// ══════════════════════════════════════════════
// JWT
// ══════════════════════════════════════════════
function jwtDecode() {
  const v = document.getElementById('jwt-in').value.trim();
  const parts = v.split('.');
  if (parts.length < 2) { setOut('jwt-out', 'No parece un JWT', 'err'); return; }
  try {
    const pad = s => s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4);
    const header = JSON.parse(atob(pad(parts[0])));
    const payload = JSON.parse(atob(pad(parts[1])));
    let o = '=== HEADER ===\n' + JSON.stringify(header, null, 2) + '\n\n=== PAYLOAD ===\n' + JSON.stringify(payload, null, 2);
    if (payload.exp) o += '\n\n=== EXPIRY ===\n' + new Date(payload.exp * 1000).toISOString();
    if (payload.iat) o += '\n=== ISSUED AT ===\n' + new Date(payload.iat * 1000).toISOString();
    setOut('jwt-out', o);
  } catch (e) { setOut('jwt-out', 'Error decodificando: ' + e.message, 'err'); }
}
function jwtNoneAlg() {
  const v = document.getElementById('jwt-in').value.trim();
  const parts = v.split('.');
  if (parts.length < 2) { setOut('jwt-out', 'No parece un JWT', 'err'); return; }
  try {
    const hB64 = btoa(JSON.stringify({alg: "none", typ: "JWT"})).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    setOut('jwt-out', '[none-alg forgery]\n' + hB64 + '.' + parts[1] + '.');
  } catch (e) { setOut('jwt-out', 'Error: ' + e.message, 'err'); }
}

// ══════════════════════════════════════════════
// CLASSIC CIPHERS
// ══════════════════════════════════════════════
function switchCipher(btn, tab) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('cipher-' + tab).classList.add('active');
}
function atbash() {
  const v = document.getElementById('cipher-in').value;
  setOut('cipher-out', v.replace(/[a-zA-Z]/g, c => {
    const b = c < 'a' ? 65 : 97;
    return String.fromCharCode(b + (25 - (c.charCodeAt(0) - b)));
  }));
}
function vigEnc() {
  const k = document.getElementById('vig-key').value.toUpperCase().replace(/[^A-Z]/g, '');
  const t = document.getElementById('cipher-in').value;
  if (!k) { setOut('cipher-out', 'Introduce una clave', 'err'); return; }
  let o = '', ki = 0;
  for (const c of t) {
    if (/[a-zA-Z]/.test(c)) {
      const b = c < 'a' ? 65 : 97;
      o += String.fromCharCode((c.charCodeAt(0) - b + k.charCodeAt(ki % k.length) - 65 + 26) % 26 + b);
      ki++;
    } else o += c;
  }
  setOut('cipher-out', o);
}
function vigDec() {
  const k = document.getElementById('vig-key').value.toUpperCase().replace(/[^A-Z]/g, '');
  const t = document.getElementById('cipher-in').value;
  if (!k) { setOut('cipher-out', 'Introduce una clave', 'err'); return; }
  let o = '', ki = 0;
  for (const c of t) {
    if (/[a-zA-Z]/.test(c)) {
      const b = c < 'a' ? 65 : 97;
      o += String.fromCharCode((c.charCodeAt(0) - b - (k.charCodeAt(ki % k.length) - 65) + 26) % 26 + b);
      ki++;
    } else o += c;
  }
  setOut('cipher-out', o);
}

// ══════════════════════════════════════════════
// HASH IDENTIFY / GENERATE
// ══════════════════════════════════════════════
async function sha(a, m) {
  const b = await crypto.subtle.digest(a, new TextEncoder().encode(m));
  return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
}
async function generateHashes() {
  const v = document.getElementById('hash-in').value;
  const c = document.getElementById('hash-out');
  c.style.display = 'grid';
  c.innerHTML = '<div class="hash-item"><div class="hash-label">calculando...</div></div>';
  const algos = [['SHA-1', 'SHA-1'], ['SHA-256', 'SHA-256'], ['SHA-384', 'SHA-384'], ['SHA-512', 'SHA-512']];
  const res = await Promise.all(algos.map(([a, l]) => sha(a, v).then(h => [l, h])));
  c.innerHTML = '';
  res.forEach(([label, hash]) => {
    const el = document.createElement('div');
    el.className = 'hash-item';
    el.innerHTML = `<div class="hash-label">${label}</div><div class="hash-value">${hash}</div>`;
    el.title = 'Click to copy';
    el.onclick = () => copyText(hash);
    c.appendChild(el);
  });
}
function identHash() {
  const h = document.getElementById('hash-in').value.trim();
  const c = document.getElementById('hash-out');
  c.style.display = 'grid';
  let type = 'desconocido';
  if (/^[0-9a-fA-F]{32}$/.test(h)) type = 'MD5 o NTLM (32 hex) → hashcat -m 0 / -m 1000';
  else if (/^[0-9a-fA-F]{40}$/.test(h)) type = 'SHA-1 (40 hex) → hashcat -m 100';
  else if (/^[0-9a-fA-F]{56}$/.test(h)) type = 'SHA-224 (56 hex) → hashcat -m 1300';
  else if (/^[0-9a-fA-F]{64}$/.test(h)) type = 'SHA-256 (64 hex) → hashcat -m 1400';
  else if (/^[0-9a-fA-F]{96}$/.test(h)) type = 'SHA-384 (96 hex) → hashcat -m 10800';
  else if (/^[0-9a-fA-F]{128}$/.test(h)) type = 'SHA-512 (128 hex) → hashcat -m 1700';
  else if (/^\$1\$/.test(h)) type = 'MD5crypt → hashcat -m 500';
  else if (/^\$5\$/.test(h)) type = 'SHA256crypt → hashcat -m 7400';
  else if (/^\$6\$/.test(h)) type = 'SHA512crypt → hashcat -m 1800';
  else if (/^\$2[aby]\$/.test(h)) type = 'bcrypt → hashcat -m 3200';
  else if (/^[A-Za-z0-9+/]{20,}={0,2}$/.test(h.trim())) type = 'probablemente Base64';
  else if (h.includes(':')) type = 'posible hash:salt';
  c.innerHTML = `<div class="hash-item" style="grid-column:1/-1"><div class="hash-label">tipo detectado</div><div class="hash-value" style="color:var(--purple)">${type}</div></div>`;
}

// ══════════════════════════════════════════════
// ENCODER CHAIN
// ══════════════════════════════════════════════
function applyOp(v, op) {
  if (!op) return v;
  switch (op) {
    case 'b64e': return btoa(unescape(encodeURIComponent(v)));
    case 'b64d': return decodeURIComponent(escape(atob(v.trim())));
    case 'url': return encodeURIComponent(v);
    case 'urld': return decodeURIComponent(v);
    case 'hex': return Array.from(v).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    case 'hexd': return String.fromCharCode(...v.replace(/\s/g, '').match(/.{1,2}/g).map(h => parseInt(h, 16)));
    case 'rev': return v.split('').reverse().join('');
    case 'upper': return v.toUpperCase();
    case 'lower': return v.toLowerCase();
    default: return v;
  }
}
function runChain() {
  let v = document.getElementById('chain-in').value;
  try {
    const ops = ['chain-op1', 'chain-op2', 'chain-op3'].map(id => document.getElementById(id).value);
    let steps = '';
    ops.forEach((op, i) => {
      if (!op) return;
      v = applyOp(v, op);
      steps += `[${i+1}] ${op}: ${v.substring(0,80)}${v.length>80?'...':''}\n`;
    });
    setOut('chain-out', steps + '---\nResultado: ' + v);
  } catch (e) { setOut('chain-out', 'Error: ' + e.message, 'err'); }
}
