// buttons-navigation.js
// NEU: Separate Datei für Navigations-Button (Springt zum nächsten unausgefüllten Pflichtfeld)
// Dieser Button ermöglicht die schnelle Navigation zu leeren Pflichtfeldern in langen Formularen
// Prüft auf Vorhandensein von "Fälligkeitsdatum *" Feld und zeigt visuelle Hervorhebung beim Fokussieren

(function () {
    'use strict';
    
    const ID = 'dw-ko-buttons-navigation', V = '1.0', D = true;
    
    const CFG = {
        leistungszeitraumbis: {
            txt: 'Rechnungsnummer *',
            type: 'exact',
            pre: 'dw-lzb',
            gap: '12px',
            isNav: true,
            btnCfg: {
                l: '→ Nächstes leeres Pflichtfeld',
                a: 'scrollToNext'
            }
        }
    };

    let S = {
        init: false,
        obs: null,
        timeouts: new Set(),
        dialogs: new Set(),
        processed: new Set()
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-NAV] ${m}`, d || '');

    function cleanup() {
        if (window[ID] && window[ID].s) {
            window[ID].s.obs && window[ID].s.obs.disconnect();
            window[ID].s.timeouts && window[ID].s.timeouts.forEach(clearTimeout);
        }
    }

    function waitKO(cb, i = 0) {
        typeof ko !== 'undefined' && ko.version ? cb() : i < 50 ? setTimeout(() => waitKO(cb, i + 1), 100) : cb();
    }

    function waitKOBind(e, cb, i = 0) {
        if (i >= 30) { cb(); return; }
        const inp = e.querySelectorAll('input.dw-textField');
        const hasBind = Array.from(inp).some(f => f.hasAttribute('data-bind'));
        hasBind ? setTimeout(() => waitKOBind(e, cb, i + 1), 150) : cb();
    }

    function isProc(f) {
        if (!f) return false;
        const r = f.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && f.offsetParent !== null && f.closest('tr');
    }

    function mkId(inp, txt, k, di = null) {
        const nm = inp.name || inp.id || '';
        const tbl = inp.closest('table');
        const pos = tbl ? Array.from(tbl.querySelectorAll('input')).indexOf(inp) : 0;
        const base = `${k}_${nm}_${txt.replace(/[^a-zA-Z0-9]/g, '')}_${pos}`;
        return di ? `${di}_${base}` : base;
    }

    function getDlgId(d) {
        if (!d) return null;
        const t = d.querySelector('.ui-dialog-title');
        const tt = t && t.textContent ? t.textContent.trim() : '';
        const c = d.querySelector('.ui-dialog-content');
        const ci = c && c.id ? c.id : '';
        const di = d.id || Math.random().toString(36).substr(2, 9);
        return `dlg_${tt}_${ci}_${di}`.replace(/[^a-zA-Z0-9_]/g, '_');
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

    function findInCont(k, c, di = null) {
        const cfg = CFG[k];
        const found = [];
        
        try {
            const labels = c.querySelectorAll('.dw-fieldLabel span');
            for (const lbl of labels) {
                if (!lbl.textContent) continue;
                const txt = lbl.textContent.trim();
                if (txt !== cfg.txt) continue;

                const hasRechnungsnummer = Array.from(labels).some(label =>
                    label.textContent.trim() === 'Fälligkeitsdatum *'
                );
                if (!hasRechnungsnummer) {
                    log('⏭️ Fälligkeitsdatum * nicht gefunden - Navigation-Button übersprungen');
                    continue;
                }

                const row = lbl.closest('tr');
                if (!row) continue;
                const inp = findInp(row);
                if (!inp || !isProc(inp)) continue;
                const fid = mkId(inp, txt, k, di);

                const hasExistingButtons = row.nextElementSibling && row.nextElementSibling.classList.contains(`${cfg.pre}-button-row`);
                const alreadyProcessed = S.processed.has(fid);
                const hasButtonsInDOM = document.querySelector(`[data-field-id="${fid}"]`);

                if (hasExistingButtons || alreadyProcessed || hasButtonsInDOM) {
                    log(`⏭️ Feld bereits verarbeitet: ${fid}`);
                    continue;
                }

                found.push({ inp, txt, row, k, fid });
                break;
            }
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

    function inject(f, cfg, di = null) {
        const { row, k, fid } = f;

        if (row.nextElementSibling && row.nextElementSibling.classList.contains(`${cfg.pre}-button-row`)) {
            log(`⚠️ Button-Reihe bereits vorhanden: ${fid}`);
            return false;
        }
        if (document.querySelector(`[data-field-id="${fid}"]`)) {
            log(`⚠️ Button bereits im DOM: ${fid}`);
            return false;
        }

        const br = document.createElement('tr');
        br.className = `${cfg.pre}-button-row dw-ko-btn-row`;
        br.setAttribute('data-field-id', fid);
        br.setAttribute('data-config-key', k);
        di && br.setAttribute('data-dialog-id', di);
        br.style.cssText = 'position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important;';
        
        const lc = document.createElement('td');
        lc.className = 'dw-fieldLabel';
        const cc = document.createElement('td');
        cc.className = `table-fields-content ${cfg.pre}-button-content`;
        const bc = mkBtnCont(fid);
        cc.appendChild(bc);
        br.appendChild(lc);
        br.appendChild(cc);
        br.classList.add('dw-btn-fade');
        
        try {
            row.parentNode.insertBefore(br, row.nextSibling);
            setTimeout(() => {
                br.style.display = 'table-row';
                br.style.opacity = '1';
                br.style.visibility = 'visible';
            }, 50);
            log(`✅ Navigation-Button eingefügt: ${fid}`);
            return true;
        } catch (e) {
            log(`❌ Inject fail: ${fid}`, e);
            return false;
        }
    }

    function injectWithDelay(f, cfg, di) {
        const delays = [50, 150, 300];
        function attempt(i = 0) {
            if (i >= delays.length) return false;
            setTimeout(() => {
                if (f.inp && f.inp.isConnected && f.inp.offsetParent !== null) {
                    const success = inject(f, cfg, di);
                    if (!success) attempt(i + 1);
                }
            }, delays[i]);
        }
        attempt();
        return true;
    }

    function procCfgInEl(k, c, di = null) {
        const cfg = CFG[k];
        const fields = findInCont(k, c, di);
        if (!fields.length) return 0;
        
        let added = 0;
        fields.forEach(f => {
            if (!S.processed.has(f.fid)) {
                requestAnimationFrame(() => {
                    if (injectWithDelay(f, cfg, di)) {
                        S.processed.add(f.fid);
                        added++;
                    }
                });
            }
        });
        return added;
    }

    function procStd(e) {
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, e); });
        return total;
    }

    function addToDlg(d, di) {
        if (S.dialogs.has(di)) return 0;
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, d, di); });
        if (total > 0) S.dialogs.add(di);
        return total;
    }

    function procAfterKO(e) {
        const dlg = e.closest && e.closest('.ui-dialog') || e.querySelector && e.querySelector('.ui-dialog') || (e.classList && e.classList.contains('ui-dialog') ? e : null);
        dlg ? setTimeout(() => addToDlg(dlg, getDlgId(dlg)), 100) : setTimeout(() => procStd(e), 100);
    }

    function injectCSS() {
        if (document.querySelector('style[data-dw-nav-btns]')) return;
        const css = `[class*="dw-lzb-button-row"]{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important}[class*="dw-lzb-"][class*="-button-container"]{display:flex!important;align-items:center!important;gap:12px!important;padding:4px 1px 8px 29px!important}[class*="dw-lzb-"][class*="-nav-button"]{display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;border-radius:4px!important;border:1px solid #3b82f6!important;background:#dbeafe!important;color:#1e40af!important;padding:1px 12px!important;min-height:24px!important;font-size:12px!important;font-weight:500!important;white-space:nowrap!important;transition:all 0.2s ease!important}[class*="dw-lzb-"][class*="-nav-button"]:hover{background:#bfdbfe!important;border-color:#2563eb!important;transform:translateY(-1px)!important;box-shadow:0 2px 4px rgba(37,99,235,0.2)!important}.dw-btn-fade{animation:dwFade .3s ease-out}@keyframes dwFade{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}.ui-dialog [class*="dw-lzb-"][class*="-nav-button"]{font-size:11px!important;padding:4px 10px!important;min-height:22px!important}`;
        
        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-nav-btns', 'true');
        document.head.appendChild(style);
    }

    function mkObs() {
        const obs = new MutationObserver(() => {
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => {
                const di = getDlgId(d);
                const hasBtns = d.querySelectorAll('.dw-ko-btn-row').length > 0;
                !hasBtns && waitKOBind(d, () => addToDlg(d, di));
            });
            procStd(document.body);
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
                dlgs.forEach(d => {
                    const di = getDlgId(d);
                    waitKOBind(d, () => addToDlg(d, di));
                });
            }, 500);
        });
        S.obs = mkObs();
        S.init = true;
    }

    window[ID].api = {
        refresh: () => {
            S.dialogs.clear();
            S.processed.clear();
            const std = procStd(document.body);
            let dlgCnt = 0;
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => {
                const di = getDlgId(d);
                waitKOBind(d, () => { dlgCnt += addToDlg(d, di); });
            });
            return { std, dlgs: dlgCnt };
        },
        status: () => ({
            init: S.init,
            btns: document.querySelectorAll('.dw-lzb-button-row').length,
            dlgs: S.dialogs.size,
            processed: S.processed.size
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