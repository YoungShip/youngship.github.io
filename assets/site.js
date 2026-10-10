(() => {
  'use strict';

  const root = document.documentElement;
  const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const effectiveTheme = () => root.dataset.theme || (darkScheme.matches ? 'dark' : 'light');
  function syncTheme() {
    themeToggle?.setAttribute('aria-pressed', String(effectiveTheme() === 'dark'));
    const color = getComputedStyle(root).getPropertyValue('--paper').trim();
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

  /* ---------- archive: search and filters ---------- */
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
      count.textContent = words.length || filter !== 'all' ? `找到 ${visible} 篇，共 ${notes.length} 篇` : `共 ${notes.length} 篇记录`;
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

  /* ---------- reading time (before any inserted UI text) ---------- */
  const text = prose.textContent;
  const chinese = (text.match(/[㐀-鿿]/g) || []).length;
  const latinWords = (text.replace(/[㐀-鿿]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  const readingTime = article.querySelector('[data-reading-time]');
  if (readingTime) {
    readingTime.textContent = `约 ${Math.max(1, Math.ceil(chinese / 350 + latinWords / 220))} 分钟读完`;
    readingTime.closest('[data-reading-row]')?.removeAttribute('hidden');
  }

  /* ---------- table of contents ---------- */
  // Headings inside collapsed <details> would be unreachable from the TOC, so they stay out of it.
  const headings = [...prose.querySelectorAll('h2, h3')].filter(h => !h.closest('details'));
  const toc = article.querySelector('[data-toc]');
  const tocList = toc.querySelector('[data-toc-list]');
  const tocNav = toc.querySelector('nav');
  const tocOpen = article.querySelector('[data-toc-open]');
  const tocClose = toc.querySelector('[data-toc-close]');
  const backdrop = document.querySelector('[data-toc-backdrop]');
  const sheet = window.matchMedia('(max-width: 1099px)');
  headings.forEach((heading, index) => {
    if (!heading.id) {
      let id = `section-${index + 1}`;
      while (document.getElementById(id)) id += '-';
      heading.id = id;
    }
  });
  if (headings.length >= 3) {
    headings.forEach(heading => {
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
    if (existingToc?.parentElement.tagName === 'DETAILS') existingToc.parentElement.hidden = true;

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

  /* ---------- heading links ---------- */
  prose.querySelectorAll('h2[id], h3[id]').forEach(heading => {
    if (heading.closest('#markdown-toc')) return;
    const anchor = document.createElement('a');
    anchor.className = 'heading-anchor';
    anchor.href = `#${encodeURIComponent(heading.id)}`;
    anchor.setAttribute('aria-label', `链接到“${heading.textContent.trim()}”`);
    anchor.textContent = '#';
    heading.append(anchor);
  });

  /* ---------- tables ---------- */
  // Status vocabulary from the MicroMani ledger (“状态怎么读”). Unknown text is left as is.
  const STATUS = new Map([
    ['未解决', { key: 'open' }],
    ['已定位', { key: 'located' }],
    ['已修改待验收', { key: 'pending' }],
    ['离线通过', { key: 'offline' }],
    ['现场通过（单次）', { key: 'field', ring: true }],
    ['真机验收通过', { key: 'accepted' }],
    ['已解决', { key: 'resolved' }],
    ['临时方案', { key: 'workaround' }],
    ['已完成', { key: 'done' }],
    ['已结束', { key: 'ended', ring: true }],
    ['待核', { key: 'verify', ring: true }],
  ]);
  const clean = value => value.replace(/\s+/g, ' ').trim();
  const isNumeric = value => /^[-+−±~≈<>≤≥]?\s*\d[\d.,]*(?:\s*(?:%|°|mm|μm|um|ms|s|fps|mdeg|deg|帧|条|个|次|步|窗|k))?$/i.test(value) || /^[—–-]$/.test(value);
  function markStatus(cell) {
    const label = clean(cell.textContent);
    const info = STATUS.get(label);
    if (!info || cell.querySelector('.status')) return null;
    const mark = document.createElement('span');
    mark.className = 'status';
    mark.dataset.status = info.key;
    if (info.ring) mark.dataset.ring = '';
    mark.textContent = label;
    cell.replaceChildren(mark);
    return info.key;
  }

  const tableBlocks = [];
  prose.querySelectorAll('table').forEach((table, index) => {
    const block = document.createElement('div');
    block.className = 'table-block';
    const hint = document.createElement('div');
    hint.className = 'table-hint';
    hint.textContent = '左右滑动，查看完整表格';
    hint.id = `table-hint-${index + 1}`;
    hint.hidden = true;
    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    const headerCells = [...(table.tHead?.rows[0]?.cells || table.rows[0]?.cells || [])];
    const cols = headerCells.length || 1;
    scroll.dataset.columns = cols;
    scroll.style.setProperty('--cols', cols);
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', `表格 ${index + 1}`);
    table.before(block);
    scroll.append(table);
    block.append(hint, scroll);

    const info = { block, table, hasId: false, statusCol: -1, rows: [] };
    const body = table.tBodies[0];
    if (table.tHead && body && body.rows.length) {
      const labels = headerCells.map(cell => clean(cell.textContent));
      const rows = [...body.rows];
      const columns = labels.map((_, c) => rows.map(row => clean(row.cells[c]?.textContent || '')));
      const numeric = columns.map(values => {
        const filled = values.filter(Boolean);
        const hits = filled.filter(isNumeric).length;
        return filled.length > 0 && hits >= 2 && hits / filled.length >= 0.6;
      });
      const avg = values => values.reduce((sum, v) => sum + v.length, 0) / Math.max(1, values.length);
      const idCol = /^(编号|id|#)$/i.test(labels[0]) || (/^编号/.test(labels[0]) && avg(columns[0]) <= 6) ? 0 : -1;
      const statusCol = labels.findIndex((label, c) => /^(状态|当前状态)$/.test(label) && columns[c].some(v => STATUS.has(v)));
      let titleCol = idCol === 0 ? 1 : 0;
      if (titleCol >= cols || numeric[titleCol] || titleCol === statusCol) titleCol = -1;
      info.hasId = idCol === 0;
      info.statusCol = statusCol;

      numeric.forEach((isNum, c) => { if (isNum && c > 0) headerCells[c].dataset.num = ''; });
      rows.forEach(row => {
        [...row.cells].forEach((cell, c) => {
          cell.dataset.label = labels[c] || '';
          if (c === idCol) cell.dataset.role = 'id';
          else if (c === statusCol) cell.dataset.role = 'status';
          else if (c === titleCol) cell.dataset.role = 'title';
          if (numeric[c] && c > 0) cell.dataset.num = '';
        });
        if (statusCol >= 0 && row.cells[statusCol]) {
          const key = markStatus(row.cells[statusCol]);
          if (key && info.hasId) { row.dataset.status = key; info.rows.push(row); }
        }
        if (info.hasId && row.cells[0]) {
          const cell = row.cells[0];
          const anchor = cell.querySelector('a[id]');
          const strong = cell.querySelector('strong');
          if (anchor && strong && !strong.closest('a')) {
            const link = document.createElement('a');
            link.className = 'row-link';
            link.href = `#${encodeURIComponent(anchor.id)}`;
            strong.replaceWith(link);
            link.append(strong);
          }
        }
      });

      const textCols = labels.map((_, c) => c).filter(c => !numeric[c] && c !== statusCol && c !== idCol);
      const textAvg = avg(textCols.flatMap(c => columns[c]));
      const numericShare = numeric.filter(Boolean).length / cols;
      if (cols >= 3 && textAvg >= 10 && numericShare < 0.5) block.dataset.layout = 'stack';
      else if (cols >= 4 || idCol === 0) scroll.dataset.stickyFirst = '';
    }
    tableBlocks.push(info);

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

  /* ---------- ledger overview and status filter ---------- */
  const ledgers = tableBlocks.filter(item => item.hasId && item.rows.length);
  const ledgerRows = ledgers.flatMap(item => item.rows);
  if (ledgerRows.length >= 8) {
    const counts = new Map();
    ledgerRows.forEach(row => counts.set(row.dataset.status, (counts.get(row.dataset.status) || 0) + 1));
    const summary = document.createElement('section');
    summary.className = 'status-summary';
    summary.setAttribute('aria-label', '问题概览');
    const head = document.createElement('div');
    head.className = 'status-summary-head';
    head.innerHTML = '<strong>问题概览</strong>';
    const total = document.createElement('span');
    total.textContent = `共 ${ledgerRows.length} 项，点一个状态只看这一类`;
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = '显示全部';
    reset.hidden = true;
    head.append(total, reset);
    const chips = document.createElement('div');
    chips.className = 'status-chips';
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', '按状态筛选');
    const byKey = new Map();
    STATUS.forEach((info, label) => {
      const n = counts.get(info.key);
      if (!n) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'status-chip';
      chip.dataset.status = info.key;
      if (info.ring) chip.dataset.ring = '';
      chip.setAttribute('aria-pressed', 'false');
      chip.append(`${label} `);
      const b = document.createElement('b');
      b.textContent = n;
      chip.append(b);
      chips.append(chip);
      byKey.set(info.key, { chip, label });
    });
    summary.append(head, chips);
    const firstHeading = [...prose.children].find(el => el.tagName === 'H2');
    (firstHeading || ledgers[0].block).before(summary);

    let current = '';
    function applyStatus(key, updateAddress = true) {
      current = byKey.has(key) ? key : '';
      ledgerRows.forEach(row => { row.hidden = Boolean(current) && row.dataset.status !== current; });
      ledgers.forEach(item => {
        const anyVisible = item.rows.some(row => !row.hidden);
        if (current && !anyVisible) item.block.dataset.empty = byKey.get(current).label;
        else delete item.block.dataset.empty;
      });
      byKey.forEach(({ chip }, k) => chip.setAttribute('aria-pressed', String(k === current)));
      reset.hidden = !current;
      if (updateAddress) {
        const url = new URL(location.href);
        current ? url.searchParams.set('status', byKey.get(current).label) : url.searchParams.delete('status');
        history.replaceState(null, '', url);
      }
    }
    chips.addEventListener('click', event => {
      const chip = event.target.closest('.status-chip');
      if (chip) applyStatus(chip.dataset.status === current ? '' : chip.dataset.status);
    });
    reset.addEventListener('click', () => applyStatus(''));
    const requested = new URL(location.href).searchParams.get('status');
    if (requested) applyStatus(STATUS.get(requested)?.key || '', false);
  }

  /* ---------- code blocks ---------- */
  const LANG = { text: '文本', plaintext: '文本', js: 'JavaScript', javascript: 'JavaScript', powershell: 'PowerShell', ps1: 'PowerShell', sh: 'Shell', bash: 'Shell', shell: 'Shell', console: '终端', py: 'Python', python: 'Python', json: 'JSON', yaml: 'YAML', yml: 'YAML', html: 'HTML', css: 'CSS', cpp: 'C++', c: 'C', diff: 'Diff', markdown: 'Markdown', md: 'Markdown' };
  const canCopy = window.isSecureContext && navigator.clipboard?.writeText;
  prose.querySelectorAll('pre').forEach(pre => {
    const host = pre.closest('div.highlighter-rouge') || pre;
    if (host.closest('.code-block')) return;
    const lang = (host.className.match(/language-([\w+-]+)/) || [])[1] || '';
    const wrapsByDefault = lang === 'text' || lang === 'plaintext';
    const block = document.createElement('div');
    block.className = 'code-block';
    if (lang) block.dataset.lang = lang;
    const bar = document.createElement('div');
    bar.className = 'code-bar';
    const name = document.createElement('span');
    name.textContent = LANG[lang] || lang || '代码';
    const tools = document.createElement('div');
    tools.className = 'code-tools';
    bar.append(name, tools);
    host.before(block);
    block.append(bar, host);
    if (!wrapsByDefault) {
      const wrap = document.createElement('button');
      wrap.type = 'button';
      wrap.textContent = '自动换行';
      wrap.setAttribute('aria-pressed', 'false');
      wrap.hidden = true;
      wrap.addEventListener('click', () => {
        const on = block.classList.toggle('is-wrapped');
        wrap.setAttribute('aria-pressed', String(on));
      });
      tools.append(wrap);
      const check = () => { if (!block.classList.contains('is-wrapped')) wrap.hidden = pre.scrollWidth <= pre.clientWidth + 1; };
      if ('ResizeObserver' in window) new ResizeObserver(check).observe(pre);
      check();
    }
    if (canCopy) {
      const code = pre.querySelector('code') || pre;
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.textContent = '复制';
      copy.setAttribute('aria-label', '复制这段代码');
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(code.textContent); copy.textContent = '已复制'; }
        catch { copy.textContent = '请手动选中复制'; }
        setTimeout(() => { copy.textContent = '复制'; }, 2000);
      });
      tools.append(copy);
    }
  });

  /* ---------- figures and zoom ---------- */
  // Posts write a caption as an italic paragraph right after the image; that becomes the
  // figure caption. Without one, the alt text is used.
  prose.querySelectorAll('p > img:only-child').forEach(img => {
    const paragraph = img.parentElement;
    if (paragraph.textContent.trim()) return;
    const figure = document.createElement('figure');
    const link = document.createElement('a');
    link.href = img.currentSrc || img.src;
    link.className = 'zoom-link';
    link.setAttribute('aria-label', `放大查看：${img.alt || '图片'}`);
    link.append(img);
    figure.append(link);
    const next = paragraph.nextElementSibling;
    const em = next?.tagName === 'P' && next.children.length === 1 ? next.firstElementChild : null;
    const caption = document.createElement('figcaption');
    if (em?.tagName === 'EM' && clean(next.textContent) === clean(em.textContent)) {
      caption.append(...em.childNodes);
      next.remove();
    } else if (img.alt) {
      caption.textContent = img.alt;
    }
    if (caption.textContent.trim()) figure.append(caption);
    paragraph.replaceWith(figure);
    // Keep a long caption from stretching the figure past the picture itself.
    const fit = () => { if (img.naturalWidth) figure.style.setProperty('--figure-max', `${img.naturalWidth}px`); };
    if (img.complete) fit(); else img.addEventListener('load', fit, { once: true });
  });
  if (window.HTMLDialogElement) {
    let box;
    prose.addEventListener('click', event => {
      const link = event.target.closest('a.zoom-link');
      if (!link) return;
      event.preventDefault();
      const img = link.querySelector('img');
      if (!box) {
        box = document.createElement('dialog');
        box.className = 'lightbox';
        box.setAttribute('aria-label', '图片预览');
        box.append(document.createElement('img'), document.createElement('p'));
        box.addEventListener('click', () => box.close());
        document.body.append(box);
      }
      const big = box.querySelector('img');
      big.src = link.href;
      big.alt = img.alt;
      box.querySelector('p').textContent = clean(link.closest('figure')?.querySelector('figcaption')?.textContent || img.alt);
      box.showModal();
    });
  }

  /* ---------- progress and floating tools ---------- */
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
})();
