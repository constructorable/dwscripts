(function () {
    // NEU: Objekt-Katalog
    const OBJEKT_KATALOG = [
     'Amalienstr. 38',
        'Ammonstr. 2-4',
        'Ammonstr. 2',
        'Ammonstr. 4',
        'Anne-Frank-Str. 43',
        'Arnulfstr. 4',
        'Äußere Großweidenmühlstr. 10',
        'Badstr. 52',
        'Bahnhofstr. 79',
        'Bogenstr. 42',
        'Emilienstr. 1',
        'Flugplatzstr. 80',
        'Friedrichstr. 9',
        'Fürther Str. 54-56',
        'Fürther Str. 54',
        'Fürther Str. 56',
        'Fürther Str. 99',
        'Gibitzenhofstr. 61',
        'Grenzstr. 13',
        'Grünerstr. 2',
        'Hallstr. 6',
        'Hans-Vogel-Str. 20',
        'Hauptstr. 57',
        'Hauptstr. 60',
        'Hertastr. 21',
        'Hirschenstr. 7',
        'Hirschenstr. 31',
        'Hornschuchpromenade 25',
        'Im Unteren Grund 1-1e',
        'Innerer Kleinreuther Weg 5-7',
        'Innerer Kleinreuther Weg 5',
        'Innerer Kleinreuther Weg 7',
        'Ipsheimer Str. 12',
        'Johann-Geismann-Str.',
        'Johannisstr. 108',
        'Katharinengasse 24',
        'Kirchenweg 43',
        'Kneippallee 5-7a',
        'Kneippallee 5',
        'Kneippallee 7',
        'Kneippallee 7a',
        'Königswarterstr. 20',
        'Krugstr. 27',
        'Kurgartenstr. 19',
        'Landgrabenstr. 14',
        'Lilienstr. 57, Nelkenstr. 3+5, Nelkenstr. 11',
        'Lorenzer Str. 11+25',
        'Lorenzer Str. 11',
        'Lorenzer Str. 25',
        'Mondstr. 8',
    
        'Neubleiche 8',
        'Neutormauer 2',
        'Obere Turnstr. 9',
        'Peterstr. 71',
        'Pfefferloh 3',
        'Prinzregentenufer 5',
        'Rankestr. 60',
        'Regensburger Str.',
        'Reitmorstr. 52',
        'Saalfelder Str. 5',
        'Saalfelder Str. 6',
        'Sauerbruchstr. 10',
        'Schlotfegergasse 6',
        'Schumannstr. 13',
        'Schwabacher Str. 4',
        'Schwabacher Str. 85',
        'Sigmund-Nathan-Str. 4+4a',
        'Sigmundstr. 139',
        'Spittlertorgraben 29',
        'Spitzwegstr. 27',
        'Sprottauer Str. 10',
        'Stephanstr. 14',
        'Stephanstr. 16',
        'Stephanstr. 21',
        'Thurn-und-Taxis-Str. 18',
        'Vacher Str. 471',
        'Volbehrstr. 55-63',
        'Volbehrstr. 55',
        'Volbehrstr. 57',
        'Volbehrstr. 59',
        'Volbehrstr. 61',
        'Volbehrstr. 63',
        'Willy-Brandt-Platz 10',
        'Wodanstr. 34',
        'Zollhof 8'
    ];


    let activeObjektDropdown = null;
    let selectedObjektIndex = 0;
    let ObjektAutoVervollstaendigungAktiv = false;
    let letzteLoeschAktion2 = 0;
    let loeschBlockadeTimeout2 = null;

    // NEU: Sternchen entfernen
    function bereinigeEingabe(input) {
        if (!input) return '';
        return input.replace(/^[\s*]+/, '').trim();
    }

    // NEU: Intelligente Objekt-Suche
    function findeObjektMatch(input) {
        input = bereinigeEingabe(input);
        if (!input || input.length < 2) return null; // 2 erlaubt kurze Präfixe wie "Be" / "Ber"
        const inputLower = input.toLowerCase().trim();
        const inputTeile = inputLower.split(/\s+/).filter(t => t.length > 0);

        // 1) Breite Includes-Suche (alle Teile müssen vorkommen)
        let matches = OBJEKT_KATALOG.filter(typ =>
            inputTeile.every(teil => typ.toLowerCase().includes(teil))
        );

        if (matches.length === 1) return { typ: 'eindeutig', wert: matches[0] };
        if (matches.length > 1 && matches.length <= 10) return { typ: 'mehrfach', wert: matches };

        // 2) Wenn zu viele Matches: Versuche Präfix-/StartsWith-Filter (hilft bei "Ber")
        const prefixMatches = OBJEKT_KATALOG.filter(typ =>
            typ.toLowerCase().startsWith(inputLower)
        );
        if (prefixMatches.length === 1) return { typ: 'eindeutig', wert: prefixMatches[0] };
        if (prefixMatches.length > 1 && prefixMatches.length <= 10) return { typ: 'mehrfach', wert: prefixMatches };

        // 3) Falls immer noch zu viele Matches: gib erste 10 zurück und markiere, dass es mehr gibt
        if (matches.length > 10) {
            return { typ: 'mehrfach', wert: matches.slice(0, 10), mehr: true, total: matches.length };
        }

        // 4) Fallback: keine sinnvollen Treffer
        return null;
    }
    // NEU: Dropdown erstellen
    function zeigeDropdown(inputField, optionenMeta) {
        entferneDropdown();
        selectedObjektIndex = 0;

        // DocuWare-Dropdowns ausblenden
        document.querySelectorAll('.dw-MultiControlList').forEach(el => el.style.display = 'none');

        const dropdown = document.createElement('div');
        dropdown.className = 'objekt-dropdown';
        dropdown.style.cssText = `
        position: absolute;
        background: #f6f9fc;
        border: 1px solid #c7d6e9;
        border-radius: 6px;
        box-shadow: 0 4px 14px rgba(45,66,91,0.08);
        z-index: 10000;
        max-height: 280px;
        overflow-y: auto;
        min-width: ${inputField.offsetWidth}px;
        font-family: Arial, sans-serif;
    `;

        const rect = inputField.getBoundingClientRect();
        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.top = rect.bottom + window.scrollY + 6 + 'px';

        // optionenMeta kann entweder ein Array von Strings oder ein Objekt mit {wert: [...], mehr: true, total: N}
        let optionen = Array.isArray(optionenMeta) ? optionenMeta : (optionenMeta.wert || []);
        const hatMehr = optionenMeta && optionenMeta.mehr;
        const total = optionenMeta && optionenMeta.total ? optionenMeta.total : optionen.length;

        optionen.forEach((option, index) => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = option;
            item.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #e6edf6;
            font-size: 13px;
            transition: background 0.14s;
        `;
            item.addEventListener('mouseenter', () => {
                selectedObjektIndex = index;
                markiereAuswahl(dropdown, selectedObjektIndex);
            });
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                inputField.value = option;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                entferneDropdown();
                fokussiereNaechstesFeld(inputField);
            });
            dropdown.appendChild(item);
        });

        // NEU: Footer anzeigen, wenn es mehr Treffer gibt
        if (hatMehr) {
            const footer = document.createElement('div');
            footer.className = 'dropdown-footer';
            footer.style.cssText = `
            padding: 8px 12px;
            font-size: 12px;
            color: #4b6b8f;
            background: linear-gradient(to top, rgba(255,255,255,0.6), transparent);
        `;
            footer.textContent = `Zeige ${optionen.length} von ${total} Ergebnissen — bitte weiter tippen, um zu verfeinern.`;
            dropdown.appendChild(footer);
        }

        document.body.appendChild(dropdown);
        activeObjektDropdown = { dropdown, inputField, optionen };

        markiereAuswahl(dropdown, selectedObjektIndex);

        setTimeout(() => inputField.focus(), 0);
        setTimeout(() => document.addEventListener('click', handleOutsideClick), 100);
    }

    // ÄNDERUNG: verbessertes Fokusverhalten in DocuWare-Feldern
document.addEventListener('keydown', function (e) {
    const dropdown = document.querySelector('.custom-autocomplete-list');
    const activeItem = dropdown?.querySelector('.active');

    // Innerhalb Dropdown navigieren
    if (dropdown && dropdown.style.display !== 'none') {
        const items = Array.from(dropdown.querySelectorAll('li'));
        const currentIndex = items.indexOf(activeItem);

        if (e.key === 'Tab') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items.forEach(li => li.classList.remove('active'));
            items[nextIndex].classList.add('active');
            items[nextIndex].scrollIntoView({ block: 'nearest' });
        }

        // Enter = Auswahl + nächstes Eingabefeld
        else if (e.key === 'Enter' && activeItem) {
            e.preventDefault();
            activeItem.click();

            const currentInput = document.activeElement.closest('input.dw-textField, input.dw-dateField');
            if (!currentInput) return;

            // Nächstes sichtbares, aktivierbares Feld finden
            const allInputs = Array.from(document.querySelectorAll('input.dw-textField, input.dw-dateField'))
                .filter(inp => inp.offsetParent !== null && !inp.readOnly && !inp.disabled);

            const currentIndex = allInputs.indexOf(currentInput);
            const next = allInputs[currentIndex + 1];
            if (next) {
                setTimeout(() => next.focus(), 150); // kleine Verzögerung, damit DW-Skript fertig ist
            }
        }
    }
});


    // NEU: Auswahl markieren
    function markiereAuswahl(dropdown, index) {
        const items = dropdown.querySelectorAll('.dropdown-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.style.background = '#4b70a6';
                item.style.color = 'white';
            } else {
                item.style.background = 'transparent';
                item.style.color = '#2d2d2d';
            }
        });
    }

    // NEU: Dropdown entfernen
    function entferneDropdown() {
        const existing = document.querySelector('.objekt-dropdown');
        if (existing) existing.remove();
        document.querySelectorAll('.dw-MultiControlList').forEach(el => el.style.display = '');
        document.removeEventListener('click', handleOutsideClick);
        activeObjektDropdown = null;
    }

    function handleOutsideClick(e) {
        if (!e.target.closest('.objekt-dropdown')) entferneDropdown();
    }

    // NEU: Tastatursteuerung
    // ÄNDERUNG: Tastatursteuerung erweitert (Tab navigiert, Enter springt weiter)
function handleKeyDown(e) {
    // Wenn kein eigenes Dropdown offen -> nichts tun
    if (!activeObjektDropdown) return;

    // verhindern, dass DocuWare eigene Handler dazwischenfunken
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const { dropdown, inputField, optionen } = activeObjektDropdown;
    const items = dropdown.querySelectorAll('.dropdown-item');
    if (!items || items.length === 0) return;

    // Hilfsfunktionen
    const gotoIndex = (idx) => {
        selectedObjektIndex = (idx + items.length) % items.length;
        markiereAuswahl(dropdown, selectedObjektIndex);
    };

    // Navigation
    if (e.key === 'ArrowDown') {
        gotoIndex(selectedObjektIndex + 1);
        return;
    }
    if (e.key === 'ArrowUp') {
        gotoIndex(selectedObjektIndex - 1);
        return;
    }

    // Tab / Shift+Tab im Dropdown: wie ArrowDown / ArrowUp
    if (e.key === 'Tab') {
        if (e.shiftKey) gotoIndex(selectedObjektIndex - 1);
        else gotoIndex(selectedObjektIndex + 1);
        return;
    }

    // Enter: Auswahl übernehmen + zum nächsten logischen DocuWare-Feld springen
if (e.key === 'Enter') {
    const chosen = optionen[selectedObjektIndex];
    if (chosen) {
        inputField.value = chosen;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));

        // Eigenes Dropdown entfernen
        entferneDropdown();

        // DocuWare Dropdown unterdrücken
        const dwDropdown = document.querySelector('.dw-autocompleteColumnContainer');
        if (dwDropdown) {
            dwDropdown.style.display = 'none';
            dwDropdown.setAttribute('data-suppressed', 'true');

            // Optional: knockout viewModel auf hidden setzen
            const koData = ko.dataFor(dwDropdown);
            if (koData && koData.visible) {
                koData.visible(false);
            }
        }

        // Fokus auf nächstes Feld
        fokussiereNaechstesFeldDocuWare(inputField);
    }
}

    // Escape wie vorher
    if (e.key === 'Escape') {
        entferneDropdown();
        return;
    }
}

function fokussiereNaechstesFeldDocuWare(currentField) {
    // 1) Versuche innerhalb des gleichen <tbody> / Tabelle / Dialogs vorwärts zu gehen
    const currentTr = currentField.closest('tr');
    const rootTable = currentTr ? currentTr.closest('tbody, table, .dw-dialog, form, .dw-section') : null;

    const isValid = (el) => {
        if (!el) return false;
        if (el.readOnly) return false;
        if (el.disabled) return false;
        // visible: offsetParent oder getClientRects
        const rects = el.getClientRects();
        if (!rects || rects.length === 0) return false;
        // ignore small hidden controls like icon-only buttons
        return true;
    };

    const findInSiblingTrs = () => {
        if (!currentTr) return null;
        let tr = currentTr.nextElementSibling;
        while (tr) {
            // skip Knockout comment nodes - nextElementSibling already does
            // Suche nach Eingabefeld im TR (bevorzugt .dw-textField / .dw-dateField)
            const candidate = tr.querySelector('input.dw-textField, input.dw-dateField, textarea, select, input[type="text"]');
            if (candidate && isValid(candidate)) return candidate;
            tr = tr.nextElementSibling;
        }
        return null;
    };

    const findInRoot = () => {
        if (!rootTable) return null;
        // alle Inputs in rootTable in DOM-Reihenfolge
        const candidates = Array.from(rootTable.querySelectorAll('input.dw-textField, input.dw-dateField, textarea, select, input[type="text"]'));
        const idx = candidates.indexOf(currentField);
        if (idx >= 0) {
            for (let i = idx + 1; i < candidates.length; i++) {
                if (isValid(candidates[i])) return candidates[i];
            }
        }
        return null;
    };

    const findGlobally = () => {
        const all = Array.from(document.querySelectorAll('input.dw-textField, input.dw-dateField, textarea, select, input[type="text"]'));
        const idx = all.indexOf(currentField);
        if (idx >= 0) {
            for (let i = idx + 1; i < all.length; i++) {
                if (isValid(all[i])) return all[i];
            }
        }
        return null;
    };

    // Reihenfolge: siblings -> rootTable -> global
    let next = findInSiblingTrs() || findInRoot() || findGlobally();

    if (next) {
        // Kleiner Delay, damit DocuWare eigene asynchrone Fokus-Mechanismen abgeschlossen sind.
        setTimeout(() => {
            try {
                next.focus();
                // wenn text, select zum schnellen Weitertippen
                if (typeof next.select === 'function') {
                    next.select();
                }
                // manuell ein focus-Event feuern (falls DW darauf hört)
                next.dispatchEvent(new Event('focus', { bubbles: true }));
            } catch (err) {
                // Fallback: nichts tun
            }
        }, 60);
    }
}


    // NEU: Input-Handler
    function handleInput(e) {
        const inputField = e.target;
        let value = bereinigeEingabe(inputField.value);
        inputField.value = value;

        const zeitSeitLetzterLoeschung = Date.now() - letzteLoeschAktion2;
        if (zeitSeitLetzterLoeschung < 400 || value.length < 3) {
            entferneDropdown();
            return;
        }

        const match = findeObjektMatch(value);
        if (match) {
            if (match.typ === 'eindeutig') {
                inputField.value = match.wert;
                entferneDropdown();
            } else if (match.typ === 'mehrfach') {
                zeigeDropdown(inputField, match.wert);
            }
        } else entferneDropdown();
    }

    // ÄNDERUNG: Jedes Label, das "Objekt" enthält, wird erkannt
    function istObjektFeld(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        const labelText = label.textContent.trim().toLowerCase();
        return labelText.includes('objekt');
    }

    // NEU: Nächstes Feld fokussieren
    // ÄNDERUNG: Verbesserte Fokus-Steuerung für DocuWare-Felder
    function fokussiereNaechstesFeld(currentField) {
        // Lokalen Bereich ermitteln (z. B. gleiche Tabelle oder Sektion)
        const bereich = currentField.closest('table, .dw-section, form') || document;
        const felder = Array.from(bereich.querySelectorAll('input[type="text"], textarea, select'))
            .filter(el => !el.disabled && el.offsetParent !== null); // nur sichtbare Felder

        const index = felder.indexOf(currentField);
        if (index >= 0 && index < felder.length - 1) {
            // Nächstes Feld im gleichen Bereich
            const next = felder[index + 1];
            setTimeout(() => next.focus(), 80);
            return;
        }

        setTimeout(() => {
            next.scrollIntoView({ behavior: 'smooth', block: 'center' });
            next.focus();
        }, 80);

        // Falls kein weiteres Feld im gleichen Bereich → global weitersuchen
        const alleFelder = Array.from(document.querySelectorAll('input[type="text"], textarea, select'))
            .filter(el => !el.disabled && el.offsetParent !== null);

        const globalIndex = alleFelder.indexOf(currentField);
        if (globalIndex >= 0 && globalIndex < alleFelder.length - 1) {
            const nextGlobal = alleFelder[globalIndex + 1];
            setTimeout(() => nextGlobal.focus(), 80);
        }
    }


    // NEU: Handler anhängen
    function attachHandler(inputField) {
        if (inputField.dataset.ObjektAttached) return;
        if (!istObjektFeld(inputField)) return;
        inputField.addEventListener('input', handleInput);
        inputField.addEventListener('keydown', handleKeyDown, true);
        inputField.dataset.ObjektAttached = 'true';
    }

    // NEU: Scannen
    function scan() {
        document.querySelectorAll('input.dw-textField').forEach(attachHandler);
    }

const observer = new MutationObserver(() => {
    const dwDropdown = document.querySelector('.dw-scroll-content.scroll-content');
    const customDropdown = document.querySelector('.objekt-dropdown');

    if (dwDropdown && customDropdown && customDropdown.style.display !== 'none') {
        // DocuWare Dropdown ausblenden
        dwDropdown.style.display = 'none';
        dwDropdown.setAttribute('data-suppressed', 'true');
    } else if (dwDropdown && dwDropdown.getAttribute('data-suppressed')) {
        // Wieder einblenden, wenn dein Dropdown geschlossen wird
        dwDropdown.style.display = '';
        dwDropdown.removeAttribute('data-suppressed');
    }

    // Zusätzlich: scanne neue Input-Felder
    scan();
});
observer.observe(document.body, { childList: true, subtree: true });
})();

