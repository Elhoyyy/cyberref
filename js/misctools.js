// ══════════════════════════════════════════════
// PERMISSIONS CALCULATOR
// ══════════════════════════════════════════════
function calcP() {
  const ids = ['ur','uw','ux','gr','gw','gx','or2','ow2','ox2'];
  const b = ids.map(id => document.getElementById(id).checked ? 1 : 0);
  const o = [b[0]*4+b[1]*2+b[2], b[3]*4+b[4]*2+b[5], b[6]*4+b[7]*2+b[8]];
  const oct = o.join('');
  const sym = '-' + (b[0]?'r':'-')+(b[1]?'w':'-')+(b[2]?'x':'-')
                  + (b[3]?'r':'-')+(b[4]?'w':'-')+(b[5]?'x':'-')
                  + (b[6]?'r':'-')+(b[7]?'w':'-')+(b[8]?'x':'-');
  document.getElementById('p-oct').textContent = oct;
  document.getElementById('p-sym').textContent = sym;
  document.getElementById('p-cmd').textContent = 'chmod ' + oct + ' fichero';
}

// ══════════════════════════════════════════════
// SUBNET CALCULATOR
// ══════════════════════════════════════════════
function calcSN() {
  const v = document.getElementById('sn-in').value.trim();
  const out = document.getElementById('sn-out');
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
  if (!m) {
    out.innerHTML = '<p style="color:var(--red);font-family:var(--mono);font-size:12px;margin-top:8px">Formato: 192.168.1.0/24</p>';
    return;
  }
  const [, a, b, c, d, prefix] = m.map(Number);
  if (prefix < 0 || prefix > 32) {
    out.innerHTML = '<p style="color:var(--red);font-family:var(--mono);font-size:12px;margin-top:8px">Prefijo entre 0 y 32</p>';
    return;
  }
  const ip = (a<<24>>>0) + (b<<16) + (c<<8) + d;
  const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32-prefix)) >>> 0;
  const net = (ip & mask) >>> 0;
  const bcast = (net | (~mask >>> 0)) >>> 0;
  const first = prefix < 31 ? net + 1 : net;
  const last = prefix < 31 ? bcast - 1 : bcast;
  const hosts = prefix < 31 ? Math.pow(2, 32-prefix) - 2 : (prefix === 31 ? 2 : 1);
  const toIP = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
  const toMask = p => {
    let s = '';
    for (let i = 0; i < 32; i++) s += i < p ? '1' : '0';
    return [s.slice(0,8),s.slice(8,16),s.slice(16,24),s.slice(24)].map(x => parseInt(x,2)).join('.');
  };
  out.innerHTML = `<table class="subnet-table">
    <tr><th>Campo</th><th>Valor</th></tr>
    <tr><td>Network</td><td>${toIP(net)}/${prefix}</td></tr>
    <tr><td>Netmask</td><td>${toMask(prefix)}</td></tr>
    <tr><td>Broadcast</td><td>${toIP(bcast)}</td></tr>
    <tr><td>First host</td><td>${toIP(first)}</td></tr>
    <tr><td>Last host</td><td>${toIP(last)}</td></tr>
    <tr><td>Hosts</td><td>${hosts.toLocaleString()}</td></tr>
    <tr><td>Wildcard</td><td>${toIP((~mask)>>>0)}</td></tr>
  </table>`;
}

// ══════════════════════════════════════════════
// CRON BUILDER
// ══════════════════════════════════════════════
function buildCron() {
  const f = id => document.getElementById(id).value || '*';
  const [min, hr, dm, mo, dw] = ['cr-min','cr-hr','cr-dm','cr-mo','cr-dw'].map(f);
  document.getElementById('cr-expr').textContent = `${min} ${hr} ${dm} ${mo} ${dw}`;
  const d = [];
  if (min.startsWith('*/')) d.push('cada ' + min.slice(2) + ' minutos');
  else if (min !== '*') d.push('minuto ' + min);
  if (hr.startsWith('*/')) d.push('cada ' + hr.slice(2) + ' horas');
  else if (hr !== '*') d.push('hora ' + hr);
  if (dm !== '*') d.push('día ' + dm + ' del mes');
  if (mo !== '*') d.push('mes ' + mo);
  if (dw !== '*') d.push('día sem ' + dw);
  if (!d.length) d.push('cada minuto');
  document.getElementById('cr-desc').textContent = d.join(' · ');
}
function setCron(e) {
  const p = e.split(' ');
  ['cr-min','cr-hr','cr-dm','cr-mo','cr-dw'].forEach((id, i) => {
    document.getElementById(id).value = p[i] || '*';
  });
  buildCron();
}

// ══════════════════════════════════════════════
// TIMESTAMP CONVERTER
// ══════════════════════════════════════════════
function tsConv() {
  const v = document.getElementById('ts-in').value.trim();
  if (!v) { setOut('ts-out', 'Introduce un valor', 'dim'); return; }
  if (/^\d{9,13}$/.test(v)) {
    const ms = v.length === 13 ? parseInt(v) : parseInt(v) * 1000;
    const d = new Date(ms);
    setOut('ts-out', `UTC: ${d.toUTCString()}\nISO: ${d.toISOString()}\nLocal: ${d.toLocaleString()}`);
  } else {
    const d = new Date(v);
    if (isNaN(d)) { setOut('ts-out', 'No es fecha válida', 'err'); return; }
    setOut('ts-out', `Unix (s): ${Math.floor(d.getTime()/1000)}\nUnix (ms): ${d.getTime()}\nISO: ${d.toISOString()}`);
  }
}
function tsNow() {
  document.getElementById('ts-in').value = Math.floor(Date.now()/1000);
  tsConv();
}

// ══════════════════════════════════════════════
// CIDR EXPANDER
// ══════════════════════════════════════════════
function expandCIDR() {
  const v = document.getElementById('ip-range').value.trim();
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
  if (!m) { setOut('ip-out', 'Formato: 192.168.1.0/28', 'err'); return; }
  const [, a, b, c, d, prefix] = m.map(Number);
  const total = Math.pow(2, 32-prefix);
  if (total > 256) { setOut('ip-out', 'Máximo /24 (256 IPs) para expansión', 'err'); return; }
  const base = (a<<24>>>0) + (b<<16) + (c<<8) + d;
  const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32-prefix)) >>> 0;
  const net = (base & mask) >>> 0;
  const toIP = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
  const ips = [];
  for (let i = 0; i < total; i++) ips.push(toIP((net+i)>>>0));
  setOut('ip-out', ips.join('\n'));
}
