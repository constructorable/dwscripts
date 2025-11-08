(function () {
    // NEU: Straßenkatalog (beliebig erweiterbar)
    const STRASSEN_KATALOG = [
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
        'Frauentorgraben 3',
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
        'Kneippallee 5-7',
        'Kneippallee 5',
        'Kneippallee 7',
        'Königswarterstr. 20',
        'Krugstr. 27',
        'Kurgartenstr. 19',
        'Landgrabenstr. 14',
        'Lilienstr. 57',
        'Lorenzer Str. 11+25',
        'Lorenzer Str. 11',
        'Lorenzer Str. 25',
        'Mondstr. 8',
        'Nelkenstr. 3',
        'Nelkenstr. 5',
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

    // NEU: Globale Variablen
    let activeDropdown = null;
    let selectedIndex = 0;
    let wertDurchDropdownGesetzt = false;

    // NEU: DocuWare Autocomplete-Modal verstecken
    function versteckeDocuWareAutocomplete() {
        const modals = document.querySelectorAll('.dw-autocompleteColumnContainer');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // NEU: Observer für DocuWare Modals
    const modalObserver = new MutationObserver(() => {
        if (wertDurchDropdownGesetzt) {
            versteckeDocuWareAutocomplete();
        }
    });

    // NEU: Modal-Observer starten
    modalObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    // NEU: Levenshtein-Distanz für Fuzzy Matching
    function levenshteinDistance(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase() ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return matrix[len1][len2];
    }

    // ÄNDERUNG: Straßenname ohne Hausnummer extrahieren
    function extrahiereStrassenname(text) {
        return text.replace(/\s+\d+.*$/, '').trim();
    }

    // NEU: Prüfen ob Katalogeintrag Hausnummer enthält
    function hatHausnummer(text) {
        return /\s+\d+/.test(text);
    }

    // NEU: Hausnummer extrahieren
    function extraiereHausnummer(text) {
        const match = text.match(/\s+(\d+.*?)$/);
        return match ? match[1] : '';
    }

    // ÄNDERUNG: Alle Matches finden (statt nur besten)
    function findAllMatches(input, userHausnummer) {
        if (!input || input.length < 3) return [];

        const matches = [];
        const threshold = Math.ceil(input.length * 0.3);
        const inputOhneNr = extrahiereStrassenname(input);

        for (const strasse of STRASSEN_KATALOG) {
            const strasseOhneNr = extrahiereStrassenname(strasse);
            const distance = levenshteinDistance(inputOhneNr, strasseOhneNr);

            if (distance <= threshold) {
                let finalStrasse = strasse;
                if (!hatHausnummer(strasse) && userHausnummer) {
                    finalStrasse = `${strasse} ${userHausnummer}`;
                }
                matches.push({ text: finalStrasse, distance });
            }
        }

        matches.sort((a, b) => a.distance - b.distance);
        return matches.map(m => m.text);
    }

    // NEU: Nächstes Input-Feld finden und fokussieren
    function fokussiereNaechstesFeld(currentField) {
        const alleFelder = Array.from(document.querySelectorAll('input.dw-textField'));
        const currentIndex = alleFelder.indexOf(currentField);
        
        if (currentIndex !== -1 && currentIndex < alleFelder.length - 1) {
            const naechstesFeld = alleFelder[currentIndex + 1];
            setTimeout(() => {
                naechstesFeld.focus();
                naechstesFeld.select();
            }, 50);
        }
    }

    // ÄNDERUNG: Auswahl im Dropdown hervorheben
    function markiereAuswahl(dropdown, index) {
        const items = dropdown.querySelectorAll('.dropdown-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.style.background = '#007bff';
                item.style.color = 'white';
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.background = 'white';
                item.style.color = 'black';
            }
        });
    }

    // ÄNDERUNG: Dropdown erstellen mit Fokus auf Input-Feld
    function zeigeDropdown(inputField, optionen) {
        entferneDropdown();
        selectedIndex = 0;

        const dropdown = document.createElement('div');
        dropdown.className = 'strassen-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            background: white;
            border: 2px solid #007bff;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-height: 250px;
            overflow-y: auto;
            min-width: ${inputField.offsetWidth}px;
        `;

        const rect = inputField.getBoundingClientRect();
        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.top = rect.bottom + window.scrollY + 2 + 'px';

        optionen.forEach((option, index) => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = option;
            item.style.cssText = `
                padding: 10px 14px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: all 0.2s;
            `;

            item.addEventListener('mouseenter', () => {
                selectedIndex = index;
                markiereAuswahl(dropdown, selectedIndex);
            });

            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // NEU: Flag setzen und Modal verstecken
                wertDurchDropdownGesetzt = true;
                versteckeDocuWareAutocomplete();
                
                inputField.value = option;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                entferneDropdown();
                
                // NEU: Modal nochmal verstecken nach kurzer Verzögerung
                setTimeout(() => {
                    versteckeDocuWareAutocomplete();
                }, 50);
                
                fokussiereNaechstesFeld(inputField);
                
                setTimeout(() => {
                    wertDurchDropdownGesetzt = false;
                }, 500);
            });

            if (index === optionen.length - 1) {
                item.style.borderBottom = 'none';
            }

            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);
        activeDropdown = { dropdown, inputField, optionen };
        markiereAuswahl(dropdown, selectedIndex);

        setTimeout(() => {
            inputField.focus();
        }, 0);

        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    // NEU: Dropdown entfernen
    function entferneDropdown() {
        const existing = document.querySelector('.strassen-dropdown');
        if (existing) {
            existing.remove();
            document.removeEventListener('click', handleOutsideClick);
        }
        activeDropdown = null;
    }

    // NEU: Klick außerhalb behandeln
    function handleOutsideClick(e) {
        if (!e.target.closest('.strassen-dropdown')) {
            entferneDropdown();
        }
    }

    // ÄNDERUNG: Tastatursteuerung mit Modal-Unterdrückung
    function handleKeyDown(e) {
        if (!activeDropdown) return;

        const { dropdown, inputField, optionen } = activeDropdown;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedIndex = (selectedIndex + 1) % optionen.length;
                markiereAuswahl(dropdown, selectedIndex);
                break;

            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedIndex = (selectedIndex - 1 + optionen.length) % optionen.length;
                markiereAuswahl(dropdown, selectedIndex);
                break;

            case 'Tab':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedIndex = (selectedIndex + 1) % optionen.length;
                markiereAuswahl(dropdown, selectedIndex);
                break;

            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // NEU: Flag setzen und Modal verstecken
                wertDurchDropdownGesetzt = true;
                versteckeDocuWareAutocomplete();
                
                const selectedValue = optionen[selectedIndex];
                inputField.value = selectedValue;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                
                entferneDropdown();
                
                // NEU: Modal nochmal verstecken nach kurzer Verzögerung
                setTimeout(() => {
                    versteckeDocuWareAutocomplete();
                }, 50);
                
                fokussiereNaechstesFeld(inputField);
                
                setTimeout(() => {
                    wertDurchDropdownGesetzt = false;
                }, 500);
                break;

            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                entferneDropdown();
                break;
        }
    }

    function feldIstObjekt(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        return /^objekt\b/i.test(label.textContent.trim());
    }

    function kuerzeStrassenname(text) {
        if (!text || typeof text !== 'string') return text;
        let result = text.trim();

        result = result.replace(/\sstraße\b/gi, ' Str.');
        result = result.replace(/\sstrasse\b/gi, ' Str.');
        result = result.replace(/-straße\b/gi, '-Str.');
        result = result.replace(/-strasse\b/gi, '-Str.');
        result = result.replace(/straße\b/gi, 'str.');
        result = result.replace(/strasse\b/gi, 'str.');

        return result;
    }

    // ÄNDERUNG: Verarbeitung mit Flag-Prüfung
    function verarbeiteEingabe(inputField) {
        if (wertDurchDropdownGesetzt) return;
        
        let value = inputField.value;
        if (!value) return;

        value = kuerzeStrassenname(value);
        const userHausnummer = extraiereHausnummer(value);
        const alleMatches = findAllMatches(value, userHausnummer);

        if (alleMatches.length > 1) {
            zeigeDropdown(inputField, alleMatches);
        } else if (alleMatches.length === 1 && alleMatches[0] !== value) {
            inputField.value = alleMatches[0];
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function attachHandler(inputField) {
        if (inputField.dataset.strassenAbkuerzungAttached) return;
        if (!feldIstObjekt(inputField)) return;

        inputField.addEventListener('blur', function (e) {
            setTimeout(() => {
                if (!activeDropdown && !wertDurchDropdownGesetzt) {
                    verarbeiteEingabe(this);
                }
            }, 200);
        });

        inputField.addEventListener('keydown', handleKeyDown, true);

        inputField.dataset.strassenAbkuerzungAttached = 'true';
    }

    function scan() {
        document.querySelectorAll('input.dw-textField').forEach(attachHandler);
    }

    const obs = new MutationObserver(scan);
    obs.observe(document.body, { subtree: true, childList: true });
    scan();
})();

