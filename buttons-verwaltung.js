// buttons-verwaltung.js
// ÄNDERUNG: Pre-Rendering + Performance-Optimierung + Dialog-Höhenanpassung
// Separate Datei für Verwaltungs-Schnellauswahl-Buttons (Verwendungszweck, Bauteile, Gewerk, Zahlungsart, Buchungskonto)

(function () {
    'use strict';
    
    const ID = 'dw-ko-buttons-verwaltung', V = '1.1', SK = 'dw-ko-verwaltung-state', D = true;
    
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
                { v: '801101 - Strom/ Gas für Leerstände', l: 'Strom/Gas Leerstände' }
            ],
            valueMapping: {
                '807000': '807000', 'instandhaltung': '807000', 'reparatur': '807000', 'instandsetzung': '807000',
                '800201': '800201', 'heizungswartung': '800201', 'wartung': '800201', 'messtechnik': '800201', 'hkv': '800201', 'heizkostenverteiler': '800201',
                '801400': '801400', 'hausmeister': '801400',
                '800204': '800204', 'heizung direktkosten': '800204', 'direktkosten': '800204',
                '801101': '801101', 'strom': '801101', 'gas': '801101', 'leerstände': '801101', 'leerstand': '801101'
            }
        }
    };

    let S = {
        init: false,
        reg: new Map(),
        obs: null,
        timeouts: new Set(),
        dialogs: new Set(),
        processed: new Set(),
        preRenderedButtons: new Map()
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-VERW] ${m}`, d || '');

    function cleanup() {
        if (window[ID] && window[ID].s) {
            window[ID].s.obs && window[ID].s.obs.disconnect();
            window[ID].s.timeouts && window[ID].s.timeouts.forEach(clearTimeout);
            window[ID].s.preRenderedButtons && window[ID].s.preRenderedButtons.clear();
        }
    }

    // NEU: Pre-Rendering von Button-Templates
    function preRenderButtons() {
        Object.keys(CFG).forEach(k => {
            const cfg = CFG[k];
            const template = document.createDocumentFragment();
            
            cfg.opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = `${cfg.pre}-action-button`;
                btn.type = 'button';
                btn.textContent = opt.l;
                btn.title = opt.l;
                btn.setAttribute('data-value', opt.v);
                template.appendChild(btn);
            });
            
            S.preRenderedButtons.set(k, template);
        });
        log('✅ Button-Templates vorgerendert');
    }

    // NEU: Dialog-Höhe anpassen
    function adjustDialogHeight(dialog) {
        if (!dialog) return;
        
        try {
            const content = dialog.querySelector('.ui-dialog-content');
            if (content) {
                content.style.maxHeight = 'none';
                content.style.height = 'auto';
                content.style.overflow = 'visible';
            }
            
            const dialogContent = dialog.querySelector('.dw-dialogContent.fields');
            if (dialogContent) {
                dialogContent.style.maxHeight = 'none';
                dialogContent.style.height = 'auto';
                dialogContent.style.overflowY = 'visible';
                dialogContent.style.minHeight = '200px';
            }
            
            const scrollWrapper = dialog.querySelector('.scroll-wrapper');
            if (scrollWrapper) {
                scrollWrapper.style.overflowY = 'visible';
                scrollWrapper.style.maxHeight = 'none';
                scrollWrapper.style.height = 'auto';
            }
            
            dialog.style.height = 'auto';
            
            if (typeof $ !== 'undefined' && $(dialog).data('ui-dialog')) {
                setTimeout(() => {
                    try {
                        const $dialog = $(dialog);
                        const dialogInstance = $dialog.data('ui-dialog');
                        if (dialogInstance) {
                            dialogInstance.option('position', dialogInstance.option('position'));
                        }
                    } catch (e) { }
                }, 50);
            }
        } catch (e) { }
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

    // ÄNDERUNG: Optimierte KO-Warte-Funktion
    function waitKO(cb, i = 0) {
        if (typeof ko !== 'undefined' && ko.version) {
            cb();
        } else if (i < 100) {
            setTimeout(() => waitKO(cb, i + 1), 50);
        } else {
            cb();
        }
    }

    // ÄNDERUNG: Schnellere KO-Bind-Prüfung
    function waitKOBind(e, cb, i = 0) {
        if (i >= 10) { 
            cb(); 
            return; 
        }
        const inp = e.querySelectorAll('input.dw-textField, input.dw-numericField');
        const hasBind = Array.from(inp).some(f => f.hasAttribute('data-bind'));
        hasBind ? setTimeout(() => waitKOBind(e, cb, i + 1), 50) : cb();
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

                if (hasExistingButtons || alreadyProcessed || hasButtonsInDOM) continue;

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

    function restoreState(inp, cfg, btns, fid) {
        const cur = inp.value.trim();
        const saved = S.reg.get(fid);
        const match = saved && saved.sel ? saved.sel : cur;
        if (!match) return;
        
        btns.forEach(btn => {
            const val = btn.getAttribute('data-value');
            if (val === match || (cfg.valueMapping && cfg.valueMapping[match.toLowerCase()] === val)) {
                btn.classList.add('selected');
            }
        });
    }

    // ÄNDERUNG: Verwende vorgerenderte Buttons
    function mkBtnCont(inp, k, fid) {
        const cfg = CFG[k];
        const cont = document.createElement('div');
        cont.className = `${cfg.pre}-button-container`;
        cont.setAttribute('data-field-id', fid);

        const template = S.preRenderedButtons.get(k);
        if (template) {
            const clone = template.cloneNode(true);
            const buttons = clone.querySelectorAll('button');
            const btnArray = [];
            
            buttons.forEach((btn, idx) => {
                const opt = cfg.opts[idx];
                btn.setAttribute('data-field-id', fid);
                btn.addEventListener('click', e => handleClick(e, opt, inp, fid), { passive: true });
                btnArray.push(btn);
            });
            
            cont.appendChild(clone);
            restoreState(inp, cfg, btnArray, fid);
        }
        
        return cont;
    }

    function inject(f, cfg, di = null) {
        const { inp, row, k, fid } = f;

        if (row.nextElementSibling && row.nextElementSibling.classList.contains(`${cfg.pre}-button-row`)) {
            return false;
        }
        if (document.querySelector(`[data-field-id="${fid}"]`)) {
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
            requestAnimationFrame(() => {
                br.style.display = 'table-row';
                br.style.opacity = '1';
                br.style.visibility = 'visible';
                
                const dialog = br.closest('.ui-dialog.dw-dialogs');
                if (dialog) {
                    setTimeout(() => adjustDialogHeight(dialog), 50);
                }
            });
            log(`✅ Buttons eingefügt: ${fid}`);
            return true;
        } catch (e) {
            log(`❌ Inject fail: ${fid}`, e);
            return false;
        }
    }

    // ÄNDERUNG: Schnellere Injection
    function injectWithDelay(f, cfg, di) {
        const delays = [0, 20, 50];
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
                if (injectWithDelay(f, cfg, di)) {
                    S.processed.add(f.fid);
                    added++;
                }
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
        dlg ? setTimeout(() => addToDlg(dlg, getDlgId(dlg)), 20) : setTimeout(() => procStd(e), 20);
    }

    // ÄNDERUNG: CSS erweitert für Dialog-Höhenanpassung
    function injectCSS() {
        if (document.querySelector('style[data-dw-verw-btns]')) return;
        const css = `
            [class*="dw-vwz-button-row"],[class*="dw-bauteile-button-row"],[class*="dw-gewerk-button-row"],[class*="dw-zahlungsart-button-row"],[class*="dw-buchungskonto-button-row"]{
                position:relative!important;
                display:table-row!important;
                opacity:1!important;
                visibility:visible!important
            }
            [class*="dw-vwz-"][class*="-button-container"],[class*="dw-bauteile-"][class*="-button-container"],[class*="dw-gewerk-"][class*="-button-container"],[class*="dw-zahlungsart-"][class*="-button-container"],[class*="dw-buchungskonto-"][class*="-button-container"]{
                display:flex!important;
                align-items:center!important;
                gap:6px!important;
                padding:4px 1px 8px 29px!important;
                flex-wrap:wrap!important
            }
            [class*="dw-vwz-"][class*="-action-button"],[class*="dw-bauteile-"][class*="-action-button"],[class*="dw-gewerk-"][class*="-action-button"],[class*="dw-zahlungsart-"][class*="-action-button"],[class*="dw-buchungskonto-"][class*="-action-button"]{
                display:inline-flex!important;
                cursor:pointer!important;
                border-radius:3px!important;
                border:1px solid #d1d5db!important;
                background:#fff!important;
                color:#374151!important;
                padding:3px 8px!important;
                min-height:20px!important;
                font-size:11px!important;
                white-space:nowrap!important
            }
            [class*="-action-button"].selected{
                background:#eff6ff!important;
                border-color:#3b82f6!important;
                box-shadow:0 0 0 1px #3b82f6!important
            }
            .dw-btn-fade{
                animation:dwFade .3s ease-out
            }
            @keyframes dwFade{
                from{opacity:0;transform:translateY(-5px)}
                to{opacity:1;transform:translateY(0)}
            }
            .ui-dialog [class*="-action-button"]{
                font-size:10px!important;
                padding:2px 6px!important;
                min-height:18px!important
            }
            .ui-dialog.dw-dialogs:has([class*="dw-vwz-button-row"]),.ui-dialog.dw-dialogs:has([class*="dw-bauteile-button-row"]),.ui-dialog.dw-dialogs:has([class*="dw-gewerk-button-row"]),.ui-dialog.dw-dialogs:has([class*="dw-zahlungsart-button-row"]),.ui-dialog.dw-dialogs:has([class*="dw-buchungskonto-button-row"]){
                height:auto!important
            }
            .ui-dialog.dw-dialogs:has([class*="dw-vwz-button-row"]) .dw-dialogContent.fields,.ui-dialog.dw-dialogs:has([class*="dw-bauteile-button-row"]) .dw-dialogContent.fields,.ui-dialog.dw-dialogs:has([class*="dw-gewerk-button-row"]) .dw-dialogContent.fields,.ui-dialog.dw-dialogs:has([class*="dw-zahlungsart-button-row"]) .dw-dialogContent.fields,.ui-dialog.dw-dialogs:has([class*="dw-buchungskonto-button-row"]) .dw-dialogContent.fields{
                min-height:200px!important;
                max-height:none!important;
                height:auto!important;
                overflow-y:visible!important
            }
            .ui-dialog.dw-dialogs:has([class*="dw-vwz-button-row"]) .ui-dialog-content,.ui-dialog.dw-dialogs:has([class*="dw-bauteile-button-row"]) .ui-dialog-content,.ui-dialog.dw-dialogs:has([class*="dw-gewerk-button-row"]) .ui-dialog-content,.ui-dialog.dw-dialogs:has([class*="dw-zahlungsart-button-row"]) .ui-dialog-content,.ui-dialog.dw-dialogs:has([class*="dw-buchungskonto-button-row"]) .ui-dialog-content{
                min-height:200px!important;
                max-height:none!important;
                height:auto!important;
                overflow:visible!important
            }
            .ui-dialog.dw-dialogs:has([class*="dw-vwz-button-row"]) .scroll-wrapper,.ui-dialog.dw-dialogs:has([class*="dw-bauteile-button-row"]) .scroll-wrapper,.ui-dialog.dw-dialogs:has([class*="dw-gewerk-button-row"]) .scroll-wrapper,.ui-dialog.dw-dialogs:has([class*="dw-zahlungsart-button-row"]) .scroll-wrapper,.ui-dialog.dw-dialogs:has([class*="dw-buchungskonto-button-row"]) .scroll-wrapper{
                overflow-y:visible!important;
                max-height:none!important;
                height:auto!important
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-dw-verw-btns', 'true');
        document.head.appendChild(style);
    }

    // ÄNDERUNG: Schnellerer Observer
    function mkObs() {
        let timeout = null;
        const obs = new MutationObserver(() => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => {
                    const di = getDlgId(d);
                    const hasBtns = d.querySelectorAll('.dw-ko-btn-row').length > 0;
                    !hasBtns && waitKOBind(d, () => addToDlg(d, di));
                });
                procStd(document.body);
            }, 100);
            S.timeouts.add(timeout);
        });
        obs.observe(document.body, { childList: true, subtree: true });
        return obs;
    }

    function init() {
        injectCSS();
        loadState();
        preRenderButtons();
        
        waitKO(() => {
            setTimeout(() => {
                procStd(document.body);
                const dlgs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dlgs.forEach(d => {
                    const di = getDlgId(d);
                    waitKOBind(d, () => addToDlg(d, di));
                });
            }, 100);
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
            setTimeout(init, 50);
    }

    main();
})();

