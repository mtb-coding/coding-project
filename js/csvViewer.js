// js/csvViewer.js
// Renders CSV content as a styled, sortable HTML table in the preview iframe.
// Called from fileOps.js openFile() when a .csv file is opened.

function parseCsv(text) {
    const rows = [];
    let cur = '', row = [], inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuote) {
            if (ch === '"') {
                if (text[i + 1] === '"') { cur += '"'; i++; }  // escaped quote
                else inQuote = false;
            } else {
                cur += ch;
            }
        } else {
            if (ch === '"') {
                inQuote = true;
            } else if (ch === ',') {
                row.push(cur); cur = '';
            } else if (ch === '\r') {
                // skip bare CR
            } else if (ch === '\n') {
                row.push(cur); cur = '';
                rows.push(row); row = [];
            } else {
                cur += ch;
            }
        }
    }
    if (cur !== '' || row.length > 0) { row.push(cur); rows.push(row); }

    // Normalize all rows to the same column count
    const cols = rows.reduce((mx, r) => Math.max(mx, r.length), 0);
    return rows.map(r => { while (r.length < cols) r.push(''); return r; });
}

function renderCsvToHtml(csvText) {
    const rows = parseCsv(csvText);
    if (!rows.length) return '<p style="color:#888;padding:20px">Empty CSV</p>';

    const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const header = rows[0];
    const body   = rows.slice(1).filter(r => r.some(c => c.trim() !== ''));

    const thCells = header.map((h, i) =>
        `<th data-col="${i}" class="csv-th" onclick="sortBy(${i})">${esc(h)}<span class="sort-icon"> ⇅</span></th>`
    ).join('');

    const tBodyRows = body.map((r, ri) => {
        const tds = r.map(c => `<td>${esc(c)}</td>`).join('');
        return `<tr class="${ri % 2 === 0 ? 'even' : 'odd'}">${tds}</tr>`;
    }).join('');

    const rowCount = body.length;
    const colCount = header.length;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    background: #1e1e1e;
    color: #d0d0d0;
    padding: 0;
  }
  .csv-toolbar {
    position: sticky;
    top: 0;
    background: #252526;
    border-bottom: 1px solid #3a3a35;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10;
    font-size: 12px;
    color: #888;
  }
  .csv-toolbar input {
    background: #3c3c3c;
    border: 1px solid #555;
    color: #d0d0d0;
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 12px;
    width: 200px;
    outline: none;
  }
  .csv-toolbar input:focus { border-color: #a6e22e; }
  .csv-stat { opacity: 0.5; }
  .table-wrap {
    overflow: auto;
    max-height: calc(100vh - 40px);
  }
  table {
    border-collapse: collapse;
    width: max-content;
    min-width: 100%;
  }
  th, td {
    padding: 6px 12px;
    border: 1px solid #2e2e2e;
    white-space: nowrap;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
  }
  th.csv-th {
    background: #2d2d2d;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    position: sticky;
    top: 0;
    border-top: none;
    color: #ccc;
    white-space: nowrap;
  }
  th.csv-th:hover { background: #383838; color: #a6e22e; }
  th.csv-th.sort-asc  .sort-icon::after { content: ' ▲'; }
  th.csv-th.sort-desc .sort-icon::after { content: ' ▼'; }
  .sort-icon { color: #666; font-size: 11px; }
  tr.even { background: #1e1e1e; }
  tr.odd  { background: #222222; }
  tr:hover td { background: #2a3a2a; }
  tr.filtered-out { display: none; }
</style>
</head>
<body>
<div class="csv-toolbar">
  <input type="text" id="filterInput" placeholder="Filter rows…" oninput="filterRows(this.value)">
  <span class="csv-stat" id="statLabel">${rowCount} rows · ${colCount} columns</span>
</div>
<div class="table-wrap">
  <table id="csvTable">
    <thead><tr>${thCells}</tr></thead>
    <tbody id="csvBody">${tBodyRows}</tbody>
  </table>
</div>
<script>
  let _sortCol = -1, _sortAsc = true;
  const tbody = document.getElementById('csvBody');
  const stat  = document.getElementById('statLabel');

  function sortBy(col) {
    if (_sortCol === col) { _sortAsc = !_sortAsc; }
    else { _sortCol = col; _sortAsc = true; }

    document.querySelectorAll('th.csv-th').forEach((th, i) => {
      th.classList.toggle('sort-asc',  i === col && _sortAsc);
      th.classList.toggle('sort-desc', i === col && !_sortAsc);
    });

    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const av = a.cells[col]?.textContent || '';
      const bv = b.cells[col]?.textContent || '';
      const an = parseFloat(av), bn = parseFloat(bv);
      if (!isNaN(an) && !isNaN(bn)) return _sortAsc ? an - bn : bn - an;
      return _sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    rows.forEach(r => tbody.appendChild(r));
    updateStat();
  }

  function filterRows(q) {
    const lq = q.toLowerCase();
    let visible = 0;
    Array.from(tbody.querySelectorAll('tr')).forEach(r => {
      const match = !lq || r.textContent.toLowerCase().includes(lq);
      r.classList.toggle('filtered-out', !match);
      if (match) visible++;
    });
    stat.textContent = lq
      ? visible + ' of ${rowCount} rows · ${colCount} columns'
      : '${rowCount} rows · ${colCount} columns';
  }

  function updateStat() {
    const total = tbody.querySelectorAll('tr:not(.filtered-out)').length;
    stat.textContent = total + ' rows · ${colCount} columns';
  }
<\/script>
</body>
</html>`;
}