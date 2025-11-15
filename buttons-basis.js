// buttons-basis.js - OPTIMIERT
(function () {
    'use strict';
    
    const ID = 'dw-ko-buttons-basis', V = '2.0', SK = 'dw-ko-basis-state', D = true;
    
    const CFG = {
        nebenkosten: {
            txt: 'für Nebenkosten relevant',
            type: 'includes',
            pre: 'dw-nk',
            gap: '5px',
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
            gap: '20px',
            opts: [
                { v: '2025', l: '2025' },
                { v: '2024 / 2025', l: '2024 / 2025' },
                { v: '2024', l: '2024' },
                { v: '2025 / 2026', l: '2025 / 2026' }
            ]
        },
        
        skonto: {
            txt: 'skonto in',
            type: 'includes_lower',
            pre: 'dw-sk',
            gap: '20px',
            opts: [
                { v: '0', l: '0' },
                { v: '2', l: '2' },
                { v: '3', l: '3' }
            ]
        },
        
        zuweisen: {
            txt: 'zuweisen',
            type: 'includes_lower',
            pre: 'dw-zuw',
            gap: '20px',
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
            gap: '20px',
            opts: [
                { v: '0', l: '0' }
            ]
        }
    };

    // ÄNDERUNG: Zentrales WeakSet + SessionStorage
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
                if (!fid) continue;

                found.push({ inp, txt, row, k, fid, cfg });
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

    function mkBtnCont(inp, k, fid, cfg) {
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

    function inject(f) {
        const { inp, row, k, fid, cfg } = f;

        if (hasButtons(row, cfg.pre)) return false;

        const br = document.createElement('tr');
        br.className = `${cfg.pre}-button-row dw-ko-btn-row`;
        br.setAttribute('data-field-id', fid);
        br.setAttribute('data-config-key', k);
        
        const lc = document.createElement('td');
        lc.className = 'dw-fieldLabel';
        const cc = document.createElement('td');
        cc.className = `table-fields-content ${cfg.pre}-button-content`;
        const bc = mkBtnCont(inp, k, fid, cfg);
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

    function injectCSS() {
        if (document.querySelector('style[data-dw-basis-btns]')) return;
        const css = `[class*="dw-nk-button-row"],[class*="dw-wj-button-row"],[class*="dw-sk-button-row"],[class*="dw-zuw-button-row"],[class*="dw-vnnr-button-row"]{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important}[class*="-button-container"]{display:flex!important;align-items:center!important;gap:4px!important;padding:2px 1px 4px 29px!important;flex-wrap:wrap!important;margin-top:-6px!important}[class*="-action-button"]{display:inline-flex!important;cursor:pointer!important;border-radius:2px!important;border:1px solid #d1d5db!important;background:#fff!important;color:#374151!important;padding:2px 6px!important;min-height:18px!important;font-size:10px!important;white-space:nowrap!important;line-height:1.2!important}[class*="-action-button"].selected{background:#eff6ff!important;border-color:#3b82f6!important;box-shadow:0 0 0 1px #3b82f6!important}.ui-dialog [class*="-action-button"]{font-size:9px!important;padding:1px 5px!important;min-height:16px!important}`;
        
        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-basis-btns', 'true');
        document.head.appendChild(style);
    }

    // ÄNDERUNG: Throttled Observer statt Interval
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

