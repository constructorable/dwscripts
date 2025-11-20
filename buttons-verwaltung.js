// buttons-verwaltung.js - OPTIMIERT
(function () {
    'use strict';

    const ID = 'dw-ko-buttons-verwaltung', V = '2.0', SK = 'dw-ko-verwaltung-state', D = true;

    const CFG = {
        vwz: {
            txt: 'verwendungszweck 4',
            type: 'includes_lower',
            pre: 'dw-vwz',
            gap: '20px',
            opts: [
                { v: 'Repa ', l: 'Repa ' },
                { v: 'Repa Fenster ', l: 'Repa Fenster ' },
                { v: 'Repa Tür ', l: 'Repa Tür ' },
                { v: 'Repa Sanitär', l: 'Repa Sanitär ' },
                { v: 'Repa Heizung', l: 'Repa Heizung ' },
                { v: 'Repa Elektrik', l: 'Repa Elektrik ' },
                { v: 'Wartung ', l: 'Wartung ' },
                { v: 'Prüfung ', l: 'Prüfung ' },
                { v: 'Energieversorgung ', l: 'Energieversorgung ' },
                { v: 'Strom Leerstand ', l: 'Strom Leerstand ' },
                { v: 'Grundabgaben ', l: 'Grundabgaben ' },
                { v: 'Versicherung ', l: 'Versicherung ' },
                { v: 'Kaminkehrer ', l: 'Kaminkehrer ' },
                { v: 'Sonstige Instandhaltung ', l: 'Sonstige Instandhaltung ' }
            ]
        },

        bauteile: {
            txt: 'bauteil',
            type: 'exact_bauteil_only',
            pre: 'dw-bauteile',
            gap: '8px',
            opts: [
                { v: 'Aufzug (Personen)', l: 'Aufzug' },
                { v: 'Elektrik', l: 'Elektrik' },
                { v: 'Gebäudeteil - Fenster', l: 'Fenster' },
                { v: 'Gebäudeteil - Kanal- & Entwässerungsleitungen', l: 'Kanal' },
                { v: 'Hausanschluss - Telekom (APL)', l: 'Hausanschluss' },
                { v: 'Heizung - Allgemein', l: 'Heizung Allg.' },
                { v: 'Heizung - Gas-Kombi-Therme', l: 'Gas-Kombi' },
                { v: 'Heizung - Gas-Zentral', l: 'Gas-Zentral' },
                { v: 'Messtechnik - Allgemein', l: 'Messtechnik' },
                { v: 'Zähler - Gaszähler', l: 'Gaszähler' },
                { v: 'Zähler - Stromzähler', l: 'Stromzähler' },
                { v: 'Zähler - Wasserzähler (kalt)', l: 'Wasserzähler' }
            ]
        },

        gewerk: {
            txt: 'Thema - Gewerk',
            type: 'includes_lower',
            pre: 'dw-gewerk',
            gap: '8px',
            opts: [
                { v: 'Ablese- und Messtechnik', l: 'Ablese- und Messtechnik' },
                { v: 'Aufzugsanlagen', l: 'Aufzugsanlagen' },
                { v: 'Brandschutz', l: 'Brandschutz' },
                { v: 'Energieversorgung', l: 'Energieversorgung' },
                { v: 'Grundabgaben', l: 'Grundabgaben' },
                { v: 'Hausmeister', l: 'Hausmeister' },
                { v: 'Hausmeister & Winterdienst', l: 'HM + Winter' },
                { v: 'Heizung', l: 'Heizung' },
                { v: 'Kautionseinzahlung', l: 'Kautionseinzahlung' },
                { v: 'Medienversorgung (Telefon, Kabel, Glasfaser, Satellit)', l: 'Medienversorgung' },
                { v: 'Reinigung', l: 'Reinigung' },
                { v: 'Reparatur / Instandhaltung', l: 'Repa / Instandh.' },
                { v: 'Sonstiges', l: 'Sonstiges' },
                { v: 'Versicherung', l: 'Versicherung' }
            ]
        },

        zahlungsart: {
            txt: 'zahlungsart',
            type: 'includes_lower',
            pre: 'dw-zahlungsart',
            gap: '15px',
            opts: [
                { v: 'Überweisung', l: 'Überweisung' },
                { v: 'SEPA-Lastschrift', l: 'SEPA' },
                { v: 'Zahlung bereits erfolgt', l: 'Zahlung bereits erfolgt' },
                { v: 'keine Zahlungsaktion erforderlich', l: 'keine Zahlung erforderlich' },
                { v: 'Zahlung erfolgt durch Eigentümer/Dritte', l: 'Zahlung von Eigentümer/Dritte' },
                { v: 'Dauerauftrag', l: 'Dauerauftrag' }
            ]
        },

        versendet: {
            txt: 'versendet per',
            type: 'includes_lower',
            pre: 'dw-versendet',
            gap: '15px',
            opts: [
                { v: 'E-Mail', l: 'E-Mail' },
                { v: 'Post', l: 'Post' },
                { v: 'Post (Einwurfeinschreiben)', l: 'Post (Einwurfeinschreiben)' },
                { v: 'persönlich übergeben', l: 'persönlich übergeben' },
                { v: 'persönlich in Briefkasten eingeworfen', l: 'persönlich in Briefkasten eingeworfen' },
                { v: 'nicht erforderlich', l: 'nicht erforderlich' },
                { v: 'nicht erforderlich (Entwurf)', l: 'nicht erforderlich (Entwurf)' },
            ]
        },


        buchungskonto: {
            txt: 'Buchungskonto',
            type: 'includes_lower',
            pre: 'dw-buchungskonto',
            gap: '10px',
            opts: [
                { v: '807000 - sonstige Instandhaltungen (z.B. Reparatur, Instandsetzung, Instandhaltung)', l: 'Instandhaltung' },
                { v: '800201 - Heizungswartung (inkl. Messtechnik, Ableseservice, HKV, Heizkostenverteiler usw.)', l: 'Heizungswartung (inkl. Messtechnik, Ableseservice, HKV, Heizkostenverteiler usw.)' },
                { v: '801400 - Hausmeister', l: 'Hausmeister' },
                { v: '800204 - Heizung - Direktkosten', l: 'Heizung Direktkosten' },
                { v: '801101 - Strom/ Gas für Leerstände', l: 'Strom/Gas Leerstände' },
                { v: '800501 - Winterdienst', l: 'Winterdienst' }
                800501 - Winterdienst
            ],
            valueMapping: {
                '807000': '807000', 'instandhaltung': '807000', 'reparatur': '807000', 'instandsetzung': '807000',
                '800201': '800201', 'heizungswartung': '800201', 'wartung': '800201', 'messtechnik': '800201', 'hkv': '800201', 'heizkostenverteiler': '800201',
                '801400': '801400', 'hausmeister': '801400',
                '800204': '800204', 'heizung direktkosten': '800204', 'direktkosten': '800204',
                '801101': '801101', 'strom': '801101', 'gas': '801101', 'leerstände': '801101', 'leerstand': '801101',
                '800501': '800501', 'winterdienst': '800501' 
            }
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

    const log = (m, d) => D && console.log(`[DW-VERW] ${m}`, d || '');

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
        switch (cfg.type) {
            case 'includes_lower': return txt.toLowerCase().includes(cfg.txt.toLowerCase());
            case 'exact_bauteil_only':
                const t = txt.trim();
                return t === 'Bauteil' || t === 'Bauteil:';
            default: return txt.toLowerCase().includes(cfg.txt.toLowerCase());
        }
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
            if (val === match || (cfg.valueMapping?.[match.toLowerCase()] === val)) {
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
        if (document.querySelector('style[data-dw-verw-btns]')) return;
        const css = `[class*="dw-vwz-button-row"],[class*="dw-bauteile-button-row"],[class*="dw-gewerk-button-row"],[class*="dw-zahlungsart-button-row"],[class*="dw-buchungskonto-button-row"],[class*="dw-versendet-button-row"]{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important}[class*="dw-vwz-"][class*="-button-container"],[class*="dw-bauteile-"][class*="-button-container"],[class*="dw-gewerk-"][class*="-button-container"],[class*="dw-zahlungsart-"][class*="-button-container"],[class*="dw-buchungskonto-"][class*="-button-container"],[class*="dw-versendet-"][class*="-button-container"]{display:flex!important;align-items:center!important;gap:3px!important;padding:0px 1px 10px 29px!important;flex-wrap:wrap!important}[class*="dw-vwz-"][class*="-action-button"],[class*="dw-bauteile-"][class*="-action-button"],[class*="dw-gewerk-"][class*="-action-button"],[class*="dw-zahlungsart-"][class*="-action-button"],[class*="dw-buchungskonto-"][class*="-action-button"],[class*="dw-versendet-"][class*="-action-button"]{display:inline-flex!important;cursor:pointer!important;border-radius:22px!important;border:1px solid #d1d5db!important;background:#fff!important;color:#374151!important;padding:3px 8px!important;min-height:15px!important;font-size:11px!important;white-space:nowrap!important}[class*="-action-button"].selected{background:#eff6ff!important;border-color:#3b82f6!important;box-shadow:0 0 0 1px #3b82f6!important}.ui-dialog [class*="-action-button"]{font-size:10px!important;padding:2px 6px!important;min-height:1px!important}.ui-button.main{background-color:#3b75b2!important;padding:4px!important;border-radius:4px!important;color:#fff!important}`;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-verw-btns', 'true');
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



