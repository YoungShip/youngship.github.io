(() => {
  'use strict';

  const root = document.documentElement;
  const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const effectiveTheme = () => root.dataset.theme || (darkScheme.matches ? 'dark' : 'light');
  function syncTheme() {
    themeToggle?.setAttribute('aria-pressed', String(effectiveTheme() === 'dark'));
    const color = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (color) document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute('content', color));
  }
  themeToggle?.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    // Choosing the system theme again clears the override, so later system changes apply.
    if (next === (darkScheme.matches ? 'dark' : 'light')) {
      delete root.dataset.theme;
      try { localStorage.removeItem('theme'); } catch { /* Storage may be unavailable. */ }
    } else {
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch { /* Storage may be unavailable. */ }
    }
    syncTheme();
  });
  darkScheme.addEventListener?.('change', syncTheme);
  syncTheme();

  const header = document.querySelector('[data-header]');
  const scrollHandlers = [];
  let lastY = window.scrollY;
  let scrollScheduled = false;
  function onScroll() {
    scrollScheduled = false;
    const y = Math.max(0, window.scrollY);
    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      if (!document.body.classList.contains('toc-open')) {
        if (y > lastY + 6 && y > 160) header.classList.add('is-hidden');
        else if (y < lastY - 6 || y <= 160) header.classList.remove('is-hidden');
      }
    }
    if (Math.abs(y - lastY) > 6) lastY = y;
    scrollHandlers.forEach(handler => handler(y));
  }
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  const archive = document.querySelector('[data-archive]');
  if (archive) {
    const input = archive.querySelector('input[type="search"]');
    const buttons = [...archive.querySelectorAll('[data-filter]')];
    const notes = [...archive.querySelectorAll('[data-note]')];
    const months = [...archive.querySelectorAll('[data-month]')];
    const count = archive.querySelector('[data-result-count]');
    const empty = archive.querySelector('[data-empty]');
    const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim();
    const searchText = new Map(notes.map(note => [note, normalize(note.dataset.search)]));
    let filter = 'all';
    function applyFilters(updateAddress = true) {
      const words = normalize(input.value).split(/\s+/u).filter(Boolean);
      let visible = 0;
      notes.forEach(note => {
        const inCategory = filter === 'all' || (filter.startsWith('tag:')
          ? note.dataset.tags.split(' ').includes(filter.slice(4))
          : note.dataset.category === filter);
        note.hidden = !inCategory || !words.every(word => searchText.get(note).includes(word));
        if (!note.hidden) visible++;
      });
      months.forEach(month => { month.hidden = !month.querySelector('[data-note]:not([hidden])'); });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
      count.textContent = words.length || filter !== 'all' ? `找到 ${visible} 篇 · 共 ${notes.length} 篇` : `共 ${notes.length} 篇记录`;
      empty.hidden = visible !== 0;
      if (updateAddress) {
        const url = new URL(location.href);
        input.value.trim() ? url.searchParams.set('q', input.value.trim()) : url.searchParams.delete('q');
        filter === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', filter);
        url.hash = '';
        history.replaceState(null, '', url);
      }
    }
    function readAddress() {
      const url = new URL(location.href);
      input.value = url.searchParams.get('q') || '';
      let hash = '';
      try { hash = decodeURIComponent(url.hash.slice(1)); } catch { /* Ignore invalid external fragments. */ }
      const requested = url.searchParams.get('category') || hash;
      filter = buttons.some(button => button.dataset.filter === requested) ? requested : 'all';
      applyFilters(false);
    }
    input.addEventListener('input', () => applyFilters());
    buttons.forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      applyFilters();
    }));
    archive.querySelector('[data-clear]').addEventListener('click', () => {
      input.value = '';
      filter = 'all';
      applyFilters();
      input.focus();
    });
    document.addEventListener('keydown', event => {
      const target = event.target;
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
          !target.closest('input, textarea, select, [contenteditable]')) {
        event.preventDefault();
        input.focus();
      }
    });
    window.addEventListener('popstate', readAddress);
    window.addEventListener('hashchange', readAddress);
    readAddress();
    archive.querySelector('[data-enhance]').hidden = false;
  }

  const article = document.querySelector('[data-article]');
  if (!article) { onScroll(); return; }
  const prose = article.querySelector('[data-prose]');
  const headings = [...prose.querySelectorAll('h2, h3')];
  const toc = article.querySelector('[data-toc]');
  const tocList = toc.querySelector('[data-toc-list]');
  const tocNav = toc.querySelector('nav');
  const tocOpen = article.querySelector('[data-toc-open]');
  const tocClose = toc.querySelector('[data-toc-close]');
  const backdrop = document.querySelector('[data-toc-backdrop]');
  const sheet = window.matchMedia('(max-width: 980px)');
  if (headings.length >= 3) {
    headings.forEach((heading, index) => {
      if (!heading.id) {
        let id = `section-${index + 1}`;
        while (document.getElementById(id)) id += '-';
        heading.id = id;
      }
      const item = document.createElement('li');
      if (heading.tagName === 'H3') item.className = 'toc-sub';
      const link = document.createElement('a');
      link.href = `#${encodeURIComponent(heading.id)}`;
      link.textContent = heading.textContent;
      item.append(link);
      tocList.append(item);
    });
    toc.hidden = false;
    tocOpen.hidden = false;
    const existingToc = prose.querySelector('#markdown-toc');
    if (existingToc?.parentElement.tagName === 'DETAILS') {
      existingToc.parentElement.hidden = true;
    }

    function openToc() {
      toc.classList.add('is-open');
      backdrop.hidden = false;
      document.body.classList.add('toc-open');
      tocOpen.setAttribute('aria-expanded', 'true');
      (tocList.querySelector('[aria-current]') || tocClose).focus({ preventScroll: true });
    }
    function closeToc(returnFocus = true) {
      if (!toc.classList.contains('is-open')) return;
      toc.classList.remove('is-open');
      backdrop.hidden = true;
      document.body.classList.remove('toc-open');
      tocOpen.setAttribute('aria-expanded', 'false');
      if (returnFocus) tocOpen.focus({ preventScroll: true });
    }
    tocOpen.addEventListener('click', openToc);
    tocClose.addEventListener('click', () => closeToc());
    backdrop.addEventListener('click', () => closeToc());
    tocList.addEventListener('click', event => { if (event.target.closest('a')) closeToc(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeToc(); });
    sheet.addEventListener?.('change', () => closeToc(false));

    const links = [...tocList.querySelectorAll('a')];
    let active = -1;
    scrollHandlers.push(() => {
      let next = 0;
      headings.forEach((heading, index) => { if (heading.getBoundingClientRect().top <= 120) next = index; });
      if (next === active) return;
      active = next;
      links.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      const current = links[active];
      if (!sheet.matches && current && tocNav.scrollHeight > tocNav.clientHeight) {
        const top = current.offsetTop - tocNav.offsetTop;
        if (top < tocNav.scrollTop || top > tocNav.scrollTop + tocNav.clientHeight - 48) tocNav.scrollTop = top - tocNav.clientHeight / 3;
      }
    });
  }

  const progress = document.querySelector('[data-progress]');
  const tools = article.querySelector('[data-reading-tools]');
  scrollHandlers.push(y => {
    const rect = prose.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    const ratio = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    tools?.classList.toggle('is-visible', y > window.innerHeight * 0.9);
  });
  onScroll();

  const text = prose.textContent;
  const chinese = (text.match(/[㐀-鿿]/g) || []).length;
  const words = (text.replace(/[㐀-鿿]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  const readingTime = article.querySelector('[data-reading-time]');
  readingTime.textContent = `约 ${Math.max(1, Math.ceil(chinese / 350 + words / 220))} 分钟阅读`;
  readingTime.hidden = false;

  prose.querySelectorAll('table').forEach((table, index) => {
    const block = document.createElement('div');
    block.className = 'table-block';
    const hint = document.createElement('div');
    hint.className = 'table-hint';
    hint.textContent = '左右滑动，查看完整表格 ↔';
    hint.id = `table-hint-${index + 1}`;
    hint.hidden = true;
    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    scroll.dataset.columns = table.rows[0]?.cells.length || 1;
    if (table.rows[0]?.cells[0]?.textContent.trim() === '编号') scroll.dataset.indexed = 'true';
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', `文章表格 ${index + 1}`);
    table.before(block);
    scroll.append(table);
    block.append(hint, scroll);
    const updateOverflow = () => {
      const overflow = scroll.scrollWidth > scroll.clientWidth + 1;
      hint.hidden = !overflow;
      if (overflow) { scroll.tabIndex = 0; scroll.setAttribute('aria-describedby', hint.id); }
      else { scroll.removeAttribute('tabindex'); scroll.removeAttribute('aria-describedby'); }
    };
    if ('ResizeObserver' in window) new ResizeObserver(updateOverflow).observe(scroll);
    else window.addEventListener('resize', updateOverflow);
    updateOverflow();
  });

  if (window.isSecureContext && navigator.clipboard?.writeText) {
    prose.querySelectorAll('pre').forEach(pre => {
      const code = pre.querySelector('code') || pre;
      const block = document.createElement('div');
      block.className = 'code-block';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = '复制代码';
      button.setAttribute('aria-label', '复制这段代码');
      button.setAttribute('aria-live', 'polite');
      pre.before(block);
      block.append(pre, button);
      button.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(code.textContent); button.textContent = '已复制 ✓'; }
        catch { button.textContent = '请选中代码复制'; }
        setTimeout(() => { button.textContent = '复制代码'; }, 2200);
      });
    });
  }
})();
