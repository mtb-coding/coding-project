// js/symbols.js
// Symbol outline palette — Ctrl+Shift+O
// Scans the current file for recognisable symbols (functions, classes, methods,
// variables, headings…) and presents them in a fuzzy-searchable jump list.

// ─── Symbol extraction ───────────────────────────────────────────────────────

const _symbolPatterns = [
    // JS / TS / JSX / TSX
    { re: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/,              kind: 'fn',    label: 'function'  },
    { re: /^(?:export\s+)?(?:default\s+)?class\s+(\w+)/,               kind: 'class', label: 'class'     },
    { re: /^\s{0,4}(?:async\s+)?(\w+)\s*\(.*\)\s*\{/,                 kind: 'fn',    label: 'method'    },
    { re: /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/, kind: 'fn', label: 'arrow' },
    { re: /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/,              kind: 'var',   label: 'const'     },
    { re: /^(?:export\s+)?(?:interface|type)\s+(\w+)/,                 kind: 'type',  label: 'type'      },
    // Python
    { re: /^(?:async\s+)?def\s+(\w+)/,                                 kind: 'fn',    label: 'def'       },
    { re: /^class\s+(\w+)/,                                            kind: 'class', label: 'class'     },
    // Ruby
    { re: /^\s*def\s+(\w+)/,                                           kind: 'fn',    label: 'def'       },
    // Go
    { re: /^func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)/,                    kind: 'fn',    label: 'func'      },
    // Rust
    { re: /^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/,                      kind: 'fn',    label: 'fn'        },
    { re: /^(?:pub\s+)?(?:struct|enum|trait|impl)\s+(\w+)/,            kind: 'class', label: 'struct'    },
    // Java / C#
    { re: /^\s{0,4}(?:public|private|protected|static|final|abstract|override|async|void|int|string|bool|float|double|long|object|var)\s+(?:\w+\s+)*(\w+)\s*\(/, kind: 'fn', label: 'method' },
    // CSS / SCSS selector
    { re: /^([.#][\w-]+(?:\s*[,{]))/,                                  kind: 'css',   label: 'selector'  },
    // Markdown headings
    { re: /^(#{1,6})\s+(.+)/,                                          kind: 'heading', label: 'heading' },
    // LaTeX sections
    { re: /^\\(section|subsection|subsubsection)\*?\{([^}]+)\}/,       kind: 'heading', label: 'section'  },
    // SQL procedures/functions
    { re: /^CREATE\s+(?:OR\s+REPLACE\s+)?(?:FUNCTION|PROCEDURE|TABLE|VIEW)\s+(\w+)/i, kind: 'fn', label: 'sql' },
];

const _kindIcon = { fn: '⟨⟩', class: '◈', var: '◦', type: '⬡', css: '#', heading: '§', default: '·' };
const _kindColor = {
    fn:      '#61afef',
    class:   '#e5c07b',
    var:     '#98c379',
    type:    '#c678dd',
    css:     '#56b6c2',
    heading: '#abb2bf',
};

function extractSymbols(content, mode) {
    const lines  = content.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        for (const { re, kind, label } of _symbolPatterns) {
            const m = line.match(re);
            if (!m) continue;

            // For markdown headings the name is in group 2
            let name = m[2] !== undefined ? m[2] : m[1];
            if (!name || name.length < 2) continue;

            // Skip obvious false-positives: single-char names, common keywords
            if (/^(if|in|of|do|be|is|no|to|or|at|as|it|he|we)$/i.test(name)) continue;

            result.push({
                name:    name.trim(),
                kind,
                label,
                line:    i,           // 0-based
                lineNum: i + 1,       // 1-based for display
                preview: line.trim().slice(0, 80),
            });
            break; // first pattern that matches wins per line
        }
    }
    return result;
}

// ─── Palette UI ──────────────────────────────────────────────────────────────

let _symbolResults   = [];
let _symbolSelIdx    = 0;

function showSymbolPalette() {
    if (!codeEditor || !currentFilePath) {
        showNotification('No file open.', true);
        return;
    }

    const palette = document.getElementById('symbolPalette');
    palette.style.display = 'flex';

    const input = document.getElementById('symbolPaletteInput');
    input.value = '';

    _renderSymbolList('');
    setTimeout(() => input.focus(), 10);
}

function hideSymbolPalette() {
    const palette = document.getElementById('symbolPalette');
    if (!palette || palette.style.display === 'none') return;
    palette.style.display = 'none';
    if (codeEditor) setTimeout(() => codeEditor.focus(), 0);
}

function handleSymbolPaletteOverlayClick(e) {
    if (e.target === document.getElementById('symbolPalette')) hideSymbolPalette();
}

function _renderSymbolList(query) {
    const content = codeEditor.getValue();
    const mode    = codeEditor.getOption('mode');
    const all     = extractSymbols(content, mode);
    const q       = query.toLowerCase();

    _symbolResults = q
        ? all.filter(s => s.name.toLowerCase().includes(q) || s.label.toLowerCase().includes(q))
        : all;

    _symbolSelIdx = 0;

    const ul = document.getElementById('symbolList');
    ul.innerHTML = '';

    if (_symbolResults.length === 0) {
        const li = document.createElement('li');
        li.className = 'file-palette-empty';
        li.textContent = all.length === 0
            ? 'No symbols found in this file.'
            : 'No symbols match your query.';
        ul.appendChild(li);
        return;
    }

    _symbolResults.forEach((sym, idx) => {
        const li = document.createElement('li');
        li.className = 'symbol-item' + (idx === 0 ? ' selected' : '');
        li.style.animationDelay = `${Math.min(idx * 12, 100)}ms`;

        const icon  = _kindIcon[sym.kind]  || _kindIcon.default;
        const color = _kindColor[sym.kind] || '#abb2bf';

        // Highlight matched portion of name
        let nameHtml = escapeHtml(sym.name);
        if (q) {
            const qi = sym.name.toLowerCase().indexOf(q);
            if (qi !== -1) {
                nameHtml =
                    escapeHtml(sym.name.slice(0, qi)) +
                    '<span class="file-palette-match">' +
                    escapeHtml(sym.name.slice(qi, qi + q.length)) +
                    '</span>' +
                    escapeHtml(sym.name.slice(qi + q.length));
            }
        }

        li.innerHTML = `
            <span class="symbol-icon" style="color:${color}">${icon}</span>
            <span class="symbol-body">
                <span class="symbol-name">${nameHtml}</span>
                <span class="symbol-meta">${sym.label} · line ${sym.lineNum}</span>
            </span>
            <span class="symbol-preview">${escapeHtml(sym.preview)}</span>
        `;

        li.addEventListener('click', () => _jumpToSymbol(sym));
        ul.appendChild(li);
    });
}

function _updateSymbolSelection() {
    const items = document.querySelectorAll('#symbolList .symbol-item');
    items.forEach((li, i) => li.classList.toggle('selected', i === _symbolSelIdx));
    const sel = items[_symbolSelIdx];
    if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function _jumpToSymbol(sym) {
    hideSymbolPalette();
    codeEditor.setCursor({ line: sym.line, ch: 0 });
    codeEditor.scrollIntoView({ line: sym.line, ch: 0 }, 80);
    codeEditor.focus();
}

function initSymbolPalette() {
    const input = document.getElementById('symbolPaletteInput');
    if (!input) return;

    const debouncedRender = debounce(q => _renderSymbolList(q), 80);

    input.addEventListener('input', () => debouncedRender(input.value));

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            _symbolSelIdx = Math.min(_symbolSelIdx + 1, _symbolResults.length - 1);
            _updateSymbolSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            _symbolSelIdx = Math.max(_symbolSelIdx - 1, 0);
            _updateSymbolSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (_symbolResults[_symbolSelIdx]) _jumpToSymbol(_symbolResults[_symbolSelIdx]);
        }
    });
}