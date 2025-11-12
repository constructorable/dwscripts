// buttons-bestaetigung.js
// NEU: Separate Datei für Bestätigungs-Schnellauswahl-Buttons (Objekt bestätigt, Rechnungsempfänger bestätigt, RE-Nr. bestätigt, RE-Steller bestätigt)
// Diese Buttons ermöglichen die schnelle Bestätigung von Feldern mit "j" (Ja) für verschiedene Prüf- und Freigabeprozesse
// Wird hauptsächlich in Rechnungs- und Verwaltungsdialogen verwendet

(function () {
    'use strict';
    
    const ID = 'dw-ko-buttons-bestaetigung', V = '1.0', SK = 'dw-ko-bestaetigung-state', D = true;
    
    const CFG = {
        objbestaet: {
            txt: 'objekt best',
            type: 'includes_lower',
            pre: 'dw-ob',
            gap: '20px',
            opts: [
                { v: 'j', l: 'j' }
            ]
        },
        
        rebestaet: {
            txt: 'ungssteller 🧑',
            type: 'includes_lower',
            pre: 'dw-rb',
            gap: '20px',
            opts: [
                { v: 'j', l: 'j' }
            ]
        },
        
        renrbestaet: {
            txt: 'RE-Nr.',
            type: 'includes_lower',
            pre: 'dw-rnrb',
            gap: '20px',
            opts: [
                { v: 'j', l: 'j' }
            ]
        },
        
        restbestaet: {
            txt: 'RE-Steller',
            type: 'includes_lower',
            pre: 'dw-rst',
            gap: '20px',
            opts: [
                { v: 'j', l: 'j' }
            ]
        }
    };

    let S = {
        init: false,
        reg: new Map(),
        obs: null,
        timeouts: new Set(),
        dialogs: new Set(),
        processed: new Set()
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-BEST] ${m}`, d || '');

    function cleanup() {
        if (window[ID] && window[ID].s) {
            window[ID].s.obs && window[ID].s.obs.disconnect();
            window[ID].s.timeouts && window[ID].s.timeouts.forEach(clearTimeout);
        }
    }

    function saveState() {
        try {
            const data = {
                reg: Array.from(S.reg.entries()),
                dlgs: Array.from(S.dialogs),
                processed: Array.from(S.processed),
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
                    S.dialogs = new Set(data.dlgs || []);
                    S.processed = new Set(data.processed || []);
                    return true;
                }
            }
        } catch (e) { log('Load err:', e); }
        return false;
    }

    function waitKO(cb, i = 0) {
        typeof ko !== 'undefined' && ko.version ? cb() : i < 50 ? setTimeout(() => waitKO(cb, i + 1), 100) : cb();
    }

    function waitKOBind(e, cb, i = 0) {
        if (i >= 30) { cb(); return; }
        const inp = e.querySelectorAll('input.dw-textField, input.dw-numericField');
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

    function matches(txt, cfg) {
        if (!cfg.txt) return false;
        return txt.toLowerCase().includes(cfg.txt.toLowerCase());
    }

    function findInp(row) {
        return row.querySelector('input.dw-textField, input.dw-numericField, input[type="text"]');
    }

    function findInCont(k, c, di = null) {
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

    function updSel(btn, fid) {
        const cont = btn.closest('[class*="-button-container"]');
        if (!cont) return;
        cont.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    function handleClick(e, opt, inp, fid) {
        e.preventDefault();
        e.stopPropagation();
        updSel(e.target, fid);
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
        const match = saved && saved.sel ? saved.sel : cur;
        if (!match) return;
        
        btns.forEach(btn => {
            const val = btn.getAttribute('data-value');
            if (val === match) {
                btn.classList.add('selected');
            }
        });
    }

    function mkBtnCont(inp, k, fid) {
        const cfg = CFG[k];
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container`;
        cont.setAttribute('data-field-id', fid);

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

    function inject(f, cfg, di = null) {
        const { inp, row, k, fid } = f;

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
        const bc = mkBtnCont(inp, k, fid);
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
            log(`✅ Buttons eingefügt: ${fid}`);
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
        total > 0 && saveState();
        return total;
    }

    function addToDlg(d, di) {
        if (S.dialogs.has(di)) return 0;
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, d, di); });
        if (total > 0) {
            S.dialogs.add(di);
            saveState();
        }
        return total;
    }

    function procAfterKO(e) {
        const dlg = e.closest && e.closest('.ui-dialog') || e.querySelector && e.querySelector('.ui-dialog') || (e.classList && e.classList.contains('ui-dialog') ? e : null);
        dlg ? setTimeout(() => addToDlg(dlg, getDlgId(dlg)), 100) : setTimeout(() => procStd(e), 100);
    }

    function injectCSS() {
        if (document.querySelector('style[data-dw-best-btns]')) return;
        const css = `[class*="dw-ob-button-row"],[class*="dw-rb-button-row"],[class*="dw-rnrb-button-row"],[class*="dw-rst-button-row"]{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important}[class*="dw-ob-"][class*="-button-container"],[class*="dw-rb-"][class*="-button-container"],[class*="dw-rnrb-"][class*="-button-container"],[class*="dw-rst-"][class*="-button-container"]{display:flex!important;align-items:center!important;gap:6px!important;padding:4px 1px 8px 29px!important;flex-wrap:wrap!important}[class*="dw-ob-"][class*="-action-button"],[class*="dw-rb-"][class*="-action-button"],[class*="dw-rnrb-"][class*="-action-button"],[class*="dw-rst-"][class*="-action-button"]{display:inline-flex!important;cursor:pointer!important;border-radius:3px!important;border:1px solid #d1d5db!important;background:#fff!important;color:#374151!important;padding:3px 8px!important;min-height:20px!important;font-size:11px!important;white-space:nowrap!important}[class*="-action-button"].selected{background:#eff6ff!important;border-color:#3b82f6!important;box-shadow:0 0 0 1px #3b82f6!important}.dw-btn-fade{animation:dwFade .3s ease-out}@keyframes dwFade{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}.ui-dialog [class*="-action-button"]{font-size:10px!important;padding:2px 6px!important;min-height:18px!important}`;
        
        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-best-btns', 'true');
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
        loadState();
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
            btns: document.querySelectorAll('.dw-ko-btn-row').length,
            dlgs: S.dialogs.size,
            reg: S.reg.size,
            processed: S.processed.size
        })
    };

    function main() {
        document.readyState === 'loading' ? 
            document.addEventListener('DOMContentLoaded', init, { once: true }) : 
            setTimeout(init, 300);
    }

    main();
})();