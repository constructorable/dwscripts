(function () {
    'use strict';

    const ID = 'dw-ko-buttons-bestaetigung', V = '2.1', SK = 'dw-ko-bestaetigung-state', D = true;

    // NEU: Individuelle Positionierung pro Feld-Typ
    const POSITION = {
        default: {
            standard: { top: '0px', left: '75px' },
            modal: { top: '0px', left: '70px' }
        },
        objbestaet: {
            standard: { top: '0px', left: '125px' },
            modal: { top: '0px', left: '70px' }
        },
        rebestaet: {
            standard: { top: '0px', left: '95px' },
            modal: { top: '0px', left: '70px' }
        },
        renrbestaet: {
            standard: { top: '0px', left: '125px' },
            modal: { top: '0px', left: '70px' }
        },
        restbestaet: {
            standard: { top: '0px', left: '110px' },
            modal: { top: '0px', left: '70px' }
        }
    };

    const CFG = {
        objbestaet: {
            txt: 'objekt best',
            type: 'includes_lower',
            pre: 'dw-ob',
            opts: [{ v: 'j', l: 'j' }]
        },
        rebestaet: {
            txt: 'ungssteller 🧑',
            type: 'includes_lower',
            pre: 'dw-rb',
            opts: [{ v: 'j', l: 'j' }]
        },
        renrbestaet: {
            txt: 'RE-Nr.',
            type: 'includes_lower',
            pre: 'dw-rnrb',
            opts: [{ v: 'j', l: 'j' }]
        },
        restbestaet: {
            txt: 'RE-Steller',
            type: 'includes_lower',
            pre: 'dw-rst',
            opts: [{ v: 'j', l: 'j' }]
        }
    };

    let S = {
        init: false,
        reg: new Map(),
        obs: null,
        processed: new WeakSet()
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-BEST] ${m}`, d || '');

    function cleanup() {
        if (window[ID]?.s) {
            window[ID].s.obs?.disconnect();
        }
    }

    function saveState() {
        try {
            const data = { reg: Array.from(S.reg.entries()), ts: Date.now() };
            sessionStorage.setItem(SK, JSON.stringify(data));
        } catch (e) { log('Save err:', e); }
    }

    function loadState() {
        try {
            const stored = sessionStorage.getItem(SK);
            if (stored) {
                const data = JSON.parse(stored);
                if (Date.now() - data.ts < 1800000) {
                    S.reg = new Map(data.reg || []);
                    return true;
                }
            }
        } catch (e) { log('Load err:', e); }
        return false;
    }

    function waitKO(cb, i = 0) {
        typeof ko !== 'undefined' && ko.version ? cb() : i < 50 ? setTimeout(() => waitKO(cb, i + 1), 100) : cb();
    }

    function isProc(f) {
        if (!f) return false;
        const r = f.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && f.offsetParent !== null && f.closest('tr');
    }

    function mkId(inp, txt, k) {
        const nm = inp.name || inp.id || '';
        const tbl = inp.closest('table');
        const pos = tbl ? Array.from(tbl.querySelectorAll('input')).indexOf(inp) : 0;
        return `${k}_${nm}_${txt.replace(/[^a-zA-Z0-9]/g, '')}_${pos}`;
    }

    function matches(txt, cfg) {
        if (!cfg.txt) return false;
        return txt.toLowerCase().includes(cfg.txt.toLowerCase());
    }

    function findInp(row) {
        return row.querySelector('input.dw-textField, input.dw-numericField, input[type="text"]');
    }

    // ÄNDERUNG: Prüft ob Buttons bereits in Content-Cell existieren
    function hasButtons(contentCell, pre) {
        return contentCell.querySelector(`.${pre}-button-container`) !== null;
    }

    function findInCont(k, c) {
        const cfg = CFG[k];
        const found = [];

        try {
            const labels = c.querySelectorAll('.dw-fieldLabel span');
            for (const lbl of labels) {
                if (!lbl.textContent) continue;
                const txt = lbl.textContent.trim();
                if (!matches(txt, cfg)) continue;

                const row = lbl.closest('tr');
                if (!row) continue;

                const inp = findInp(row);
                if (!inp || !isProc(inp) || S.processed.has(inp)) continue;

                const contentCell = inp.closest('td.table-fields-content');
                if (!contentCell || hasButtons(contentCell, cfg.pre)) continue;

                const fid = mkId(inp, txt, k);
                found.push({ inp, txt, row, contentCell, k, fid, cfg });
                if (!cfg.multi) break;
            }
        } catch (e) { log(`Err find ${k}:`, e); }
        return found;
    }

    function setVal(inp, val) {
        inp.value = val;
        requestAnimationFrame(() => {
            inp.focus();
            ['input', 'change', 'blur'].forEach(t => inp.dispatchEvent(new Event(t, { bubbles: true, cancelable: true })));
        });
    }

    function updSel(btn) {
        const cont = btn.closest('[class*="-button-container"]');
        if (!cont) return;
        cont.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    function handleClick(e, opt, inp, fid) {
        e.preventDefault();
        e.stopPropagation();
        updSel(e.target);
        S.reg.set(fid, { sel: opt.v, ts: Date.now() });
        saveState();
        setVal(inp, opt.v);
    }

    function mkBtn(opt, cfg, inp, fid) {
        const btn = document.createElement('button');
        btn.className = `${cfg.pre}-action-button`;
        btn.type = 'button';
        btn.textContent = opt.l;
        btn.title = opt.l;
        btn.setAttribute('data-value', opt.v);
        btn.setAttribute('data-field-id', fid);
        btn.addEventListener('click', e => handleClick(e, opt, inp, fid), { passive: true });
        return btn;
    }

    function restoreState(inp, cfg, btns, fid) {
        const cur = inp.value.trim();
        const saved = S.reg.get(fid);
        const match = saved?.sel || cur;
        if (!match) return;

        btns.forEach(btn => {
            const val = btn.getAttribute('data-value');
            if (val === match) {
                btn.classList.add('selected');
            }
        });
    }

    // ÄNDERUNG: Container mit Feld-Typ für individuelle Positionierung
    function mkBtnCont(inp, k, fid, cfg) {
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container dw-best-inline-buttons`;
        cont.setAttribute('data-field-id', fid);
        cont.setAttribute('data-field-type', k);

        const inModal = inp.closest('.ui-dialog') !== null;
        if (inModal) {
            cont.classList.add('in-modal');
        }

        const btns = [];
        const frag = document.createDocumentFragment();
        cfg.opts.forEach(opt => {
            const btn = mkBtn(opt, cfg, inp, fid);
            frag.appendChild(btn);
            btns.push(btn);
        });
        cont.appendChild(frag);
        restoreState(inp, cfg, btns, fid);
        return cont;
    }

    // ÄNDERUNG: Inline-Injection statt neue Zeile
    function inject(f) {
        const { inp, contentCell, k, fid, cfg } = f;

        if (hasButtons(contentCell, cfg.pre)) return false;

        // Content-Cell für relative Positionierung vorbereiten
        if (getComputedStyle(contentCell).position === 'static') {
            contentCell.style.position = 'relative';
        }

        const bc = mkBtnCont(inp, k, fid, cfg);
        contentCell.appendChild(bc);

        try {
            S.processed.add(inp);
            log(`✅ Inline-Buttons eingefügt: ${fid}`);
            return true;
        } catch (e) {
            log(`❌ Inject fail: ${fid}`, e);
            return false;
        }
    }

    function procCfgInEl(k, c) {
        const cfg = CFG[k];
        const fields = findInCont(k, c);
        let added = 0;
        fields.forEach(f => {
            if (inject(f)) added++;
        });
        return added;
    }

    function procStd(e) {
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, e); });
        total > 0 && saveState();
        return total;
    }

    // ÄNDERUNG: Dynamisches CSS mit individuellen Positionen
    function injectCSS() {
        if (document.querySelector('style[data-dw-best-btns]')) return;

        let css = `
/* Content-Cell Vorbereitung */
td.table-fields-content {
    position: relative !important;
}

/* Standard Inline-Button Container */
.dw-best-inline-buttons {
    position: absolute !important;
    top: ${POSITION.default.standard.top} !important;
    left: ${POSITION.default.standard.left} !important;
    z-index: 1000 !important;
    display: flex !important;
    align-items: center !important;
    gap: 2px !important;
    flex-wrap: nowrap !important;
    pointer-events: auto !important;
}

/* Modal Standard */
.dw-best-inline-buttons.in-modal {
    top: ${POSITION.default.modal.top} !important;
    left: ${POSITION.default.modal.left} !important;
}
`;

        // Individuelle Positionen pro Feld-Typ
        Object.keys(POSITION).forEach(fieldType => {
            if (fieldType === 'default') return;

            const pos = POSITION[fieldType];
            css += `
/* ${fieldType} - Standard */
.dw-best-inline-buttons[data-field-type="${fieldType}"] {
    top: ${pos.standard.top} !important;
    left: ${pos.standard.left} !important;
}

/* ${fieldType} - Modal */
.dw-best-inline-buttons[data-field-type="${fieldType}"].in-modal {
    top: ${pos.modal.top} !important;
    left: ${pos.modal.left} !important;
}
`;
        });

        // Button-Styling
        css += `
/* Button-Styling */
.dw-best-inline-buttons button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    border-radius: 2px !important;
    border: 1px solid #d1d5db !important;
    background: rgba(255, 255, 255, 0.95) !important;
    color: #374151 !important;
    padding: 2px 6px !important;
    min-height: 18px !important;
    font-size: 11px !important;
    white-space: nowrap !important;
    line-height: 1.2 !important;
    margin: 0 !important;
    transition: all 0.15s ease !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.dw-best-inline-buttons button:hover {
    background: rgba(249, 250, 251, 0.98) !important;
    border-color: #9ca3af !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.dw-best-inline-buttons button.selected {
    background: #eff6ff !important;
    border-color: #3b82f6 !important;
    color: #1e40af !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

.ui-dialog .dw-best-inline-buttons button {
    font-size: 10px !important;
    padding: 2px 5px !important;
    min-height: 16px !important;
}
`;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-best-btns', 'true');
        document.head.appendChild(style);
    }

    function mkObs() {
        let timeout;
        const obs = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                procStd(document.body);
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => procStd(d));
            }, 200);
        });
        obs.observe(document.body, { childList: true, subtree: true });
        return obs;
    }

    function init() {
        injectCSS();
        loadState();
        waitKO(() => {
            setTimeout(() => {
                procStd(document.body);
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => procStd(d));
            }, 300);
        });
        S.obs = mkObs();
        S.init = true;
        log('✅ Initialisiert (Inline-Modus)');
    }

    window[ID].api = {
        refresh: () => {
            const std = procStd(document.body);
            let dlgCnt = 0;
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => { dlgCnt += procStd(d); });
            return { std, dlgs: dlgCnt };
        },
        status: () => ({
            init: S.init,
            btns: document.querySelectorAll('.dw-best-inline-buttons').length,
            reg: S.reg.size
        })
    };

    function main() {
        document.readyState === 'loading' ?
            document.addEventListener('DOMContentLoaded', init, { once: true }) :
            setTimeout(init, 300);
    }

    main();
})();
