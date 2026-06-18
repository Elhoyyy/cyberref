// ══════════════════════════════════════════════
// NAV ACTIVE STATE ON SCROLL
// ══════════════════════════════════════════════
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}, { passive: true });

// ══════════════════════════════════════════════
// COPY BUTTONS on every .cmd-item
// ══════════════════════════════════════════════
document.querySelectorAll('.cmd-item').forEach(item => {
  const code = item.querySelector('.cmd-code');
  if (!code) return;
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'copy';
  btn.onclick = () => {
    navigator.clipboard.writeText(code.textContent).then(() => {
      btn.textContent = 'ok';
      btn.classList.add('ok');
      setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('ok'); }, 1500);
    });
  };
  item.appendChild(btn);
});

// ══════════════════════════════════════════════
// INITIALIZE WIDGETS ON LOAD
// ══════════════════════════════════════════════
calcP();
calcSN();
buildCron();
runRx();
