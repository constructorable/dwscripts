(function () {
    'use strict';

    const ID = 'dw-betreff-buttons', V = '2.0', SK = 'dw-betreff-state', D = true;

    const BETREFF_CONFIG = {
        fieldLabel: 'Betreff',
        prefix: 'dw-betreff',
        gap: '2px',
keywords: [
    { value: '(tags: ', label: '(tags: ' },
    { value: ')', label: ')' },
    { value: 'Abrechnung', label: 'Abrechnung' },
    { value: 'Anwalt / Klage', label: 'Anwalt / Klage' },
    { value: 'Betriebskostenabrechnung / Nebenkostenabrechnung', label: 'BK-Abrechnung' },
    { value: 'Einspruch / Widerspruch', label: 'Einspruch / Widerspruch' },
    { value: 'Feuchtigkeit', label: 'Feuchtigkeit' },
    { value: 'Heizung', label: 'Heizung' },
    { value: 'Kündigung', label: 'Kündigung' },
    { value: 'Mieterhöhung / Mietanpassung', label: 'Mieterhöhung' },
    { value: 'Mietkürzung / Mietminderung', label: 'Mietkürzung / Mietminderung' },
    { value: 'Nass / Nässe', label: 'Nass / Nässe' },
    { value: 'Ratenzahlungsvereinbarung', label: 'Ratenzahlung' },
    { value: 'Schädlingsbekämpfung (Ratten, Mäuse, Schaben)', label: 'Schädlingsbekämpfung' },
    { value: 'Schimmel', label: 'Schimmel' },
    { value: 'Strom / Elektrik / Elektro', label: 'Strom / Elektrik' },
    { value: 'Versicherung', label: 'Versicherung' },
    { value: 'Warmwasser', label: 'Warmwasser' },
    { value: 'Wartung / Prüfung', label: 'Wartung / Prüfung' },
    { value: 'Wasser', label: 'Wasser' },
    { value: 'Wasserschaden', label: 'Wasserschaden' },
    { value: 'Zahlungserinnerung / Mahnung', label: 'Mahnung' },
    { value: 'Zähler', label: 'Zähler' }
]
    };

    // ÄNDERUNG: Einheitliche State-Struktur wie andere Button-Scripts
    let S = {
        init: false,
        obs: null,
        processed: new WeakSet()
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-BETREFF] ${m}`, d || '');

    function cleanup() {
        if (window[ID]?.s) {
            window[ID].s.obs?.disconnect();
        }
    }

    function waitKO(cb, i = 0) {
        typeof ko !== 'undefined' && ko.version ? cb() : i < 50 ? setTimeout(() => waitKO(cb, i + 1), 100) : cb();
    }

    function injectCSS() {
        if (document.querySelector(`style[data-${ID}]`)) return;

        const css = `
            .${BETREFF_CONFIG.prefix}-button-row {
                position: relative !important;
                display: table-row !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .${BETREFF_CONFIG.prefix}-button-container {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-start !important;
                padding: 4px 1px 8px 29px !important;
                gap: ${BETREFF_CONFIG.gap} !important;
                flex-wrap: wrap !important;
            }
            
            .${BETREFF_CONFIG.prefix}-action-button {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                border-radius: 3px !important;
                border: 1px solid #d1d5db !important;
                background: #fff !important;
                color: #374151 !important;
                padding: 3px 8px !important;
                min-height: 20px !important;
                font-size: 11px !important;
                white-space: nowrap !important;
                transition: all 0.15s ease !important;
            }
            
            .${BETREFF_CONFIG.prefix}-action-button:hover {
                background: #f9fafb !important;
                border-color: #9ca3af !important;
            }
            
            .ui-dialog .${BETREFF_CONFIG.prefix}-action-button {
                font-size: 10px !important;
                padding: 2px 6px !important;
                min-height: 18px !important;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute(`data-${ID}`, 'true');
        document.head.appendChild(style);
    }

    function isProc(f) {
        if (!f) return false;
        const r = f.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && f.offsetParent !== null && f.closest('tr');
    }

    function mkId(inp, txt) {
        const nm = inp.name || inp.id || '';
        const tbl = inp.closest('table');
        const pos = tbl ? Array.from(tbl.querySelectorAll('input')).indexOf(inp) : 0;
        return `betreff_${nm}_${txt.replace(/[^a-zA-Z0-9]/g, '')}_${pos}`;
    }

    function hasButtons(row, pre) {
        const next = row.nextElementSibling;
        return next?.classList.contains(`${pre}-button-row`);
    }

    function findBetreffFields(c) {
        const found = [];
        const labels = c.querySelectorAll('.dw-fieldLabel span');

        for (const lbl of labels) {
            if (!lbl.textContent) continue;
            const txt = lbl.textContent.trim();

            const isBetreffField =
                txt === BETREFF_CONFIG.fieldLabel ||
                txt === `${BETREFF_CONFIG.fieldLabel}:` ||
                txt === `${BETREFF_CONFIG.fieldLabel} °` ||
                txt.startsWith(BETREFF_CONFIG.fieldLabel) && txt.includes('°');

            if (!isBetreffField) continue;

            const row = lbl.closest('tr');
            if (!row || hasButtons(row, BETREFF_CONFIG.prefix)) continue;

            let inp = row.querySelector('input.dw-textField[type="text"]');
            if (!inp) inp = row.querySelector('td.table-fields-content input.dw-textField');
            if (!inp) inp = row.querySelector('input[type="text"]');
            if (!inp) {
                const contentCell = row.querySelector('td[data-bind*="template"]');
                if (contentCell) inp = contentCell.querySelector('input.dw-textField, input[type="text"]');
            }

            if (!inp || !isProc(inp) || S.processed.has(inp)) continue;

            const fid = mkId(inp, txt);
            found.push({ inp, txt, row, fid });
        }

        return found;
    }

    function handleClick(e, kw, inp) {
        e.preventDefault();
        e.stopPropagation();

        const cur = inp.value.trim();
        const newVal = cur ? `${cur} | ${kw.value}` : kw.value;
        inp.value = newVal;

        requestAnimationFrame(() => {
            inp.focus();
            ['input', 'change', 'blur'].forEach(t => inp.dispatchEvent(new Event(t, { bubbles: true, cancelable: true })));
        });
    }

    function mkBtn(kw, inp, fid) {
        const btn = document.createElement('button');
        btn.className = `${BETREFF_CONFIG.prefix}-action-button`;
        btn.type = 'button';
        btn.textContent = kw.label;
        btn.title = kw.value;
        btn.setAttribute('data-value', kw.value);
        btn.setAttribute('data-field-id', fid);
        btn.addEventListener('click', e => handleClick(e, kw, inp), { passive: true });
        return btn;
    }

    function mkBtnCont(inp, fid) {
        const cont = document.createElement('div');
        cont.className = `${BETREFF_CONFIG.prefix}-button-container`;
        cont.setAttribute('data-field-id', fid);

        const frag = document.createDocumentFragment();
        BETREFF_CONFIG.keywords.forEach(kw => {
            const btn = mkBtn(kw, inp, fid);
            frag.appendChild(btn);
        });
        cont.appendChild(frag);
        return cont;
    }

    function inject(f) {
        const { inp, row, fid } = f;

        if (hasButtons(row, BETREFF_CONFIG.prefix)) return false;

        const br = document.createElement('tr');
        br.className = `${BETREFF_CONFIG.prefix}-button-row`;
        br.setAttribute('data-field-id', fid);

        const lc = document.createElement('td');
        lc.className = 'dw-fieldLabel';
        const cc = document.createElement('td');
        cc.className = `table-fields-content ${BETREFF_CONFIG.prefix}-button-content`;
        const bc = mkBtnCont(inp, fid);
        cc.appendChild(bc);
        br.appendChild(lc);
        br.appendChild(cc);

        try {
            row.parentNode.insertBefore(br, row.nextSibling);
            S.processed.add(inp);
            log(`✅ Buttons eingefügt: ${fid}`);
            return true;
        } catch (e) {
            log(`❌ Inject fail: ${fid}`, e);
            return false;
        }
    }

    function procStd(c) {
        const fields = findBetreffFields(c);
        let added = 0;
        fields.forEach(f => {
            if (inject(f)) added++;
        });
        return added;
    }

    // ÄNDERUNG: Throttled Observer wie andere Button-Scripts
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
        log('✅ Initialisiert');
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
            btns: document.querySelectorAll(`.${BETREFF_CONFIG.prefix}-button-row`).length,
            keywords: BETREFF_CONFIG.keywords.length
        })
    };

    function main() {
        document.readyState === 'loading' ?
            document.addEventListener('DOMContentLoaded', init, { once: true }) :
            setTimeout(init, 300);
    }

    main();
})();

