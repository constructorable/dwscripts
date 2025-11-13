// buttons-datum.js
// ÄNDERUNG: Kompaktere Buttons mit reduziertem Abstand zum Datumsfeld

(function () {
    'use strict';

    const ID = 'dw-ko-buttons-datum', V = '1.0', SK = 'dw-ko-datum-state', D = true;

    const CFG = {
        datumsfelder: {
            txt: '',
            type: 'date_field',
            pre: 'dw-datum',
            gap: '8px',
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
            gap: '8px',
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
        timeouts: new Set(),
        dialogs: new Set(),
        processed: new Set()
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-DATUM] ${m}`, d || '');

    function cleanup() {
        if (window[ID] && window[ID].s) {
            window[ID].s.obs && window[ID].s.obs.disconnect();
            window[ID].s.timeouts && window[ID].s.timeouts.forEach(clearTimeout);
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

    function waitKOBind(e, cb, i = 0) {
        if (i >= 30) { cb(); return; }
        const inp = e.querySelectorAll('input.dw-dateField');
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

    function findDateInCont(cfg, k, c, di = null) {
        const found = [];
        const dates = c.querySelectorAll('input.dw-dateField');

        for (const inp of dates) {
            if (!isProc(inp)) continue;
            const row = inp.closest('tr');
            if (!row) continue;
            const lbl = row.querySelector('.dw-fieldLabel span');
            const txt = lbl && lbl.textContent ? lbl.textContent.trim() : 'Datumsfeld';

            if (cfg.inc) {
                const isIncluded = cfg.inc.some(x => txt.includes(x) || txt.toLowerCase().includes(x.toLowerCase()));
                if (!isIncluded) continue;
            } else if (cfg.exc && cfg.exc.some(x => txt.includes(x) || txt.toLowerCase().includes(x.toLowerCase()))) {
                continue;
            }

            const fid = mkId(inp, txt, k, di);
            const hasExistingButtons = row.nextElementSibling && row.nextElementSibling.classList.contains(`${cfg.pre}-button-row`);
            const alreadyProcessed = S.processed.has(fid);
            const hasButtonsInDOM = document.querySelector(`[data-field-id="${fid}"]`);

            if (hasExistingButtons || alreadyProcessed || hasButtonsInDOM) continue;

            found.push({ inp, txt, row, k, fid });
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

    function handleClick(e, opt, inp, fid) {
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
        btn.addEventListener('click', e => handleClick(e, opt, inp, fid), { passive: true });
        return btn;
    }

    function mkBtnCont(inp, k, fid) {
        const cfg = CFG[k];
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container`;
        cont.setAttribute('data-field-id', fid);

        const frag = document.createDocumentFragment();
        cfg.opts.forEach(opt => {
            const btn = mkBtn(opt, cfg, inp, fid);
            frag.appendChild(btn);
        });
        cont.appendChild(frag);
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
        const fields = findDateInCont(cfg, k, c, di);
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
        if (document.querySelector('style[data-dw-datum-btns]')) return;
        // ÄNDERUNG: Reduzierte Button-Größe, kompakteres Padding, verringerter Abstand zum Datumsfeld
        const css = `.dw-datum-button-row,.dw-datum-past-button-row{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important}[class*="dw-datum"][class*="-button-container"]{display:flex!important;align-items:center!important;gap:3px!important;padding:2px 1px 4px 29px!important;flex-wrap:wrap!important;margin-top:-8px!important}[class*="dw-datum"][class*="-action-button"]{display:inline-flex!important;cursor:pointer!important;border-radius:2px!important;border:1px solid #d1d5db!important;background:#fff!important;color:#374151!important;padding:1px 3px!important;min-height:16px!important;font-size:10px!important;margin:0!important;line-height:1.2!important}.ui-dialog.dw-dialogs:has(.dw-datum-button-row){min-width:500px!important}.ui-dialog.dw-dialogs:has(.dw-datum-button-row) .dw-dialogContent.fields{max-height:400px!important;overflow-y:auto!important}.dw-datum-button-container{max-width:470px!important}`;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-datum-btns', 'true');
        document.head.appendChild(style);
    }

    function mkObs() {
        const obs = new MutationObserver(() => {
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => {
                const di = getDlgId(d);
                const hasBtns = d.querySelectorAll('[class*="dw-datum"][class*="-button-row"]').length > 0;
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

    function main() {
        document.readyState === 'loading' ?
            document.addEventListener('DOMContentLoaded', init, { once: true }) :
            setTimeout(init, 300);
    }

    main();
})();

