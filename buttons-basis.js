// buttons-basis.js - OPTIMIERT MIT INDIVIDUELLER POSITIONSKONTROLLE
(function () {
    'use strict';

    const ID = 'dw-ko-buttons-basis', V = '2.0', SK = 'dw-ko-basis-state', D = true;

    // NEU: Individuelle Positionierung pro Feld-Typ
    const POSITION = {
        // Standard-Position für alle Felder
        default: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '75px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        // NEU: Individuelle Position für Wirtschaftsjahr
        wirtschaftsjahr: {
            standard: {
                position: 'absolute',
                top: '2px',           // Anpassbar
                left: '125px',         // Anpassbar
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        // NEU: Individuelle Positionen für weitere Felder (optional)
        nebenkosten: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '75px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        skonto: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '75px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        steuersatz1: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '75px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        steuerbetrag: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '75px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        zuweisen: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '125px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        vnnr: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '75px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        }
    };

    const CFG = {
        nebenkosten: {
            txt: 'für Nebenkosten relevant',
            type: 'includes',
            pre: 'dw-nk',
            gap: '2px',
            opts: [
                { v: 'j', l: 'Ja' },
                { v: 'n', l: 'Nein' }
            ],
            map: { 'j': 'j', 'ja': 'j', 'n': 'n', 'nein': 'n' }
        },

        wirtschaftsjahr: {
            txt: 'wirtschaftsjahr',
            type: 'includes_lower',
            pre: 'dw-wj',
            gap: '2px',
            opts: [
                { v: '2025', l: '2025' },
                { v: '2024 / 2025', l: '2024 / 2025' },
                { v: '2024', l: '2024' },
                { v: '2025 / 2026', l: '2025 / 2026' },
                { v: '2026', l: '2026' },
                { v: '2026 / 2027', l: '2026 / 2027' }
            ]
        },

        skonto: {
            txt: 'skonto in',
            type: 'includes_lower',
            pre: 'dw-sk',
            gap: '2px',
            opts: [
                { v: '0', l: '0' },
                { v: '2', l: '2' },
                { v: '3', l: '3' }
            ]
        },

        steuersatz1: {
            txt: 'steuersatz',
            type: 'includes_lower',
            pre: 'dw-sst',
            gap: '2px',
            opts: [
                { v: '0', l: '0' },
                { v: '7', l: '7' },
                { v: '19', l: '19' }
            ]
        },

        steuerbetrag: {
            txt: 'steuerbetrag',
            type: 'includes_lower',
            pre: 'dw-stb',
            gap: '2px',
            opts: [
                { v: '0', l: '0' },                
            ]
        },

        zuweisen: {
            txt: 'zuweisen',
            type: 'includes_lower',
            pre: 'dw-zuw',
            gap: '2px',
            opts: [
                { v: 'oa', l: 'oa' },
                { v: 'ca', l: 'ca' },
                { v: 'ms', l: 'ms' },
                { v: 'sm', l: 'sm' },
                { v: 'da', l: 'da' },
                { v: 'hp', l: 'hp' },
                { v: 'ml', l: 'ml' },
                { v: 'cz', l: 'cz' }
            ]
        },

        vnnr: {
            txt: 'vn-nummer',
            type: 'includes_lower',
            pre: 'dw-vnnr',
            gap: '2px',
            opts: [
                { v: '0', l: '0' }
            ]
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

    const log = (m, d) => D && console.log(`[DW-BASIS] ${m}`, d || '');

    function cleanup() {
        if (window[ID]?.s) {
            window[ID].s.obs?.disconnect();
        }
    }

    function saveState() {
        try {
            const data = {
                reg: Array.from(S.reg.entries()),
                ts: Date.now()
            };
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

    function cleanTxt(txt) {
        return txt.replace(/\s*\*+\s*/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function matches(txt, cfg) {
        if (!cfg.txt) return false;
        const cleanedTxt = cleanTxt(txt);
        switch (cfg.type) {
            case 'includes': return cleanedTxt.includes(cfg.txt);
            case 'includes_lower': return cleanedTxt.toLowerCase().includes(cfg.txt.toLowerCase());
            case 'exact': return cleanedTxt === cfg.txt;
            default: return cleanedTxt.includes(cfg.txt);
        }
    }

    function findInp(row) {
        return row.querySelector('input.dw-textField, input.dw-numericField, input[type="text"]');
    }

    function isProc(f) {
        if (!f) return false;
        const r = f.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && f.offsetParent !== null;
    }

    function mkId(inp, txt, k) {
        const row = inp.closest('tr');
        if (!row) return null;
        const tbl = row.closest('table');
        const allRows = tbl ? Array.from(tbl.querySelectorAll('tr')) : [];
        const rowIdx = allRows.indexOf(row);
        return `${k}_${txt.replace(/[^a-zA-Z0-9]/g, '')}_${rowIdx}`;
    }

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
                if (!fid) continue;

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
            if (val === match || (cfg.map?.[match.toLowerCase()] === val)) {
                btn.classList.add('selected');
            }
        });
    }

    // ÄNDERUNG: Position aus POSITION-Objekt basierend auf Feld-Typ
    function mkBtnCont(inp, k, fid, cfg) {
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container dw-basis-inline-buttons`;
        cont.setAttribute('data-field-id', fid);
        cont.setAttribute('data-field-type', k); // NEU: Feld-Typ speichern
        
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

    function inject(f) {
        const { inp, contentCell, k, fid, cfg } = f;

        if (hasButtons(contentCell, cfg.pre)) return false;

        if (getComputedStyle(contentCell).position === 'static') {
            contentCell.style.position = 'relative';
        }

        const bc = mkBtnCont(inp, k, fid, cfg);
        contentCell.appendChild(bc);

        try {
            S.processed.add(inp);
            log(`✅ Buttons eingefügt: ${fid}`);
            return true;
        } catch (e) {
            log(`❌ Inject fail: ${fid}`, e);
            return false;
        }
    }

    function procAll(c) {
        let total = 0;
        Object.keys(CFG).forEach(k => {
            const fields = findInCont(k, c);
            fields.forEach(f => {
                if (inject(f)) total++;
            });
        });
        return total;
    }

    // ÄNDERUNG: Dynamisches CSS mit individuellen Positionen
    function injectCSS() {
        if (document.querySelector('style[data-dw-basis-btns]')) return;
        
        // Basis-Styles
        let css = `
/* Content-Cell Vorbereitung */
td.table-fields-content {
    position: relative !important;
}

/* Standard Button-Container */
.dw-basis-inline-buttons {
    position: ${POSITION.default.standard.position} !important;
    top: ${POSITION.default.standard.top} !important;
    left: ${POSITION.default.standard.left} !important;
    z-index: ${POSITION.default.standard.zIndex} !important;
    display: flex !important;
    align-items: center !important;
    gap: 2px !important;
    flex-wrap: nowrap !important;
    pointer-events: auto !important;
}

/* Modal Standard */
.dw-basis-inline-buttons.in-modal {
    position: ${POSITION.default.modal.position} !important;
    top: ${POSITION.default.modal.top} !important;
    left: ${POSITION.default.modal.left} !important;
    z-index: ${POSITION.default.modal.zIndex} !important;
}

`;

        // NEU: Individuelle Positionen für jeden Feld-Typ
        Object.keys(POSITION).forEach(fieldType => {
            if (fieldType === 'default') return;
            
            const pos = POSITION[fieldType];
            css += `
/* ${fieldType} - Standard */
.dw-basis-inline-buttons[data-field-type="${fieldType}"] {
    position: ${pos.standard.position} !important;
    top: ${pos.standard.top} !important;
    left: ${pos.standard.left} !important;
    z-index: ${pos.standard.zIndex} !important;
}

/* ${fieldType} - Modal */
.dw-basis-inline-buttons[data-field-type="${fieldType}"].in-modal {
    position: ${pos.modal.position} !important;
    top: ${pos.modal.top} !important;
    left: ${pos.modal.left} !important;
    z-index: ${pos.modal.zIndex} !important;
}
`;
        });

        // Button-Styles
        css += `
/* Button-Styling */
[class*="-action-button"] {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    border-radius: 1px !important;
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

[class*="-action-button"]:hover {
    background: rgba(249, 250, 251, 0.98) !important;
    border-color: #9ca3af !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

[class*="-action-button"].selected {
    background: #eff6ff !important;
    border-color: #3b82f6 !important;
    color: #1e40af !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

.ui-dialog [class*="-action-button"] {
    font-size: 10px !important;
    padding: 2px 5px !important;
    min-height: 16px !important;
}

td.table-fields-content:has(.dw-basis-inline-buttons) input.dw-textField,
td.table-fields-content:has(.dw-basis-inline-buttons) input.dw-numericField {
    padding-left: 5px !important;
}`;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-basis-btns', 'true');
        document.head.appendChild(style);
    }

    function mkObs() {
        let timeout;
        const obs = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                procAll(document.body);
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => procAll(d));
            }, 200);
        });
        obs.observe(document.body, { childList: true, subtree: true });
        return obs;
    }

    function init() {
        injectCSS();
        loadState();

        setTimeout(() => {
            procAll(document.body);
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => procAll(d));
        }, 300);

        S.obs = mkObs();
        S.init = true;
        log('✅ Initialisierung abgeschlossen');
    }

    window[ID].api = {
        refresh: () => {
            const bodyCount = procAll(document.body);
            let dlgCount = 0;
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => { dlgCount += procAll(d); });
            return { body: bodyCount, dialogs: dlgCount };
        },
        status: () => ({
            init: S.init,
            btns: document.querySelectorAll('.dw-basis-inline-buttons').length,
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
