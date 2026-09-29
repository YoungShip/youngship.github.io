(() => {
  'use strict';

  const archive = document.querySelector('[data-archive]');
  if (archive) {
    const input = archive.querySelector('input[type="search"]');
    const buttons = [...archive.querySelectorAll('[data-filter]')];
    const notes = [...archive.querySelectorAll('[data-note]')];
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
  if (!article) return;
  const prose = article.querySelector('[data-prose]');
  const headings = [...prose.querySelectorAll('h2, h3')];
  const toc = article.querySelector('[data-toc]');
  const tocList = toc.querySelector('[data-toc-list]');
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
    const existingToc = prose.querySelector('#markdown-toc');
    if (existingToc?.parentElement.tagName === 'DETAILS') {
      existingToc.parentElement.hidden = true;
    }
    const details = toc.querySelector('details');
    const wide = window.matchMedia('(min-width: 981px)');
    const setDisclosure = () => { details.open = wide.matches; };
    setDisclosure();
    wide.addEventListener('change', setDisclosure);
    const links = [...tocList.querySelectorAll('a')];
    let scheduled = false;
    let active = -1;
    function markCurrent() {
      scheduled = false;
      let next = 0;
      headings.forEach((heading, index) => { if (heading.getBoundingClientRect().top <= 110) next = index; });
      if (next === active) return;
      active = next;
      links.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(markCurrent); }
    }, { passive: true });
    markCurrent();
  }

  const text = prose.textContent;
  const chinese = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (text.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
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
