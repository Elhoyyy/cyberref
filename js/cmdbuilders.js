// ══════════════════════════════════════════════
// GREP BUILDER
// ══════════════════════════════════════════════
function gv(k, fallback) { return (window.getVar && window.getVar(k)) || fallback; }

function buildGrep() {
  const pattern = document.getElementById('gb-pattern').value || gv('PATTERN', 'pattern');
  const path = document.getElementById('gb-path').value || '.';
  let flags = '';
  if (document.getElementById('gb-r').checked) flags += 'r';
  if (document.getElementById('gb-i').checked) flags += 'i';
  if (document.getElementById('gb-v').checked) flags += 'v';
  if (document.getElementById('gb-n').checked) flags += 'n';
  if (document.getElementById('gb-E').checked) flags += 'E';
  if (document.getElementById('gb-o').checked) flags += 'o';
  if (document.getElementById('gb-c').checked) flags += 'c';
  const flagStr = flags ? ' -' + flags : '';
  setOut('gb-out', `grep${flagStr} "${pattern}" ${path}`);
}

// ══════════════════════════════════════════════
// FIND BUILDER
// ══════════════════════════════════════════════
function buildFind() {
  const path = document.getElementById('fb-path').value || '.';
  const name = document.getElementById('fb-name').value;
  let parts = ['find', path];

  if (document.getElementById('fb-type-f').checked) parts.push('-type f');
  if (name) parts.push(`-name "${name}"`);
  if (document.getElementById('fb-suid').checked) parts.push('-perm -4000');
  if (document.getElementById('fb-sgid').checked) parts.push('-perm -2000');
  if (document.getElementById('fb-writable').checked) parts.push('-writable');

  const mmin = document.getElementById('fb-mmin').value;
  if (mmin) parts.push(`-mmin ${mmin}`);

  const user = document.getElementById('fb-user').value;
  if (user) parts.push(`-user ${user}`);

  if (document.getElementById('fb-stderr').checked) parts.push('2>/dev/null');

  setOut('fb-out', parts.join(' '));
}

// ══════════════════════════════════════════════
// SED BUILDER
// ══════════════════════════════════════════════
function buildSed() {
  const find = document.getElementById('sb-find').value || gv('PATTERN', 'old');
  const replace = document.getElementById('sb-replace').value || 'new';
  const file = document.getElementById('sb-file').value || gv('LFILE', 'file');
  let suffix = '';
  if (document.getElementById('sb-g').checked) suffix += 'g';
  if (document.getElementById('sb-case').checked) suffix += 'I';

  const inplace = document.getElementById('sb-i').checked ? '-i ' : '';
  setOut('sb-out', `sed ${inplace}'s/${find}/${replace}/${suffix}' ${file}`);
}

// ══════════════════════════════════════════════
// NMAP BUILDER
// ══════════════════════════════════════════════
function buildNmap() {
  const target = document.getElementById('nb-target').value || gv('RHOST', 'target');
  const ports = document.getElementById('nb-ports').value;
  let flags = [];

  if (document.getElementById('nb-sV').checked) flags.push('-sV');
  if (document.getElementById('nb-sC').checked) flags.push('-sC');
  if (document.getElementById('nb-A').checked) flags.push('-A');
  if (document.getElementById('nb-Pn').checked) flags.push('-Pn');
  if (document.getElementById('nb-sU').checked) flags.push('-sU');
  if (document.getElementById('nb-vuln').checked) flags.push('--script vuln');

  if (document.getElementById('nb-allports').checked) {
    flags.push('-p-');
  } else if (ports) {
    flags.push('-p' + ports);
  }

  const rate = document.getElementById('nb-rate').value;
  if (rate) flags.push(rate);

  if (document.getElementById('nb-oA').checked) flags.push('-oA scan');

  setOut('nb-out', `nmap ${flags.join(' ')} ${target}`.replace(/\s+/g, ' ').trim());
}
