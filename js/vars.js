// ══════════════════════════════════════════════
// VARIABLES DINÁMICAS — sustitución global de tokens
// Cambia un valor (IP, puerto, target, pattern...) y todos
// los comandos se actualizan. El "copy" sale ya sustituido.
// ══════════════════════════════════════════════
(function () {
  const STORE = 'cyberref-vars';
  const COLLAPSE = 'cyberref-vars-collapsed';

  // Definición de variables: key = nombre interno, label = etiqueta visible,
  // def = valor por defecto, ph = placeholder de ayuda.
  const VARS = [
    { key: 'LHOST',    label: 'LHOST / IP',  def: '10.10.14.1',  ph: 'tu IP (atacante)' },
    { key: 'LPORT',    label: 'LPORT / PORT', def: '4444',       ph: 'puerto listener' },
    { key: 'SRVPORT',  label: 'SRVPORT',     def: '8000',        ph: 'puerto servidor HTTP' },
    { key: 'RHOST',    label: 'RHOST',       def: '10.10.10.10', ph: 'IP víctima' },
    { key: 'USER',     label: 'USER',        def: 'user',        ph: 'usuario' },
    { key: 'PASS',     label: 'PASS',        def: 'password',    ph: 'contraseña' },
    { key: 'DOMAIN',   label: 'DOMAIN',      def: 'target.com',  ph: 'dominio' },
    { key: 'URL',      label: 'URL',         def: 'http://10.10.10.10', ph: 'url objetivo' },
    { key: 'WORDLIST', label: 'WORDLIST',    def: '/usr/share/wordlists/rockyou.txt', ph: 'ruta wordlist' },
    { key: 'LFILE',    label: 'LFILE',       def: 'file',        ph: 'fichero' },
    { key: 'PATTERN',  label: 'PATTERN',     def: 'pattern',     ph: 'patrón / palabra' },
  ];

  // Valores actuales (cargados de localStorage o por defecto)
  let values = {};
  try { values = JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { values = {}; }
  VARS.forEach(v => { if (values[v.key] === undefined || values[v.key] === '') values[v.key] = v.def; });

  // Token alterna → valores. Mayúsculas distintivas + minúsculas seguras
  // (verificadas: no colisionan con texto real de comandos).
  // Límites propios: ni letras/dígitos ni guion alrededor, para no tocar
  // subcomandos como `git remote set-url` o flags con guion.
  const RE = /(?<![\w-])(?:LHOST|IP|LPORT|PORT|SRVPORT|RHOST|USER|PASS|DOMAIN|domain|URL|url|WORDLIST|wl|LFILE|PATTERN|pattern)(?![\w-])/g;
  function mapTok(m) {
    switch (m) {
      case 'LHOST': case 'IP':       return values.LHOST;
      case 'SRVPORT':                return values.SRVPORT;
      case 'LPORT': case 'PORT':     return values.LPORT;
      case 'RHOST':                  return values.RHOST;
      case 'USER':                   return values.USER;
      case 'PASS':                   return values.PASS;
      case 'DOMAIN': case 'domain':  return values.DOMAIN;
      case 'URL': case 'url':        return values.URL;
      case 'WORDLIST': case 'wl':    return values.WORDLIST;
      case 'LFILE':                  return values.LFILE;
      case 'PATTERN': case 'pattern':return values.PATTERN;
    }
    return m;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
  }

  // Renderiza una plantilla a HTML con los tokens resaltados y sustituidos.
  function render(tpl) {
    let out = '', last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(tpl))) {
      out += esc(tpl.slice(last, m.index));
      const val = mapTok(m[0]);
      out += '<span class="cmd-var" title="' + esc(m[0]) + '">' + esc(val) + '</span>';
      last = m.index + m[0].length;
    }
    out += esc(tpl.slice(last));
    return out;
  }

  // Aplica la sustitución a todos los comandos (y rutas de wordlist).
  function applyVars() {
    document.querySelectorAll('.cmd-code, .wl-path').forEach(el => {
      let tpl = el.getAttribute('data-tpl');
      if (tpl === null) { tpl = el.textContent; el.setAttribute('data-tpl', tpl); }
      el.innerHTML = render(tpl);
    });
    // Si hay una búsqueda activa, re-aplicar el resaltado de búsqueda.
    const si = document.getElementById('global-search');
    if (si && si.value.trim() && typeof doSearch === 'function') doSearch();
  }

  function save() { try { localStorage.setItem(STORE, JSON.stringify(values)); } catch (e) {} }

  // ── Construir la UI ──────────────────────────
  function buildBar() {
    const bar = document.getElementById('vars-bar');
    if (!bar) return;
    const collapsed = localStorage.getItem(COLLAPSE) === '1';

    const head = document.createElement('div');
    head.className = 'vars-head';
    head.innerHTML = '<span class="vars-title">// variables</span>' +
      '<span class="vars-sub">cambia un valor y todos los comandos + el copy se actualizan</span>' +
      '<span class="vars-chevron">▾</span>';

    const grid = document.createElement('div');
    grid.className = 'vars-grid';
    VARS.forEach(v => {
      const f = document.createElement('div');
      f.className = 'var-field';
      const id = 'var-' + v.key;
      f.innerHTML = '<label for="' + id + '">' + v.label + '</label>';
      const inp = document.createElement('input');
      inp.type = 'text'; inp.id = id; inp.value = values[v.key];
      inp.placeholder = v.ph; inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.addEventListener('input', () => {
        values[v.key] = inp.value === '' ? v.def : inp.value;
        save(); applyVars();
      });
      f.appendChild(inp);
      grid.appendChild(f);
    });

    const actions = document.createElement('div');
    actions.className = 'vars-actions';
    const reset = document.createElement('button');
    reset.className = 'tbtn'; reset.textContent = 'reset';
    reset.onclick = () => {
      VARS.forEach(v => {
        values[v.key] = v.def;
        const inp = document.getElementById('var-' + v.key);
        if (inp) inp.value = v.def;
      });
      save(); applyVars();
    };
    const hint = document.createElement('span');
    hint.className = 'vars-hint';
    hint.textContent = 'tokens: IP·PORT·SRVPORT·RHOST·USER·PASS·DOMAIN·URL·WORDLIST·LFILE·PATTERN';
    actions.appendChild(reset);
    actions.appendChild(hint);

    const wrap = document.createElement('div');
    wrap.className = 'vars-bar' + (collapsed ? ' collapsed' : '');
    wrap.appendChild(head); wrap.appendChild(grid); wrap.appendChild(actions);
    head.addEventListener('click', () => {
      wrap.classList.toggle('collapsed');
      localStorage.setItem(COLLAPSE, wrap.classList.contains('collapsed') ? '1' : '0');
    });
    bar.appendChild(wrap);
  }

  // Exponer para builders y search.js
  window.getVar = k => values[k];
  window.refreshVars = applyVars;

  buildBar();
  applyVars();
})();
