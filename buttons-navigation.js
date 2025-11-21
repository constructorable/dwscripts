// buttons-navigation.js - OPTIMIERT
(function () {
    'use strict';

    const ID = 'dw-ko-buttons-navigation', V = '2.4', D = true;

    // ÄNDERUNG: Spezifische Felder definieren
    const TARGET_FIELDS = [
        'Leistungszeitraum bis *',
        'Begünstigter IBAN *',
        'Objekt-Einheit-Miet-Nummer *'
    ];

    const CFG = {
        leistungszeitraumbis: {
            pre: 'dw-lzb',
            isNav: true,
            btnCfg: {
                l: '↓',
                a: 'scrollToNext'
            }
        }
    };

    // ÄNDERUNG: Nur spezifische Pflichtfelder finden
    function findTargetPflichtfelder() {
        const labels = document.querySelectorAll('.dw-fieldLabel span');
        const pflichtfelder = [];

        labels.forEach(lbl => {
            const txt = lbl.textContent?.trim() || '';

            // ÄNDERUNG: Nur TARGET_FIELDS berücksichtigen
            const isTargetField = TARGET_FIELDS.some(targetField => txt === targetField);
            if (!isTargetField) return;

            const row = lbl.closest('tr');
            if (!row) return;

            const inp = row.querySelector('input.dw-textField, input.dw-dateField, textarea, select');
            if (!inp || !isProc(inp)) return;

            const labelCell = row.querySelector('.dw-fieldLabel');
            if (!labelCell) return;

            pflichtfelder.push({ row, inp, txt, labelCell });
        });

        return pflichtfelder;
    }

    let S = {
        init: false,
        obs: null,
        processed: new WeakSet()
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-NAV] ${m}`, d || '');

    function cleanup() {
        if (window[ID]?.s) {
            window[ID].s.obs?.disconnect();
        }
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

    function scrollToNextInvalid() {
        const invalidFields = document.querySelectorAll(
            'input.invalidField[role="spinbutton"], ' +
            'input.invalidField[type="password"], ' +
            'input.invalidField[type="search"], ' +
            'input.invalidField[type="tel"], ' +
            'input.invalidField[type="text"]'
        );

        if (invalidFields.length > 0) {
            const field = invalidFields[0];
            field.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            setTimeout(() => {
                field.focus();
                const origBorder = field.style.border;
                const origShadow = field.style.boxShadow;
                field.style.border = '1px solid #13801eff';
                field.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                setTimeout(() => {
                    field.style.border = origBorder;
                    field.style.boxShadow = origShadow;
                }, 2000);
            }, 500);
        } else {
            log('Keine ungültigen Pflichtfelder gefunden');
        }
    }

    function hasButtons(labelCell, pre) {
        return labelCell?.querySelector(`.${pre}-nav-button`) !== null;
    }

    function findInCont(k, c) {
        const cfg = CFG[k];
        const found = [];

        try {
            // ÄNDERUNG: Nur noch spezifische Felder finden
            const pflichtfelder = findTargetPflichtfelder();
            if (pflichtfelder.length === 0) return found;

            log(`Gefunden: ${pflichtfelder.length} Zielfelder`);

            pflichtfelder.forEach((field, i) => {
                const { row, inp, txt, labelCell } = field;

                if (hasButtons(labelCell, cfg.pre) || S.processed.has(inp)) return;

                const fid = mkId(inp, txt, k) + `_${i}`;
                found.push({ inp, txt, row, labelCell, k, fid });
            });

            log(`Buttons werden an ${found.length} Stellen eingefügt`);

        } catch (e) { log(`Err find ${k}:`, e); }
        return found;
    }

    function mkNavBtn(fid) {
        const cfg = CFG.leistungszeitraumbis;

        const navBtn = document.createElement('button');
        navBtn.className = `${cfg.pre}-nav-button`;
        navBtn.type = 'button';
        navBtn.textContent = cfg.btnCfg.l;
        navBtn.title = 'Springt zum nächsten unvollständigen Pflichtfeld';
        navBtn.setAttribute('data-field-id', fid);
        navBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollToNextInvalid();
        }, { passive: false });

        return navBtn;
    }

    function inject(f, cfg) {
        const { inp, labelCell, fid } = f;

        if (hasButtons(labelCell, cfg.pre)) return false;

        try {
            const navBtn = mkNavBtn(fid);
            labelCell.appendChild(navBtn);

            S.processed.add(inp);
            log(`✅ Navigation-Button eingefügt: ${fid}`);
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
            if (inject(f, cfg)) added++;
        });
        return added;
    }

    function procStd(e) {
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, e); });
        return total;
    }

    function injectCSS() {
        if (document.querySelector('style[data-dw-nav-btns]')) return;
        const css = `
            .dw-fieldLabel {
                position: relative !important;
            }
            
            .dw-lzb-nav-button {
                position: absolute !important;
                right: -16px !important;
                top: 39% !important;
                transform: translateY(-50%) !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                border-radius: 2px !important;
                border: 1px solid #8a8a8a !important;
                background: #dbeafe !important;
                color: #7d7d7d !important;
                padding: 0 !important;
                width: 12px !important;
                height: 12px !important;
                font-size: 8px !important;
                font-weight: bold !important;
                line-height: 1 !important;
                transition: all 0.2s ease !important;
                margin: 0 !important;
                z-index: 10 !important;
            }
            
            .dw-lzb-nav-button:hover {
                background: #bfdbfe !important;
                border-color: #2563eb !important;
                box-shadow: 0 2px 4px rgba(37,99,235,0.3) !important;
            }
            
            .ui-dialog .dw-lzb-nav-button {
                width: 15px !important;
                height: 15px !important;
                font-size: 8px !important;
            }`;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-nav-btns', 'true');
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
            btns: document.querySelectorAll('.dw-lzb-nav-button').length,
            targetFields: TARGET_FIELDS
        }),
        scrollToNext: scrollToNextInvalid
    };

    function main() {
        document.readyState === 'loading' ?
            document.addEventListener('DOMContentLoaded', init, { once: true }) :
            setTimeout(init, 300);
    }

    main();
})();

