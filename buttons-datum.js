// buttons-datum.js - MIT INDIVIDUELLER POSITIONSKONTROLLE
(function () {
    'use strict';

    const ID = 'dw-ko-buttons-datum', V = '2.0', SK = 'dw-ko-datum-state', D = true;

    // NEU: Individuelle Positionierung pro Datumsfeld-Typ
    const POSITION = {
        // Standard-Position für alle Datumsfelder
        default: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '232px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        // NEU: Spezifische Positionen für Zukunfts-Datumsfelder
        datumsfelder: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '232px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        // NEU: Spezifische Positionen für Vergangenheits-Datumsfelder
        datumsfelderpast: {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '232px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        // NEU: Optionale individuelle Positionen pro Label (Beispiele)
        'Fälligkeitsdatum': {
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
        
        'Leistungszeitraum von': {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '232px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },
        
        'Leistungszeitraum bis': {
            standard: {
                position: 'absolute',
                top: '2px',
                left: '232px',
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
        datumsfelder: {
            txt: '',
            type: 'date_field',
            pre: 'dw-datum',
            gap: '2px',
            wrap: true,
            isDate: true,
            exc: [
                'Eingangsdatum', 'Rechnungsdatum', 'Fälligkeitsdatum',
                'Erstellungsdatum', 'Ausgangsdatum', 'Ausführungsdatum (Bericht)',
                'Abgelegt am', 'nächster Ablesetermin'
            ],
            opts: [
                { v: 'heute', l: 'Heute', a: 'setToday' },
                { v: 'morgen', l: 'Morgen', a: 'setTomorrow' },
                { v: 'woche', l: '+1 Woche', a: 'setNextWeek' },
                { v: '2wochen', l: '+2 Wochen', a: 'setTwoWeeks' },
                { v: '3wochen', l: '+3 Wochen', a: 'setThreeWeeks' },
                { v: '4wochen', l: '+4 Wochen', a: 'setFourWeeks' },
                { v: 'jahresanfang', l: '01.01', a: 'setYearStart' },
                { v: 'jahresende', l: '31.12', a: 'setYearEnd' }
            ]
        },

        datumsfelderpast: {
            txt: '',
            type: 'date_field_past',
            pre: 'dw-datum-past',
            gap: '2px',
            wrap: true,
            isDate: true,
            inc: ['Eingangsdatum', 'Erstellungsdatum'],
            opts: [
                { v: 'heute', l: 'Heute', a: 'setToday' },
                { v: 'gestern', l: 'Gestern', a: 'setYesterday' },
                { v: 'vorgestern', l: 'Vorgestern', a: 'setDayBeforeYesterday' },
                { v: '-1woche', l: '-1 Woche', a: 'setLastWeek' },
                { v: '-2wochen', l: '-2 Wochen', a: 'setTwoWeeksAgo' },
                { v: '-3wochen', l: '-3 Wochen', a: 'setThreeWeeksAgo' },
                { v: '-4wochen', l: '-4 Wochen', a: 'setFourWeeksAgo' }
            ]
        }
    };

    let S = {
        init: false,
        obs: null,
        processed: new WeakSet()
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-DATUM] ${m}`, d || '');

    function cleanup() {
        if (window[ID]?.s) {
            window[ID].s.obs?.disconnect();
        }
    }

    const dateCache = new Map();

    function getFmt(d) {
        const k = d.getTime();
        if (!dateCache.has(k)) {
            dateCache.set(k, `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`);
        }
        return dateCache.get(k);
    }

    function getDate(a) {
        const ck = `date_${a}`;
        if (dateCache.has(ck)) return dateCache.get(ck);
        const today = new Date();
        const dates = {
            setToday: today,
            setTomorrow: new Date(today.getTime() + 86400000),
            setNextWeek: new Date(today.getTime() + 604800000),
            setTwoWeeks: new Date(today.getTime() + 1209600000),
            setThreeWeeks: new Date(today.getTime() + 1814400000),
            setFourWeeks: new Date(today.getTime() + 2419200000),
            setYearStart: new Date(today.getFullYear(), 0, 1),
            setYearEnd: new Date(today.getFullYear(), 11, 31),
            setYesterday: new Date(today.getTime() - 86400000),
            setDayBeforeYesterday: new Date(today.getTime() - 172800000),
            setLastWeek: new Date(today.getTime() - 604800000),
            setTwoWeeksAgo: new Date(today.getTime() - 1209600000),
            setThreeWeeksAgo: new Date(today.getTime() - 1814400000),
            setFourWeeksAgo: new Date(today.getTime() - 2419200000)
        };
        const res = getFmt(dates[a] || today);
        dateCache.set(ck, res);
        return res;
    }

    function waitKO(cb, i = 0) {
        typeof ko !== 'undefined' && ko.version ? cb() : i < 50 ? setTimeout(() => waitKO(cb, i + 1), 100) : cb();
    }

    function isProc(f) {
        if (!f) return false;
        const r = f.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && f.offsetParent !== null;
    }

    function mkId(inp, txt, k) {
        const nm = inp.name || inp.id || '';
        const tbl = inp.closest('table');
        const pos = tbl ? Array.from(tbl.querySelectorAll('input')).indexOf(inp) : 0;
        return `${k}_${nm}_${txt.replace(/[^a-zA-Z0-9]/g, '')}_${pos}`;
    }

    function hasButtons(contentCell, pre) {
        return contentCell.querySelector(`.${pre}-button-container`) !== null;
    }

    function istInModal(inp) {
        return inp.closest('.ui-dialog') !== null;
    }

    // ÄNDERUNG: Gibt auch Label-Text zurück für Positions-Lookup
    function findDateInCont(cfg, k, c) {
        const found = [];
        const dates = c.querySelectorAll('input.dw-dateField');

        for (const inp of dates) {
            if (!isProc(inp) || S.processed.has(inp)) continue;
            
            const contentCell = inp.closest('td.table-fields-content');
            if (!contentCell || hasButtons(contentCell, cfg.pre)) continue;

            const row = inp.closest('tr');
            if (!row) continue;
            
            const lbl = row.querySelector('.dw-fieldLabel span');
            const txt = lbl?.textContent?.trim().replace(/\s*\*\s*$/, '') || 'Datumsfeld';

            if (cfg.inc) {
                const isIncluded = cfg.inc.some(x => txt.includes(x) || txt.toLowerCase().includes(x.toLowerCase()));
                if (!isIncluded) continue;
            } else if (cfg.exc?.some(x => txt.includes(x) || txt.toLowerCase().includes(x.toLowerCase()))) {
                continue;
            }

            const fid = mkId(inp, txt, k);
            found.push({ inp, txt, contentCell, k, fid, cfg });
        }
        return found;
    }

    function setVal(inp, val) {
        inp.value = val;
        typeof $ !== 'undefined' && $(inp).data('datepicker') && $(inp).datepicker('setDate', val);
        requestAnimationFrame(() => {
            inp.focus();
            ['input', 'change', 'blur'].forEach(t => inp.dispatchEvent(new Event(t, { bubbles: true, cancelable: true })));
        });
    }

    function handleClick(e, opt, inp) {
        e.preventDefault();
        e.stopPropagation();
        const val = getDate(opt.a);
        setVal(inp, val);
    }

    function mkBtn(opt, cfg, inp, fid) {
        const btn = document.createElement('button');
        btn.className = `${cfg.pre}-action-button`;
        btn.type = 'button';
        btn.textContent = opt.l;
        btn.title = opt.l;
        btn.setAttribute('data-value', opt.v);
        btn.setAttribute('data-field-id', fid);
        btn.setAttribute('data-action', opt.a || '');
        btn.addEventListener('click', e => handleClick(e, opt, inp), { passive: true });
        return btn;
    }

    // ÄNDERUNG: Label-Text für individuelle Positionierung
    function mkBtnCont(inp, k, fid, labelText) {
        const cfg = CFG[k];
        const inModal = istInModal(inp);
        
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container dw-datum-inline-buttons`;
        cont.setAttribute('data-field-id', fid);
        cont.setAttribute('data-field-type', k);
        cont.setAttribute('data-field-label', labelText); // NEU: Label für CSS-Selektor
        
        if (inModal) {
            cont.classList.add('in-modal');
        }

        const frag = document.createDocumentFragment();
        cfg.opts.forEach(opt => {
            const btn = mkBtn(opt, cfg, inp, fid);
            frag.appendChild(btn);
        });
        cont.appendChild(frag);
        return cont;
    }

    function inject(f) {
        const { inp, contentCell, k, fid, txt, cfg } = f;

        if (hasButtons(contentCell, cfg.pre)) return false;

        if (getComputedStyle(contentCell).position === 'static') {
            contentCell.style.position = 'relative';
        }

        const bc = mkBtnCont(inp, k, fid, txt);
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

    function procCfgInEl(k, c) {
        const cfg = CFG[k];
        const fields = findDateInCont(cfg, k, c);
        let added = 0;
        fields.forEach(f => {
            if (inject(f)) added++;
        });
        return added;
    }

    function procStd(e) {
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, e); });
        return total;
    }

    // ÄNDERUNG: Dynamisches CSS mit individuellen Positionen
    function injectCSS() {
        if (document.querySelector('style[data-dw-datum-btns]')) return;
        
        // Basis-Styles
        let css = `
/* Content-Cell Vorbereitung */
td.table-fields-content {
    position: relative !important;
}

/* Standard Button-Container */
.dw-datum-inline-buttons {
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
.dw-datum-inline-buttons.in-modal {
    position: ${POSITION.default.modal.position} !important;
    top: ${POSITION.default.modal.top} !important;
    left: ${POSITION.default.modal.left} !important;
    z-index: ${POSITION.default.modal.zIndex} !important;
}

`;

        // NEU: Individuelle Positionen für jeden Feld-Typ
        Object.keys(POSITION).forEach(fieldKey => {
            if (fieldKey === 'default') return;
            
            const pos = POSITION[fieldKey];
            
            // Prüfen ob es ein Config-Key (datumsfelder/datumsfelderpast) oder Label ist
            const isConfigKey = CFG.hasOwnProperty(fieldKey);
            
            if (isConfigKey) {
                // Standard Position für Feld-Typ
                css += `
/* ${fieldKey} - Standard */
.dw-datum-inline-buttons[data-field-type="${fieldKey}"] {
    position: ${pos.standard.position} !important;
    top: ${pos.standard.top} !important;
    left: ${pos.standard.left} !important;
    z-index: ${pos.standard.zIndex} !important;
}

/* ${fieldKey} - Modal */
.dw-datum-inline-buttons[data-field-type="${fieldKey}"].in-modal {
    position: ${pos.modal.position} !important;
    top: ${pos.modal.top} !important;
    left: ${pos.modal.left} !important;
    z-index: ${pos.modal.zIndex} !important;
}
`;
            } else {
                // Individuelle Position für spezifisches Label
                css += `
/* Label: ${fieldKey} - Standard */
.dw-datum-inline-buttons[data-field-label="${fieldKey}"] {
    position: ${pos.standard.position} !important;
    top: ${pos.standard.top} !important;
    left: ${pos.standard.left} !important;
    z-index: ${pos.standard.zIndex} !important;
}

/* Label: ${fieldKey} - Modal */
.dw-datum-inline-buttons[data-field-label="${fieldKey}"].in-modal {
    position: ${pos.modal.position} !important;
    top: ${pos.modal.top} !important;
    left: ${pos.modal.left} !important;
    z-index: ${pos.modal.zIndex} !important;
}
`;
            }
        });

        // Button-Styles
        css += `
/* Button-Styling */
[class*="dw-datum"][class*="-action-button"] {
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

[class*="dw-datum"][class*="-action-button"]:hover {
    background: rgba(249, 250, 251, 0.98) !important;
    border-color: #9ca3af !important;
    
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
}

.ui-dialog [class*="dw-datum"][class*="-action-button"] {
    font-size: 10px !important;
    padding: 2px 5px !important;
    min-height: 16px !important;
}

td.table-fields-content:has(.dw-datum-inline-buttons) input.dw-dateField {
    padding-left: 5px !important;
}`;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-datum-btns', 'true');
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
        waitKO(() => {
            setTimeout(() => {
                procStd(document.body);
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => procStd(d));
            }, 300);
        });
        S.obs = mkObs();
        S.init = true;
        log('✅ Initialisierung abgeschlossen');
    }

    window[ID].api = {
        refresh: () => {
            const bodyCount = procStd(document.body);
            let dlgCount = 0;
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => { dlgCount += procStd(d); });
            return { body: bodyCount, dialogs: dlgCount };
        },
        status: () => ({
            init: S.init,
            btns: document.querySelectorAll('.dw-datum-inline-buttons').length
        })
    };

    function main() {
        document.readyState === 'loading' ?
            document.addEventListener('DOMContentLoaded', init, { once: true }) :
            setTimeout(init, 300);
    }

    main();
})();

