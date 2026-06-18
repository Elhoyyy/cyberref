// ══════════════════════════════════════════════
// GLOBAL SEARCH
// ══════════════════════════════════════════════
const searchInput = document.getElementById('global-search');
const searchClear = document.getElementById('search-clear');
const searchStats = document.getElementById('search-stats');
const noResults = document.getElementById('no-results');
const noResultsQ = document.getElementById('no-results-query');

searchInput.addEventListener('input', doSearch);
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function doSearch() {
  const q = searchInput.value.trim().toLowerCase();
  searchClear.style.display = q ? 'block' : 'none';

  if (!q) {
    searchStats.textContent = '';
    noResults.style.display = 'none';
    document.querySelectorAll('section').forEach(s => s.classList.remove('all-hidden'));
    document.querySelectorAll('.cmd-item').forEach(i => {
      i.classList.remove('hidden');
      i.querySelectorAll('.cmd-code, .cmd-comment').forEach(el => { el.innerHTML = el.textContent; });
    });
    document.querySelectorAll('.cmd-card').forEach(c => c.classList.remove('all-hidden'));
    if (window.refreshVars) window.refreshVars();
    return;
  }

  let totalMatches = 0;
  const terms = q.split(/\s+/);

  document.querySelectorAll('.cmd-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    const matches = terms.every(t => text.includes(t));
    item.classList.toggle('hidden', !matches);
    if (matches) {
      totalMatches++;
      item.querySelectorAll('.cmd-code, .cmd-comment').forEach(el => {
        let html = el.textContent;
        terms.forEach(t => {
          if (!t) return;
          html = html.replace(new RegExp(escRx(t), 'gi'), m => `<mark class="search-highlight">${m}</mark>`);
        });
        el.innerHTML = html;
      });
    } else {
      item.querySelectorAll('.cmd-code, .cmd-comment').forEach(el => { el.innerHTML = el.textContent; });
    }
  });

  document.querySelectorAll('.cmd-card').forEach(card => {
    const visible = [...card.querySelectorAll('.cmd-item')].some(i => !i.classList.contains('hidden'));
    card.classList.toggle('all-hidden', !visible);
  });

  let visibleSections = 0;
  document.querySelectorAll('section').forEach(sec => {
    const hasVisible = [...sec.querySelectorAll('.cmd-item')].some(i => !i.classList.contains('hidden'));
    sec.classList.toggle('all-hidden', !hasVisible);
    if (hasVisible) visibleSections++;
  });

  noResults.style.display = totalMatches === 0 ? 'block' : 'none';
  noResultsQ.textContent = q;
  searchStats.textContent = totalMatches > 0
    ? `${totalMatches} resultado${totalMatches !== 1 ? 's' : ''} en ${visibleSections} sección${visibleSections !== 1 ? 'es' : ''}`
    : '';
}

function clearSearch() {
  searchInput.value = '';
  doSearch();
  searchInput.focus();
}
