(function () {
    'use strict';
    const ID = 'dw-ko-buttons', V = '4.3', SK = 'dw-ko-state', D = true;
    const CFG = {
        nebenkosten: { txt: 'für Nebenkosten relevant', type: 'includes', pre: 'dw-nk', gap: '5px', opts: [{ v: 'j', l: 'Ja' }, { v: 'n', l: 'Nein' }], map: { 'j': 'j', 'ja': 'j', 'n': 'n', 'nein': 'n' } },
        wirtschaftsjahr: { txt: 'wirtschaftsjahr', type: 'includes_lower', pre: 'dw-wj', gap: '20px', opts: [{ v: '2025', l: '2025' }, { v: '2024 / 2025', l: '2024 / 2025' }, { v: '2024', l: '2024' }, { v: '2025 / 2026', l: '2025 / 2026' }] },
        datumsfelder: { txt: '', type: 'date_field', pre: 'dw-datum', gap: '8px', wrap: true, isDate: true, exc: ['Eingangsdatum', 'Rechnungsdatum', 'Fälligkeitsdatum', 'Erstellungsdatum', 'Ausgangsdatum', 'Ausführungsdatum (Bericht)', 'Abgelegt am', 'nächster Ablesetermin'], opts: [{ v: 'heute', l: 'Heute', a: 'setToday' }, { v: 'morgen', l: 'Morgen', a: 'setTomorrow' }, { v: 'woche', l: '+1 Woche', a: 'setNextWeek' }, { v: '2wochen', l: '+2 Wochen', a: 'setTwoWeeks' }, { v: '3wochen', l: '+3 Wochen', a: 'setThreeWeeks' }, { v: '4wochen', l: '+4 Wochen', a: 'setFourWeeks' }, { v: 'jahresanfang', l: '01.01', a: 'setYearStart' }, { v: 'jahresende', l: '31.12', a: 'setYearEnd' }] },
        skonto: { txt: 'skonto in', type: 'includes_lower', pre: 'dw-sk', gap: '20px', opts: [{ v: '0', l: '0' }, { v: '2', l: '2' }, { v: '3', l: '3' }] },
        zuweisen: { txt: 'zuweisen', type: 'includes_lower', pre: 'dw-zuw', gap: '20px', opts: [{ v: 'oa', l: 'oa' }, { v: 'ca', l: 'ca' }, { v: 'ms', l: 'ms' }, { v: 'sm', l: 'sm' }, { v: 'da', l: 'da' }, { v: 'hp', l: 'hp' }, { v: 'ml', l: 'ml' }, { v: 'cz', l: 'cz' }] },
        objbestaet: { txt: 'objekt best', type: 'includes_lower', pre: 'dw-ob', gap: '20px', opts: [{ v: 'j', l: 'j' }] },
        rebestaet: { txt: 'ungssteller 🧑', type: 'includes_lower', pre: 'dw-rb', gap: '20px', opts: [{ v: 'j', l: 'j' }] },
        renrbestaet: { txt: 'RE-Nr.', type: 'includes_lower', pre: 'dw-rnrb', gap: '20px', opts: [{ v: 'j', l: 'j' }] },
        restbestaet: { txt: 'RE-Steller', type: 'includes_lower', pre: 'dw-rst', gap: '20px', opts: [{ v: 'j', l: 'j' }] },
        vnnr: { txt: 'vn-nummer', type: 'includes_lower', pre: 'dw-vnnr', gap: '20px', opts: [{ v: '0', l: '0' }] },
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
        leistungszeitraumbis: { txt: 'Rechnungsnummer *', type: 'exact', pre: 'dw-lzb', gap: '12px', isNav: true, btnCfg: { l: '→ Nächstes leeres Pflichtfeld', a: 'scrollToNext' } },
        bauteile: {
            txt: 'bauteil', type: 'exact_bauteil_only', pre: 'dw-bauteile', gap: '8px',
            opts: [{ v: 'Aufzug (Personen)', l: 'Aufzug' }, { v: 'Gebäudeteil - Fenster', l: 'Fenster' }, { v: 'Gebäudeteil - Kanal- & Entwässerungsleitungen', l: 'Kanal' }, { v: 'Hausanschluss - Telekom (APL)', l: 'Hausanschluss' }, { v: 'Heizung - Allgemein', l: 'Heizung Allg.' }, { v: 'Heizung - Gas-Kombi-Therme', l: 'Gas-Kombi' }, { v: 'Heizung - Gas-Zentral', l: 'Gas-Zentral' }, { v: 'Messtechnik - Allgemein', l: 'Messtechnik' }, { v: 'Zähler - Gaszähler', l: 'Gaszähler' }, { v: 'Zähler - Stromzähler', l: 'Stromzähler' }, { v: 'Zähler - Wasserzähler (kalt)', l: 'Wasserzähler' }]
        },
        gewerk: {
            txt: 'Thema - Gewerk', type: 'includes_lower', pre: 'dw-gewerk', gap: '8px',
            opts: [{ v: 'Ablese- und Messtechnik', l: 'Ablese- und Messtechnik' }, { v: 'Aufzugsanlagen', l: 'Aufzugsanlagen' }, { v: 'Brandschutz', l: 'Brandschutz' }, { v: 'Energieversorgung', l: 'Energieversorgung' }, { v: 'Grundabgaben', l: 'Grundabgaben' }, { v: 'Hausmeister', l: 'Hausmeister' }, { v: 'Hausmeister & Winterdienst', l: 'HM + Winter' }, { v: 'Heizung', l: 'Heizung' }, { v: 'Kautionseinzahlung', l: 'Kautionseinzahlung' }, { v: 'Medienversorgung (Telefon, Kabel, Glasfaser, Satellit)', l: 'Medienversorgung' }, { v: 'Reinigung', l: 'Reinigung' }, { v: 'Reparatur / Instandhaltung', l: 'Repa / Instandh.' }, { v: 'Sonstiges', l: 'Sonstiges' }, { v: 'Versicherung', l: 'Versicherung' }]
        },
        zahlungsart: {
            txt: 'zahlungsart', type: 'includes_lower', pre: 'dw-zahlungsart', gap: '15px',
            opts: [{ v: 'Überweisung', l: 'Überweisung' }, { v: 'SEPA-Lastschrift', l: 'SEPA' }, { v: 'Zahlung bereits erfolgt', l: 'Zahlung bereits erfolgt' }, { v: 'keine Zahlungsaktion erforderlich', l: 'keine Zahlung erforderlich' }, { v: 'Zahlung erfolgt durch Eigentümer/Dritte', l: 'Zahlung von Eigentümer/Dritte' }, { v: 'Dauerauftrag', l: 'Dauerauftrag' }]
        },
        buchungskonto: {
            txt: 'Buchungskonto', type: 'includes_lower', pre: 'dw-buchungskonto', gap: '10px',
            opts: [
                { v: '807000 - sonstige Instandhaltungen (z.B. Reparatur, Instandsetzung, Instandhaltung)', l: 'Instandhaltung' },
                { v: '800201 - Heizungswartung (inkl. Messtechnik, Ableseservice, HKV, Heizkostenverteiler usw.)', l: 'Heizungswartung (inkl. Messtechnik, Ableseservice, HKV, Heizkostenverteiler usw.)' },
                { v: '801400 - Hausmeister', l: 'Hausmeister' },
                { v: '800204 - Heizung - Direktkosten', l: 'Heizung Direktkosten' },
                { v: '801101 - Strom/ Gas für Leerstände', l: 'Strom/Gas Leerstände' }
            ],
            valueMapping: {
                '807000': '807000', 'instandhaltung': '807000', 'reparatur': '807000', 'instandsetzung': '807000', '800201': '800201', 'heizungswartung': '800201', 'wartung': '800201', 'messtechnik': '800201', 'hkv': '800201', 'heizkostenverteiler': '800201', '801400': '801400', 'hausmeister': '801400', '800204': '800204', 'heizung direktkosten': '800204', 'direktkosten': '800204', '801101': '801101', 'strom': '801101', 'gas': '801101', 'leerstände': '801101', 'leerstand': '801101'
            }
        }
    };
    let S = { init: false, reg: new Map(), obs: null, timeouts: new Set(), dialogs: new Set(), subs: [], last: 0, processed: new Set() }; 
    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };
    const log = (m, d) => D && console.log(`[DW-KO] ${m}`, d || '');
    function cleanup() {
        if (window[ID] && window[ID].s) {
            window[ID].s.obs && window[ID].s.obs.disconnect();
            window[ID].s.timeouts && window[ID].s.timeouts.forEach(clearTimeout);
            window[ID].s.subs && window[ID].s.subs.forEach(s => { try { s.dispose() } catch (e) { } });
        }
    }
    function waitKO(cb, i = 0) {
        typeof ko !== 'undefined' && ko.version ? cb() : i < 50 ? setTimeout(() => waitKO(cb, i + 1), 100) : cb();
    }
    function isKOTpl(e) {
        return e && (e.hasAttribute && e.hasAttribute('data-bind') || e.querySelector && e.querySelector('[data-bind]') || e.closest && e.closest('[data-bind]'));
    }
    function waitKOBind(e, cb, i = 0) {
        if (i >= 30) { cb(); return; }
        const inp = e.querySelectorAll('input.dw-dateField, input.dw-textField');
        const hasBind = Array.from(inp).some(f => f.hasAttribute('data-bind'));
        hasBind ? setTimeout(() => waitKOBind(e, cb, i + 1), 150) : cb();
    }
    function interceptKO() {
        if (typeof ko === 'undefined') return;
        if (ko.renderTemplate && !ko.renderTemplate._dw) {
            const orig = ko.renderTemplate;
            ko.renderTemplate = function () {
                const res = orig.apply(this, arguments);
                setTimeout(() => {
                    const tgt = Array.isArray(arguments[3]) ? arguments[3][0] : arguments[3];
                    tgt && tgt.nodeType === 1 && waitKOBind(tgt, () => procAfterKO(tgt));
                }, 200);
                return res;
            };
            ko.renderTemplate._dw = true;
        }
        if (ko.applyBindings && !ko.applyBindings._dw) {
            const orig = ko.applyBindings;
            ko.applyBindings = function () {
                const res = orig.apply(this, arguments);
                setTimeout(() => {
                    const tgt = arguments[1] || document.body;
                    waitKOBind(tgt, () => procAfterKO(tgt));
                }, 300);
                return res;
            };
            ko.applyBindings._dw = true;
        }
    }
    function procAfterKO(e) {
        const dlg = e.closest && e.closest('.ui-dialog') || e.querySelector && e.querySelector('.ui-dialog') || (e.classList && e.classList.contains('ui-dialog') ? e : null);
        dlg ? setTimeout(() => addToDlg(dlg, getDlgId(dlg)), 100) : setTimeout(() => procStd(e), 100);
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
    function addToDlg(d, di) {
        if (S.dialogs.has(di)) return;
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, d, di); });
        total > 0 && (S.dialogs.add(di), saveState());
        return total;
    }
    function procStd(e) {
        let total = 0;
        Object.keys(CFG).forEach(k => { total += procCfgInEl(k, e); });
        total > 0 && saveState();
        return total;
    }
    function procCfgInEl(k, c, di = null) {
        const cfg = CFG[k];
        const fields = findInCont(k, c, di);
        if (!fields.length) return 0;
        let added = 0;
        fields.forEach(f => {
            try {

                if (!S.processed.has(f.fid)) {
                    requestAnimationFrame(() => {
                        if (injectWithDelay(f, cfg, di)) {
                            S.processed.add(f.fid); 
                            added++;
                        }
                    });
                }
            } catch (e) { log(`Err inject ${f.fid}:`, e); }
        });
        return added;
    }
    function injectWithDelay(f, cfg, di) {
        const delays = [50, 150, 300, 600];
        function attempt(i = 0) {
            if (i >= delays.length) return false;
            setTimeout(() => {
                if (isValid(f.inp)) {
                    const success = inject(f, cfg, di);
                    if (success) {
                        log(`✅ Button erfolgreich injiziert: ${f.fid}`);
                    } else {
                        attempt(i + 1);
                    }
                } else {
                    log('Field invalid');
                }
            }, delays[i]);
        }
        attempt();
        return true;
    }
    function isValid(inp) {
        return inp && inp.isConnected && inp.offsetParent !== null && inp.closest('tr');
    }

    function findInCont(k, c, di = null) {
        const cfg = CFG[k];
        const found = [];
        try {
            if (cfg.isDate) return findDateInCont(cfg, k, c, di);
            const labels = c.querySelectorAll('.dw-fieldLabel span');
            for (const lbl of labels) {
                if (!lbl.textContent) continue;
                const txt = lbl.textContent.trim();
                if (!matches(txt, cfg)) continue;

                if (cfg.isNav && cfg.txt === 'Leistungszeitraum bis') {

                    const hasRechnungsnummer = Array.from(labels).some(label =>
                        label.textContent.trim() === 'Fälligkeitsdatum *'
                    );
                    if (!hasRechnungsnummer) {
                        log('⏭️ Rechnungsnummer nicht gefunden - Navigation-Button übersprungen');
                        continue;
                    }
                }
                const row = lbl.closest('tr');
                if (!row) continue;
                const inp = findInp(row, cfg);
                if (!inp || !isProc(inp)) continue;
                const fid = mkId(inp, txt, k, di);

                const hasExistingButtons = row.nextElementSibling &&
                    row.nextElementSibling.classList.contains(`${cfg.pre}-button-row`);
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
    function findDateInCont(cfg, k, c, di = null) {
        const found = [];
        const dates = c.querySelectorAll('input.dw-dateField');
        for (const inp of dates) {
            if (!isProc(inp)) continue;
            const row = inp.closest('tr');
            if (!row) continue;
            const lbl = row.querySelector('.dw-fieldLabel span');
            const txt = lbl && lbl.textContent ? lbl.textContent.trim() : 'Datumsfeld';
            if (cfg.exc && cfg.exc.some(x => txt.includes(x) || txt.toLowerCase().includes(x.toLowerCase()))) continue;
            const fid = mkId(inp, txt, k, di);

            const hasExistingButtons = row.nextElementSibling &&
                row.nextElementSibling.classList.contains(`${cfg.pre}-button-row`);
            const alreadyProcessed = S.processed.has(fid);
            const hasButtonsInDOM = document.querySelector(`[data-field-id="${fid}"]`);

            if (hasExistingButtons || alreadyProcessed || hasButtonsInDOM) {
                continue;
            }

            found.push({ inp, txt, row, k, fid });
        }
        return found;
    }
    function inject(f, cfg, di = null) {
        const { inp, row, k, fid } = f;

        if (row.nextElementSibling && row.nextElementSibling.classList.contains(`${cfg.pre}-button-row`)) {
            log(`⚠️ Button-Reihe bereits vorhanden für: ${fid}`);
            return false;
        }
        if (document.querySelector(`[data-field-id="${fid}"]`)) {
            log(`⚠️ Button mit Field-ID bereits im DOM: ${fid}`);
            return false;
        }

        const br = document.createElement('tr');
        br.className = `${cfg.pre}-button-row dw-ko-btn-row`;
        br.setAttribute('data-field-id', fid);
        br.setAttribute('data-config-key', k);
        br.setAttribute('data-ko-injected', 'true');
        br.setAttribute('data-injection-time', Date.now()); 
        di && br.setAttribute('data-dialog-id', di);
        br.style.cssText = 'position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important;background:inherit!important;';
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
            log(`✅ Button-Reihe erfolgreich eingefügt: ${fid}`);
            return true;
        } catch (e) {
            log(`❌ DOM inject fail ${fid}:`, e);
            return false;
        }
    }
    function mkBtnCont(inp, k, fid) {
        const cfg = CFG[k];
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container`;
        cont.setAttribute('data-field-id', fid);

        if (cfg.isNav) {
            const navBtn = document.createElement('button');
            navBtn.className = `${cfg.pre}-nav-button`;
            navBtn.type = 'button';
            navBtn.textContent = cfg.btnCfg.l;
            navBtn.title = 'Springt zum nächsten unvollständigen Pflichtfeld';
            navBtn.addEventListener('click', scrollToNextInvalid, { passive: true });
            cont.appendChild(navBtn);
            return cont;
        }

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
    function mkBtn(opt, cfg, inp, fid) {
        const btn = document.createElement('button');
        btn.className = `${cfg.pre}-action-button`;
        btn.type = 'button';
        btn.textContent = opt.l;
        btn.title = opt.l;
        btn.setAttribute('data-value', opt.v);
        btn.setAttribute('data-field-id', fid);
        btn.setAttribute('data-action', opt.a || '');
        btn.addEventListener('click', e => handleClick(e, opt, cfg, inp, fid), { passive: true });
        return btn;
    }
    function handleClick(e, opt, cfg, inp, fid) {
        e.preventDefault();
        e.stopPropagation();
        const val = cfg.isDate && opt.a ? getDate(opt.a) : opt.v;
        if (!cfg.isDate) {
            updSel(e.target, fid);
            S.reg.set(fid, { sel: val, ts: Date.now() });
            saveState();
        }
        setVal(inp, val, cfg);
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
            console.log('gefunden');
        }
    }

    function mkId(inp, txt, k, di = null) {
        const nm = inp.name || inp.id || '';
        const tbl = inp.closest('table');
        const pos = tbl ? Array.from(tbl.querySelectorAll('input')).indexOf(inp) : 0;
        const base = `${k}_${nm}_${txt.replace(/[^a-zA-Z0-9]/g, '')}_${pos}`;
        return di ? `${di}_${base}` : base;
    }
    function isProc(f) {
        if (!f) return false;
        const r = f.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && f.offsetParent !== null && f.closest('tr');
    }
    function matches(txt, cfg) {
        if (!cfg.txt) return false;
        switch (cfg.type) {
            case 'includes': return txt.includes(cfg.txt);
            case 'includes_lower': return txt.toLowerCase().includes(cfg.txt.toLowerCase());
            case 'exact': return txt.trim() === cfg.txt;
            case 'exact_bauteil_only': const t = txt.trim(); return t === 'Bauteil' || t === 'Bauteil:';
            default: return txt.includes(cfg.txt);
        }
    }
    function findInp(row, cfg) {
        let inp = row.querySelector('input.dw-textField, input.dw-numericField, input[type="text"], input[type="date"], input.dw-dateField');
        if (!inp && cfg && cfg.isNav) {
            inp = row.querySelector('input.dw-dateField');
        }
        return inp;
    }
    function updSel(btn, fid) {
        const cont = btn.closest('[class*="-button-container"]');
        if (!cont) return;
        cont.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }
    function setVal(inp, val, cfg) {
        inp.value = val;
        cfg.isDate && typeof $ !== 'undefined' && $(inp).data('datepicker') && $(inp).datepicker('setDate', val);
        requestAnimationFrame(() => {
            inp.focus();
            ['input', 'change', 'blur'].forEach(t => inp.dispatchEvent(new Event(t, { bubbles: true, cancelable: true })));
        });
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
            setYearEnd: new Date(today.getFullYear(), 11, 31)
        };
        const res = getFmt(dates[a] || today);
        dateCache.set(ck, res);
        return res;
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
    function restoreState(inp, cfg, btns, fid) {
        if (cfg.isDate) return;
        const cur = inp.value.trim();
        const saved = S.reg.get(fid);
        const match = saved && saved.sel ? saved.sel : cur;
        if (!match) return;
        btns.forEach(btn => {
            const val = btn.getAttribute('data-value');
            if (val === match || (cfg.map && cfg.map[match.toLowerCase()] === val)) {
                btn.classList.add('selected');
            }
        });
    }

function injectCSS() {
    if (document.querySelector('style[data-dw-ko-btns]')) return;
    const css = `.dw-ko-btn-row{position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important;background:inherit!important;z-index:10!important}[class*="-button-container"]{display:flex!important;align-items:center!important;justify-content:flex-start!important;padding:4px 1px 8px 29px!important;gap:6px!important;flex-wrap:wrap!important}[class*="-action-button"]{display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;border-radius:3px!important;border:1px solid #d1d5db!important;background:#fff!important;color:#374151!important;padding:3px 8px!important;min-height:20px!important;font-size:11px!important;white-space:nowrap!important}[class*="-action-button"].selected{background:#eff6ff!important;border-color:#3b82f6!important;box-shadow:0 0 0 1px #3b82f6!important}[class*="-nav-button"]{display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;border-radius:4px!important;border:1px solid #3b82f6!important;background:#dbeafe!important;color:#1e40af!important;padding:1px 12px!important;min-height:24px!important;font-size:12px!important;font-weight:500!important;white-space:nowrap!important}.ui-dialog .dw-ko-btn-row{display:table-row!important;opacity:1!important;visibility:visible!important}.ui-dialog [class*="-action-button"]{font-size:10px!important;padding:2px 6px!important;min-height:18px!important}.ui-dialog [class*="-nav-button"]{font-size:11px!important;padding:4px 10px!important;min-height:22px!important}.dw-btn-fade{animation:dwFade .3s ease-out}@keyframes dwFade{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}

    .ui-dialog.dw-dialogs:has(.dw-datum-button-row) {
        min-width: 500px !important;
        width: 500px !important;
    }
    .ui-dialog.dw-dialogs:has(.dw-datum-button-row) .dw-dialogContent.fields {
        min-height: 200px !important;
        max-height: 400px !important;
        height: auto !important;
        overflow-y: auto !important;
    }
    .ui-dialog.dw-dialogs:has(.dw-datum-button-row) .ui-dialog-content {
        min-height: 200px !important;
        height: auto !important;
        overflow: visible !important;
    }

    .dw-datum-button-container {
        max-width: 470px !important;
        flex-wrap: wrap !important;
        gap: 4px !important;
        padding: 0px 1px 8px 29px !important;
        margin-top:-5px !important;
    }
    .dw-datum-action-button {
        font-size: 10px !important;
        padding: 2px 4px !important;
        min-height: 18px !important;
        margin: 1px !important;
        white-space: nowrap !important;
    }`;

    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-dw-ko-btns', 'true');
    document.head.appendChild(style);
}
    function mkObs() {
        let timeout = null;
        const proc = () => {
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => {
                const di = getDlgId(d);
                const hasBtns = d.querySelectorAll('.dw-ko-btn-row').length > 0;
                !hasBtns && waitKOBind(d, () => addToDlg(d, di));
            });
            procStd(document.body);
        };
        const debounced = () => {
            timeout && clearTimeout(timeout);
            timeout = setTimeout(proc, 600);
            S.timeouts.add(timeout);
        };
        const obs = new MutationObserver(muts => {
            let should = false, koDetected = false;
            for (const mut of muts) {
                if (mut.type === 'childList') {
                    for (const node of mut.addedNodes) {
                        if (node.nodeType === 1) {
                            if (isKOTpl(node) || (node.classList && node.classList.contains('dw-dialogContent')) || (node.classList && node.classList.contains('ui-dialog-content')) || (node.querySelector && node.querySelector('[data-bind]')) || (node.querySelector && node.querySelector('.dw-dateField'))) {
                                should = true;
                                koDetected = true;
                                break;
                            }
                        }
                    }
                    for (const node of mut.removedNodes) {
                        if (node.nodeType === 1 && ((node.classList && node.classList.contains('dw-ko-btn-row')) || (node.querySelector && node.querySelector('.dw-ko-btn-row')))) {
                            should = true;

                            const fieldId = node.getAttribute && node.getAttribute('data-field-id');
                            if (fieldId) {
                                S.processed.delete(fieldId);
                                log(`🗑️ Entfernter Button aus processed entfernt: ${fieldId}`);
                            }
                            break;
                        }
                    }
                }
                if (should) break;
            }
            if (should) {
                const delay = koDetected ? 800 : 400;
                timeout && clearTimeout(timeout);
                timeout = setTimeout(proc, delay);
                S.timeouts.add(timeout);
            }
        });
        obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });
        return obs;
    }
    function startChecks() {
        const check = setInterval(() => {
            if (!S.init) return;
            const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dlgs.forEach(d => {
                const di = getDlgId(d);
                const btns = d.querySelectorAll('.dw-ko-btn-row');
                if (!btns.length) {
                    S.dialogs.delete(di);
                    waitKOBind(d, () => addToDlg(d, di));
                }
            });
        }, 5000);
        S.timeouts.add(check);

        const backup = setInterval(() => {
            if (!S.init) return;

            const allButtonsInDOM = document.querySelectorAll('[data-field-id]');
            const activeFieldIds = new Set(Array.from(allButtonsInDOM).map(btn => btn.getAttribute('data-field-id')));

            S.processed.forEach(fid => {
                if (!activeFieldIds.has(fid)) {
                    S.processed.delete(fid);
                    log(`🧹 Cleanup: Entferne verwaiste processed ID: ${fid}`);
                }
            });

            Object.keys(CFG).forEach(k => {
                const fields = findWithoutBtns(k);
                if (fields.length > 0 && fields.length < 5) { 
                    log(`🔧 Backup: ${fields.length} fehlende Buttons für ${k}`);
                    fields.forEach(f => {
                        if (!S.processed.has(f.di)) {
                            requestAnimationFrame(() => injectWithDelay(f, CFG[k], f.di));
                        }
                    });
                }
            });
        }, 30000); 
        S.timeouts.add(backup);
    }
    function findWithoutBtns(k) {
        const cfg = CFG[k];
        const fields = [];
        const conts = [document.body, ...document.querySelectorAll('.ui-dialog.dw-dialogs')];
        conts.forEach(c => {
            if (c.style && c.style.display === 'none') return;
            const di = c.classList && c.classList.contains('ui-dialog') ? getDlgId(c) : null;
            const fs = findInCont(k, c, di);
            fs.forEach(f => {

                const hasBtnRow = f.row.nextElementSibling &&
                    f.row.nextElementSibling.classList.contains(`${cfg.pre}-button-row`);
                const hasInDOM = document.querySelector(`[data-field-id="${f.fid}"]`);
                const inProcessed = S.processed.has(f.fid);

                if (!hasBtnRow && !hasInDOM && !inProcessed) {
                    fields.push({ ...f, di });
                }
            });
        });
        return fields;
    }
    function setupEvents() {
        document.addEventListener('click', e => {
            const t = e.target;
            if (t && ((t.classList && t.classList.contains('ui-button')) || t.closest('.ui-button') || (t.getAttribute && t.getAttribute('data-bind') && t.getAttribute('data-bind').includes('click')) || t.closest('[data-bind*="click"]'))) {
                setTimeout(() => {
                    const newDlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                    newDlgs.forEach(d => {
                        const di = getDlgId(d);
                        const hasBtns = d.querySelectorAll('.dw-ko-btn-row').length > 0;
                        !hasBtns && !S.dialogs.has(di) && waitKOBind(d, () => addToDlg(d, di));
                    });
                }, 1000);
            }
        }, { passive: true });
        window.addEventListener('focus', () => {
            S.init && setTimeout(() => {
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => {
                    const di = getDlgId(d);
                    const hasBtns = d.querySelectorAll('.dw-ko-btn-row').length > 0;
                    !hasBtns && (S.dialogs.delete(di), waitKOBind(d, () => addToDlg(d, di)));
                });
            }, 300);
        }, { passive: true });
        document.addEventListener('visibilitychange', () => {
            !document.hidden && S.init && setTimeout(() => {
                S.dialogs.clear();
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => {
                    const di = getDlgId(d);
                    waitKOBind(d, () => addToDlg(d, di));
                });
            }, 500);
        }, { passive: true });
        window.addEventListener('beforeunload', () => {
            saveState();
            S.timeouts.forEach(clearTimeout);
        }, { passive: true });
    }
    function init() {
        try {
            injectCSS();
            loadState();
            waitKO(() => {
                interceptKO();
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
            setupEvents();
            startChecks();
            S.init = true;
        } catch (e) { log('Init err:', e); }
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
            ko: typeof ko !== 'undefined',
            kov: typeof ko !== 'undefined' ? ko.version : 'N/A',
            btns: document.querySelectorAll('.dw-ko-btn-row').length,
            dlgs: document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])').length,
            proc: S.dialogs.size,
            reg: S.reg.size,
            processed: S.processed.size 
        }),
        debug: () => {

            const allButtons = document.querySelectorAll('.dw-ko-btn-row');
            const duplicates = [];
            const fieldIds = [];

            allButtons.forEach(btn => {
                const fid = btn.getAttribute('data-field-id');
                if (fieldIds.includes(fid)) {
                    duplicates.push(fid);
                } else {
                    fieldIds.push(fid);
                }
            });

            console.log('Debug Info:', {
                state: S,
                btns: allButtons,
                duplicates: duplicates,
                dlgs: document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])'),
                ko: document.querySelectorAll('[data-bind]')
            });

            if (duplicates.length > 0) {
                console.warn('Duplikate gefunden:', duplicates);
            }
        },
        force: (sel = null) => {
            const tgts = sel ? document.querySelectorAll(sel) : document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            let ref = 0;
            tgts.forEach(d => {
                const di = getDlgId(d);
                S.dialogs.delete(di);
                waitKOBind(d, () => { ref += addToDlg(d, di); });
            });
            return ref;
        },
        cleanup: () => {
            S.obs && S.obs.disconnect();
            S.timeouts.forEach(clearTimeout);
            S.subs.forEach(s => { try { s.dispose() } catch (e) { } });
            sessionStorage.removeItem(SK);
            S.processed.clear(); 
        }
    };
    function main() {
        setupEvents();
        document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init, { once: true }) : setTimeout(init, 300);
        setTimeout(() => !S.init && init(), 2000);
        setTimeout(() => {
            if (S.init) {
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => {
                    const hasBtns = d.querySelectorAll('.dw-ko-btn-row').length > 0;
                    if (!hasBtns) {
                        const di = getDlgId(d);
                        S.dialogs.delete(di);
                        waitKOBind(d, () => addToDlg(d, di));
                    }
                });
            }
        }, 5000);
    }
    main();

})();
