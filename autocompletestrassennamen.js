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
        'Fürther Str. 45',
        'Fürther Str. 54 - 56',
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
    let letzteObjektLoeschAktion = 0;
    const attachedObjektFields = new WeakSet();

    function bereinigeObjektEingabe(input) {
        if (!input) return '';
        return input.replace(/^[\s*]+/, '').trim();
    }

    function findeObjektMatch(input) {
        input = bereinigeObjektEingabe(input);
        if (!input || input.length < 2) return null;
        const inputLower = input.toLowerCase().trim();
        const inputTeile = inputLower.split(/\s+/).filter(t => t.length > 0);

        let matches = OBJEKT_KATALOG.filter(typ =>
            inputTeile.every(teil => typ.toLowerCase().includes(teil))
        );

        if (matches.length === 1) return { typ: 'eindeutig', wert: matches[0] };
        if (matches.length > 1 && matches.length <= 20) return { typ: 'mehrfach', wert: matches };

        const prefixMatches = OBJEKT_KATALOG.filter(typ =>
            typ.toLowerCase().startsWith(inputLower)
        );
        if (prefixMatches.length === 1) return { typ: 'eindeutig', wert: prefixMatches[0] };
        if (prefixMatches.length > 1 && prefixMatches.length <= 20) return { typ: 'mehrfach', wert: prefixMatches };

        if (matches.length > 20) {
            return { typ: 'mehrfach', wert: matches.slice(0, 20), mehr: true, total: matches.length };
        }

        return null;
    }

    function zeigeObjektDropdown(inputField, optionenMeta) {
        entferneObjektDropdown();
        selectedObjektIndex = 0;

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

        const style = document.createElement('style');
        style.textContent = `
            .objekt-dropdown::-webkit-scrollbar { width: 8px; }
            .objekt-dropdown::-webkit-scrollbar-track { background: #e6edf6; border-radius: 4px; }
            .objekt-dropdown::-webkit-scrollbar-thumb { background: #4b70a6; border-radius: 4px; }
            .objekt-dropdown::-webkit-scrollbar-thumb:hover { background: #3d5a87; }
        `;
        if (!document.getElementById('objekt-scrollbar-style')) {
            style.id = 'objekt-scrollbar-style';
            document.head.appendChild(style);
        }

        const rect = inputField.getBoundingClientRect();
        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.top = rect.bottom + window.scrollY + 6 + 'px';

        let optionen = Array.isArray(optionenMeta) ? optionenMeta : (optionenMeta.wert || []);
        const hatMehr = optionenMeta && optionenMeta.mehr;
        const total = optionenMeta && optionenMeta.total ? optionenMeta.total : optionen.length;

        optionen.forEach((option, index) => {
            const item = document.createElement('div');
            item.className = 'objekt-dropdown-item';
            item.textContent = option;
            item.style.cssText = `
                padding: 2px 12px;
                cursor: pointer;
                border-bottom: 1px solid #e6edf6;
                font-size: 13px;
                transition: background 0.14s;
            `;
            item.addEventListener('mouseenter', () => {
                selectedObjektIndex = index;
                markiereObjektAuswahl(dropdown, selectedObjektIndex);
            });
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // ÄNDERUNG: Vollständige Event-Kette für DocuWare
                inputField.value = option;
                inputField.focus();

                // Alle relevanten Events triggern
                ['input', 'change', 'blur', 'keyup'].forEach(eventType => {
                    inputField.dispatchEvent(new Event(eventType, { bubbles: true }));
                });

                // KnockoutJS explizit aktualisieren
                if (window.ko && ko.dataFor) {
                    try {
                        const koData = ko.dataFor(inputField);
                        if (koData && koData.value && ko.isObservable(koData.value)) {
                            koData.value(option);
                        }
                    } catch (e) { }
                }

                entferneObjektDropdown();
                fokussiereNaechstesObjektFeld(inputField);
            });
            dropdown.appendChild(item);
        });

        if (hatMehr) {
            const footer = document.createElement('div');
            footer.style.cssText = `
                padding: 2px 12px;
                font-size: 12px;
                color: #4b6b8f;
                background: linear-gradient(to top, rgba(255,255,255,0.6), transparent);
            `;
            footer.textContent = `Zeige ${optionen.length} von ${total} Ergebnissen — bitte weiter tippen.`;
            dropdown.appendChild(footer);
        }

        document.body.appendChild(dropdown);
        activeObjektDropdown = { dropdown, inputField, optionen };
        markiereObjektAuswahl(dropdown, selectedObjektIndex);

        setTimeout(() => {
            inputField.focus();
            inputField.setSelectionRange(inputField.value.length, inputField.value.length);
        }, 0);

        setTimeout(() => document.addEventListener('click', handleObjektOutsideClick), 100);
    }

    function markiereObjektAuswahl(dropdown, index) {
        const items = dropdown.querySelectorAll('.objekt-dropdown-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.style.background = '#4b70a6';
                item.style.color = 'white';
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.style.background = 'transparent';
                item.style.color = '#2d2d2d';
            }
        });
    }

    function entferneObjektDropdown() {
        const existing = document.querySelector('.objekt-dropdown');
        if (existing) existing.remove();
        document.querySelectorAll('.dw-MultiControlList').forEach(el => el.style.display = '');
        document.removeEventListener('click', handleObjektOutsideClick);
        activeObjektDropdown = null;
    }

    function handleObjektOutsideClick(e) {
        if (!e.target.closest('.objekt-dropdown')) entferneObjektDropdown();
    }

    function handleObjektKeyDown(e) {
        if (!activeObjektDropdown) return;

        const { dropdown, inputField, optionen } = activeObjektDropdown;
        const items = dropdown.querySelectorAll('.objekt-dropdown-item');

        const navigationKeys = ['ArrowDown', 'ArrowUp', 'Tab', 'Enter', 'Escape'];

        if (!navigationKeys.includes(e.key)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (!items || items.length === 0) return;

        const gotoIndex = (idx) => {
            selectedObjektIndex = (idx + items.length) % items.length;
            markiereObjektAuswahl(dropdown, selectedObjektIndex);
        };

        if (e.key === 'ArrowDown') {
            gotoIndex(selectedObjektIndex + 1);
            return;
        }
        if (e.key === 'ArrowUp') {
            gotoIndex(selectedObjektIndex - 1);
            return;
        }

        if (e.key === 'Tab') {
            if (e.shiftKey) gotoIndex(selectedObjektIndex - 1);
            else gotoIndex(selectedObjektIndex + 1);
            return;
        }

        if (e.key === 'Enter') {
            const chosen = optionen[selectedObjektIndex];
            if (chosen) {
                // ÄNDERUNG: Vollständige Event-Kette
                inputField.value = chosen;
                inputField.focus();

                ['input', 'change', 'blur', 'keyup'].forEach(eventType => {
                    inputField.dispatchEvent(new Event(eventType, { bubbles: true }));
                });

                // KnockoutJS explizit aktualisieren
                if (window.ko && ko.dataFor) {
                    try {
                        const koData = ko.dataFor(inputField);
                        if (koData && koData.value && ko.isObservable(koData.value)) {
                            koData.value(chosen);
                        }
                    } catch (e) { }
                }

                entferneObjektDropdown();
                suppressDocuWareDropdown(inputField);
                fokussiereNaechstesObjektFeld(inputField);
            }
        }

        if (e.key === 'Escape') {
            entferneObjektDropdown();
        }
    }

    function suppressDocuWareDropdown(inputField) {
        if (!inputField || !istObjektFeld(inputField)) return;

        const dwDropdown = document.querySelector('.dw-autocompleteColumnContainer, .dw-scroll-content.scroll-content');
        if (dwDropdown) {
            dwDropdown.style.display = 'none';
            dwDropdown.setAttribute('data-suppressed', 'true');
            const koData = ko?.dataFor?.(dwDropdown);
            if (koData?.visible) koData.visible(false);
        }
    }


    function handleObjektInput(e) {
        const inputField = e.target;

        if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
            letzteObjektLoeschAktion = Date.now();
            entferneObjektDropdown();
            if (inputField.value.trim() === '') {
                inputField.value = '';
                return;
            }
        }

        let value = bereinigeObjektEingabe(inputField.value);
        inputField.value = value;

        const zeitSeitLetzterLoeschung = Date.now() - letzteObjektLoeschAktion;
        if (zeitSeitLetzterLoeschung < 400 || value.length < 2) {
            entferneObjektDropdown();
            return;
        }

        const match = findeObjektMatch(value);
        if (match) {
            if (match.typ === 'eindeutig') {
                inputField.value = match.wert;
                setTimeout(() => {
                    inputField.setSelectionRange(match.wert.length, match.wert.length);
                }, 10);
                entferneObjektDropdown();
            } else if (match.typ === 'mehrfach') {
                zeigeObjektDropdown(inputField, match);
            }
        } else entferneObjektDropdown();
    }

    function istObjektFeld(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;

        // ÄNDERUNG: Bereinige Label-Text von Sternchen und Klammern
        const labelText = label.textContent
            .trim()
            .replace(/\s*\*\s*$/, '')  // Entfernt Sternchen am Ende
            .replace(/\s*\(.*?\)\s*$/, '')  // Entfernt Klammern am Ende
            .toLowerCase();

        // ÄNDERUNG: Erweiterte Prüfung – Label muss nur "objekt" enthalten
        return labelText === 'objekt' ||
            labelText === 'objektadresse' ||
            labelText.includes('objekt');
    }

    function fokussiereNaechstesObjektFeld(currentField) {
        const bereich = currentField.closest('tbody, table, .dw-section, form') || document;

        const isValid = (el) => {
            if (!el || el.readOnly || el.disabled) return false;
            const rects = el.getClientRects();
            return rects && rects.length > 0;
        };

        const felder = Array.from(bereich.querySelectorAll('input.dw-textField, input.dw-dateField, textarea, select'))
            .filter(isValid);

        const index = felder.indexOf(currentField);
        let nextField = null;

        if (index >= 0 && index < felder.length - 1) {
            nextField = felder[index + 1];
        } else {
            const alleFelder = Array.from(document.querySelectorAll('input.dw-textField, input.dw-dateField, textarea, select'))
                .filter(isValid);
            const globalIndex = alleFelder.indexOf(currentField);
            if (globalIndex >= 0 && globalIndex < alleFelder.length - 1) {
                nextField = alleFelder[globalIndex + 1];
            }
        }

        if (nextField) {
            setTimeout(() => {
                nextField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                nextField.focus();
                if (typeof nextField.select === 'function') nextField.select();
            }, 80);
        }
    }

    function attachObjektHandler(inputField) {
        if (attachedObjektFields.has(inputField)) return;
        if (!istObjektFeld(inputField)) return;

        inputField.addEventListener('input', handleObjektInput);
        inputField.addEventListener('keydown', handleObjektKeyDown, true);
        attachedObjektFields.add(inputField);
    }

    function scanObjekte() {
        document.querySelectorAll('input.dw-textField').forEach(attachObjektHandler);
    }

    let objektObserverTimeout;
    const objektObserver = new MutationObserver(() => {
        clearTimeout(objektObserverTimeout);
        objektObserverTimeout = setTimeout(() => {
            // suppressDocuWareDropdown(); // ENTFERNT
            scanObjekte();
        }, 150);
    });

    objektObserver.observe(document.body, { childList: true, subtree: true });
    scanObjekte();

})();



