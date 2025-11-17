// buttons-bestaetigung.js - OPTIMIERT
(function () {
    'use strict';
    
    const ID = 'dw-ko-buttons-bestaetigung', V = '2.0', SK = 'dw-ko-bestaetigung-state', D = true;
    
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

    function hasButtons(row, pre) {
        const next = row.nextElementSibling;
        return next?.classList.contains(`${pre}-button-row`);
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
                if (!row || hasButtons(row, cfg.pre)) continue;
                
                const inp = findInp(row);
                if (!inp || !isProc(inp) || S.processed.has(inp)) continue;
                
                const fid = mkId(inp, txt, k);
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

    function inject(f, cfg) {
        const { inp, row, k, fid } = f;

        if (hasButtons(row, cfg.pre)) return false;

        const br = document.createElement('tr');
        br.className = `${cfg.pre}-button-row dw-ko-btn-row`;
        br.setAttribute('data-field-id', fid);
        br.setAttribute('data-config-key', k);
        
        const lc = document.createElement('td');
        lc.className = 'dw-fieldLabel';
        const cc = document.createElement('td');
        cc.className = `table-fields-content ${cfg.pre}-button-content`;
        const bc = mkBtnCont(inp, k, fid);
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
        total > 0 && saveState();
        return total;
    }

    function injectCSS() {
        if (document.querySelector('style[data-dw-best-btns]')) return;
        const css = `[class*="dw-ob-button-row"],[class*="dw-rb-button-row"],[class*="dw-rnrb-button-row"],[class*="dw-rst-button-row"]{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important}[class*="dw-ob-"][class*="-button-container"],[class*="dw-rb-"][class*="-button-container"],[class*="dw-rnrb-"][class*="-button-container"],[class*="dw-rst-"][class*="-button-container"]{display:flex!important;align-items:center!important;gap:6px!important;padding:0px 1px 6px 31px!important;flex-wrap:wrap!important}[class*="dw-ob-"][class*="-action-button"],[class*="dw-rb-"][class*="-action-button"],[class*="dw-rnrb-"][class*="-action-button"],[class*="dw-rst-"][class*="-action-button"]{display:inline-flex!important;cursor:pointer!important;border-radius:3px!important;border:1px solid #d1d5db!important;background:#fff!important;color:#374151!important;padding:3px 8px!important;min-height:15px!important; border-radius:22px !important; margin-top: -5px !important; font-size:11px!important;white-space:nowrap!important}[class*="-action-button"].selected{background:#eff6ff!important;border-color:#3b82f6!important;box-shadow:0 0 0 1px #3b82f6!important}.ui-dialog [class*="-action-button"]{font-size:10px!important;padding:2px 6px!important;min-height:18px!important}`;
        
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
            btns: document.querySelectorAll('.dw-ko-btn-row').length,
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

