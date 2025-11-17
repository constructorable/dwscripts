// buttons-navigation.js - OPTIMIERT
(function () {
    'use strict';

    const ID = 'dw-ko-buttons-navigation', V = '2.0', D = true;

    const CFG = {
        leistungszeitraumbis: {
            txt: 'Rechnungsnummer *',
            type: 'exact',
            pre: 'dw-lzb',
            gap: '12px',
            isNav: true,
            interval: 5, // NEU: Button alle 5 Pflichtfelder
            btnCfg: {
                l: '→ Nächstes leeres Pflichtfeld',
                a: 'scrollToNext'
            }
        }
    };

    function findAllePflichtfelder() {
        const labels = document.querySelectorAll('.dw-fieldLabel span');
        const pflichtfelder = [];

        labels.forEach(lbl => {
            const txt = lbl.textContent?.trim() || '';
            if (!txt.includes('*')) return;

            const row = lbl.closest('tr');
            if (!row) return;

            const inp = row.querySelector('input.dw-textField, input.dw-dateField, textarea, select');
            if (!inp || !isProc(inp)) return;

            pflichtfelder.push({ row, inp, txt });
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

    function findInp(row) {
        return row.querySelector('input.dw-textField, input[type="text"]');
    }

    function hasButtons(row, pre) {
        const next = row.nextElementSibling;
        return next?.classList.contains(`${pre}-button-row`);
    }

    function findInCont(k, c) {
        const cfg = CFG[k];
        const found = [];

        try {
            // Prüfen ob wir im richtigen Kontext sind (Rechnungsnummer vorhanden)
            const labels = c.querySelectorAll('.dw-fieldLabel span');
            const hasRechnungsnummer = Array.from(labels).some(label =>
                label.textContent.trim() === 'Rechnungsnummer *'
            );
            if (!hasRechnungsnummer) return found;

            // Alle Pflichtfelder finden
            const pflichtfelder = findAllePflichtfelder();
            if (pflichtfelder.length === 0) return found;

            log(`Gefunden: ${pflichtfelder.length} Pflichtfelder`);

            // Button alle X Pflichtfelder einfügen
            const interval = cfg.interval || 5;
            for (let i = interval - 1; i < pflichtfelder.length; i += interval) {
                const { row, inp, txt } = pflichtfelder[i];

                if (hasButtons(row, cfg.pre) || S.processed.has(inp)) continue;

                const fid = mkId(inp, txt, k) + `_${i}`;
                found.push({ inp, txt, row, k, fid });
            }

            log(`Buttons werden an ${found.length} Stellen eingefügt`);

        } catch (e) { log(`Err find ${k}:`, e); }
        return found;
    }

    function mkBtnCont(fid) {
        const cfg = CFG.leistungszeitraumbis;
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container`;
        cont.setAttribute('data-field-id', fid);

        const navBtn = document.createElement('button');
        navBtn.className = `${cfg.pre}-nav-button`;
        navBtn.type = 'button';
        navBtn.textContent = cfg.btnCfg.l;
        navBtn.title = 'Springt zum nächsten unvollständigen Pflichtfeld';
        navBtn.addEventListener('click', scrollToNextInvalid, { passive: true });
        cont.appendChild(navBtn);

        return cont;
    }

    function inject(f, cfg) {
        const { row, k, fid, inp } = f;

        if (hasButtons(row, cfg.pre)) return false;

        const br = document.createElement('tr');
        br.className = `${cfg.pre}-button-row dw-ko-btn-row`;
        br.setAttribute('data-field-id', fid);
        br.setAttribute('data-config-key', k);

        const lc = document.createElement('td');
        lc.className = 'dw-fieldLabel';
        const cc = document.createElement('td');
        cc.className = `table-fields-content ${cfg.pre}-button-content`;
        const bc = mkBtnCont(fid);
        cc.appendChild(bc);
        br.appendChild(lc);
        br.appendChild(cc);

        try {
            row.parentNode.insertBefore(br, row.nextSibling);
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
            [class*="dw-lzb-button-row"]{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important}
            [class*="dw-lzb-"][class*="-button-container"]{display:flex!important;align-items:center!important;gap:12px!important;padding:0px 1px 12px 29px!important;border-top:1px solid #e5e7eb!important;margin-top:0px!important}
            [class*="dw-lzb-"][class*="-nav-button"]{display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;border-radius:4px!important;border:1px solid #3b82f6!important;background:#dbeafe!important;color:#1e40af!important;padding:4px 16px!important;min-height:12px!important;font-size:12px!important;font-weight:500!important;white-space:nowrap!important;transition:all 0.2s ease!important}
            [class*="dw-lzb-"][class*="-nav-button"]:hover{background:#bfdbfe!important;border-color:#2563eb!important;transform:translateY(-1px)!important;box-shadow:0 2px 4px rgba(37,99,235,0.2)!important}
            .ui-dialog [class*="dw-lzb-"][class*="-nav-button"]{font-size:11px!important;padding:4px 10px!important;min-height:22px!important}`;

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
            btns: document.querySelectorAll('.dw-lzb-button-row').length
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


