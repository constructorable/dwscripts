// buttons-datum.js - OPTIMIERT
(function () {
    'use strict';

    const ID = 'dw-ko-buttons-datum', V = '2.0', SK = 'dw-ko-datum-state', D = true;

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
        return r.width > 0 && r.height > 0 && f.offsetParent !== null && f.closest('tr');
    }

    function mkId(inp, txt, k) {
        const nm = inp.name || inp.id || '';
        const tbl = inp.closest('table');
        const pos = tbl ? Array.from(tbl.querySelectorAll('input')).indexOf(inp) : 0;
        return `${k}_${nm}_${txt.replace(/[^a-zA-Z0-9]/g, '')}_${pos}`;
    }

    function hasButtons(row, pre) {
        const next = row.nextElementSibling;
        return next?.classList.contains(`${pre}-button-row`);
    }

    function istInModal(inp) {
        return inp.closest('.ui-dialog') !== null;
    }

    function findDateInCont(cfg, k, c) {
        const found = [];
        const dates = c.querySelectorAll('input.dw-dateField');

        for (const inp of dates) {
            if (!isProc(inp) || S.processed.has(inp)) continue;
            const row = inp.closest('tr');
            if (!row || hasButtons(row, cfg.pre)) continue;
            
            const lbl = row.querySelector('.dw-fieldLabel span');
            const txt = lbl?.textContent?.trim() || 'Datumsfeld';

            if (cfg.inc) {
                const isIncluded = cfg.inc.some(x => txt.includes(x) || txt.toLowerCase().includes(x.toLowerCase()));
                if (!isIncluded) continue;
            } else if (cfg.exc?.some(x => txt.includes(x) || txt.toLowerCase().includes(x.toLowerCase()))) {
                continue;
            }

            const fid = mkId(inp, txt, k);
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

    function handleClick(e, opt, inp) {
        e.preventDefault();
        e.stopPropagation();
        const val = getDate(opt.a);
        setVal(inp, val);
    }

    function mkBtn(opt, cfg, inp, fid, inModal) {
        const btn = document.createElement('button');
        btn.className = `${cfg.pre}-action-button`;
        btn.type = 'button';
        btn.textContent = opt.l;
        btn.title = opt.l;
        btn.setAttribute('data-value', opt.v);
        btn.setAttribute('data-field-id', fid);
        btn.setAttribute('data-action', opt.a || '');
        
        if (inModal) {
            btn.classList.add('in-modal');
        }
        
        btn.addEventListener('click', e => handleClick(e, opt, inp), { passive: true });
        return btn;
    }

    function mkBtnCont(inp, k, fid) {
        const cfg = CFG[k];
        const inModal = istInModal(inp);
        
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container`;
        cont.setAttribute('data-field-id', fid);
        
        if (inModal) {
            cont.classList.add('in-modal');
        }

        const frag = document.createDocumentFragment();
        cfg.opts.forEach(opt => {
            const btn = mkBtn(opt, cfg, inp, fid, inModal);
            frag.appendChild(btn);
        });
        cont.appendChild(frag);
        return cont;
    }

    // ÄNDERUNG: Modal per JavaScript vergrößern
    function vergroessereModal(inp) {
        const modal = inp.closest('.ui-dialog');
        if (!modal) return;
        
        const content = modal.querySelector('.dw-dialogContent.fields');
        if (!content) return;
        
        modal.style.setProperty('max-height', 'none', 'important');
        modal.style.setProperty('height', 'auto', 'important');
        content.style.setProperty('max-height', '600px', 'important');
        content.style.setProperty('height', 'auto', 'important');
        
        log('🔧 Modal vergrößert');
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
            
            if (istInModal(inp)) {
                setTimeout(() => vergroessereModal(inp), 100);
            }
            
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
            if (inject(f, cfg)) added++;
        });
        return added;
    }

    function procStd(e) {
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, e); });
        return total;
    }

    // ÄNDERUNG: Kompaktes CSS ohne redundante Modal-Regeln
    function injectCSS() {
        if (document.querySelector('style[data-dw-datum-btns]')) return;
        const css = `
.dw-datum-button-row,.dw-datum-past-button-row{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important}
[class*="dw-datum"][class*="-button-container"]{display:flex!important;align-items:center!important;gap:6px!important;padding:5px 1px 4px 29px!important;flex-wrap:wrap!important;margin-top:-8px!important}
[class*="dw-datum"][class*="-action-button"]{display:inline-flex!important;cursor:pointer!important;border-radius:2px!important;border:1px solid #d1d5db!important;background:#fff!important;color:#374151!important;padding:4px 8px!important;min-height:12px!important; border-radius:22px !important; font-size:11px!important;margin:0!important;line-height:1.2!important;white-space:nowrap!important}
[class*="dw-datum"][class*="-action-button"]:hover{background:#f3f4f6!important;border-color:#9ca3af!important}
[class*="dw-datum"][class*="-button-container"].in-modal{gap:4px!important;padding:7px 1px 4px 10px!important}
[class*="dw-datum"][class*="-action-button"].in-modal{padding:3px 6px!important;font-size:10px!important;min-height:15px!important;flex:0 0 calc(25% - 4px)!important; border-radius:22px !important; justify-content:center!important}`;

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
    }

    function main() {
        document.readyState === 'loading' ?
            document.addEventListener('DOMContentLoaded', init, { once: true }) :
            setTimeout(init, 300);
    }

    main();
})();
