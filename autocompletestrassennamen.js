(function () {
    'use strict';
    
    // Straßenkatalog
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

    // Globale Variablen
    let activeStrassenDropdown = null;
    let selectedStrassenIndex = 0;
    let strassenAutoVervollstaendigungAktiv = false;
    let letzteStrassenLoeschAktion = 0;
    let strassenLoeschBlockadeTimeout = null;
    let docuWareBlockiert = false;

    // Präfix-Mappings berechnen
    const STRASSEN_PRAFIX_MAPPING = berechneStrassenPrafixMapping();

    // DocuWare Autocomplete verstecken mit Blockierung
    function versteckeDocuWareAutocomplete() {
        const modals = document.querySelectorAll('.dw-autocompleteColumnContainer, .dw-autocompleteScrollArea');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
            }
        });
    }

    // DocuWare temporär blockieren
    function blockiereDocuWareTemporaer(dauer = 500) {
        docuWareBlockiert = true;
        versteckeDocuWareAutocomplete();
        
        const intervals = [50, 100, 150, 200, 300, 400];
        intervals.forEach(delay => {
            setTimeout(() => {
                versteckeDocuWareAutocomplete();
            }, delay);
        });
        
        setTimeout(() => {
            docuWareBlockiert = false;
        }, dauer);
    }

    // Observer für DocuWare Autocomplete mit Blockierungs-Check
    const docuWareObserver = new MutationObserver(() => {
        if (strassenAutoVervollstaendigungAktiv || activeStrassenDropdown || docuWareBlockiert) {
            versteckeDocuWareAutocomplete();
        }
    });

    docuWareObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    // Sternchen und Leerzeichen am Anfang entfernen
    function bereinigeStrassenEingabe(input) {
        if (!input) return '';
        return input.replace(/^[\s*]+/, '').trim();
    }

    function berechneStrassenPrafixMapping() {
        const eindeutigMapping = {};
        const mehrfachMapping = {};
        const basisnamenGruppen = {};
        
        STRASSEN_KATALOG.forEach(strasse => {
            const basisname = extrahiereStrassenname(strasse);
            const basiKey = basisname.toLowerCase();
            
            if (!basisnamenGruppen[basiKey]) {
                basisnamenGruppen[basiKey] = [];
            }
            basisnamenGruppen[basiKey].push(strasse);
        });
        
        const eindeutigeStrassen = [];
        const mehrfacheStrassen = [];
        
        for (const basiKey in basisnamenGruppen) {
            if (basisnamenGruppen[basiKey].length === 1) {
                eindeutigeStrassen.push({
                    basisname: basiKey,
                    vollstaendig: basisnamenGruppen[basiKey][0]
                });
            } else {
                mehrfacheStrassen.push({
                    basisname: basiKey,
                    varianten: basisnamenGruppen[basiKey]
                });
            }
        }
        
        eindeutigeStrassen.forEach(strasse => {
            const basisname = strasse.basisname;
            let minLength = 3;
            
            for (let len = minLength; len <= basisname.length; len++) {
                const praefix = basisname.substring(0, len);
                let istEindeutig = true;
                
                for (const andere of eindeutigeStrassen) {
                    if (andere.basisname !== basisname && 
                        andere.basisname.startsWith(praefix)) {
                        istEindeutig = false;
                        break;
                    }
                }
                
                if (istEindeutig) {
                    for (const mehrfach of mehrfacheStrassen) {
                        if (mehrfach.basisname.startsWith(praefix)) {
                            istEindeutig = false;
                            break;
                        }
                    }
                }
                
                if (istEindeutig) {
                    eindeutigMapping[praefix] = strasse.vollstaendig;
                    break;
                }
            }
        });
        
        mehrfacheStrassen.forEach(strasse => {
            const basisname = strasse.basisname;
            let minLength = 3;
            
            for (let len = minLength; len <= basisname.length; len++) {
                const praefix = basisname.substring(0, len);
                let istEindeutig = true;
                
                for (const andere of mehrfacheStrassen) {
                    if (andere.basisname !== basisname && 
                        andere.basisname.startsWith(praefix)) {
                        istEindeutig = false;
                        break;
                    }
                }
                
                if (istEindeutig) {
                    for (const eindeutig of eindeutigeStrassen) {
                        if (eindeutig.basisname.startsWith(praefix)) {
                            istEindeutig = false;
                            break;
                        }
                    }
                }
                
                if (istEindeutig) {
                    mehrfachMapping[praefix] = strasse.varianten;
                    break;
                }
            }
        });
        
        return { eindeutig: eindeutigMapping, mehrfach: mehrfachMapping };
    }

    // Levenshtein-Distanz
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

    // Straßenname ohne Hausnummer
    function extrahiereStrassenname(text) {
        return text.replace(/\s+\d+.*$/, '').trim();
    }

    // Hausnummer extrahieren
    function extraiereHausnummer(text) {
        const match = text.match(/\s+(\d+.*?)$/);
        return match ? match[1] : '';
    }

    // Straßenname kürzen
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

    // NEU: Prüfen ob Wert exakt im Katalog existiert
    function istExakterKatalogEintrag(input) {
        input = bereinigeStrassenEingabe(input);
        const inputLower = input.toLowerCase().trim();
        
        for (const strasse of STRASSEN_KATALOG) {
            if (strasse.toLowerCase() === inputLower) {
                return true;
            }
        }
        return false;
    }

    // Intelligente Autovervollständigung mit bereinigter Eingabe
    function findeSchnelleStrassenAutovervollstaendigung(input) {
        input = bereinigeStrassenEingabe(input);
        
        if (!input || input.length < 3) return null;
        
        const inputLower = input.toLowerCase().trim();
        
        if (STRASSEN_PRAFIX_MAPPING.eindeutig[inputLower]) {
            return {
                typ: 'eindeutig',
                wert: STRASSEN_PRAFIX_MAPPING.eindeutig[inputLower]
            };
        }
        
        if (STRASSEN_PRAFIX_MAPPING.mehrfach[inputLower]) {
            return {
                typ: 'mehrfach',
                wert: STRASSEN_PRAFIX_MAPPING.mehrfach[inputLower]
            };
        }
        
        for (const praefix in STRASSEN_PRAFIX_MAPPING.eindeutig) {
            if (praefix.startsWith(inputLower) && inputLower.length >= 3) {
                return {
                    typ: 'eindeutig',
                    wert: STRASSEN_PRAFIX_MAPPING.eindeutig[praefix]
                };
            }
        }
        
        for (const praefix in STRASSEN_PRAFIX_MAPPING.mehrfach) {
            if (praefix.startsWith(inputLower) && inputLower.length >= 3) {
                return {
                    typ: 'mehrfach',
                    wert: STRASSEN_PRAFIX_MAPPING.mehrfach[praefix]
                };
            }
        }
        
        for (const praefix in STRASSEN_PRAFIX_MAPPING.eindeutig) {
            if (inputLower.startsWith(praefix)) {
                const strasseVollstaendig = STRASSEN_PRAFIX_MAPPING.eindeutig[praefix];
                const strasseLower = strasseVollstaendig.toLowerCase();
                
                if (strasseLower.startsWith(inputLower)) {
                    return {
                        typ: 'eindeutig',
                        wert: strasseVollstaendig
                    };
                }
            }
        }
        
        for (const praefix in STRASSEN_PRAFIX_MAPPING.mehrfach) {
            if (inputLower.startsWith(praefix)) {
                const varianten = STRASSEN_PRAFIX_MAPPING.mehrfach[praefix];
                
                const passendeVarianten = varianten.filter(v => 
                    v.toLowerCase().startsWith(inputLower)
                );
                
                if (passendeVarianten.length > 0) {
                    return {
                        typ: 'mehrfach',
                        wert: passendeVarianten
                    };
                }
            }
        }
        
        return null;
    }

    // Fuzzy-Matching mit bereinigter Eingabe
    function findeBesteFuzzyMatches(input) {
        input = bereinigeStrassenEingabe(input);
        
        if (!input || input.length < 3) return [];

        const inputOhneNr = extrahiereStrassenname(input);
        const userHausnummer = extraiereHausnummer(input);

        const matches = [];
        const threshold = Math.ceil(inputOhneNr.length * 0.3);

        for (const strasse of STRASSEN_KATALOG) {
            const strasseOhneNr = extrahiereStrassenname(strasse);
            const distance = levenshteinDistance(inputOhneNr, strasseOhneNr);

            if (distance <= threshold) {
                matches.push({ text: strasse, distance });
            }
        }

        if (matches.length === 0) return [];

        matches.sort((a, b) => a.distance - b.distance);

        if (userHausnummer) {
            const uniqueStrassen = new Set(matches.map(m => extrahiereStrassenname(m.text)));
            
            if (uniqueStrassen.size === 1) {
                const alleVarianten = matches.map(m => m.text);
                const passendeVariante = alleVarianten.find(v => v.includes(userHausnummer));
                
                if (!passendeVariante) {
                    const basisStrasse = Array.from(uniqueStrassen)[0];
                    return [`${basisStrasse} ${userHausnummer}`];
                }
                
                return [passendeVariante];
            }
        }

        return matches.map(m => m.text);
    }

    // Autovervollständigung anzeigen + DocuWare verstecken
    function zeigeStrassenAutovervollstaendigung(inputField, vorschlag) {
        const currentValue = bereinigeStrassenEingabe(inputField.value);
        inputField.value = vorschlag;
        inputField.setSelectionRange(currentValue.length, vorschlag.length);
        strassenAutoVervollstaendigungAktiv = true;
        versteckeDocuWareAutocomplete();
    }

    // Dropdown erstellen + DocuWare verstecken
    function zeigeStrassenDropdown(inputField, optionen) {
        entferneStrassenDropdown();
        selectedStrassenIndex = 0;
        versteckeDocuWareAutocomplete();

        const dropdown = document.createElement('div');
        dropdown.className = 'strassen-autocomplete-dropdown';
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
            item.className = 'strassen-dropdown-item';
            item.textContent = option;
            item.style.cssText = `
                padding: 10px 14px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: all 0.2s;
                font-size: 13px;
            `;

            item.addEventListener('mouseenter', () => {
                selectedStrassenIndex = index;
                markiereStrassenAuswahl(dropdown, selectedStrassenIndex);
            });

            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                inputField.value = option;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                entferneStrassenDropdown();
                fokussiereNaechstesStrassenFeld(inputField);
            });

            if (index === optionen.length - 1) item.style.borderBottom = 'none';
            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);
        activeStrassenDropdown = { dropdown, inputField, optionen };
        markiereStrassenAuswahl(dropdown, selectedStrassenIndex);

        setTimeout(() => inputField.focus(), 0);
        setTimeout(() => document.addEventListener('click', handleStrassenOutsideClick), 100);
    }

    // Auswahl markieren
    function markiereStrassenAuswahl(dropdown, index) {
        const items = dropdown.querySelectorAll('.strassen-dropdown-item');
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

    // Dropdown entfernen
    function entferneStrassenDropdown() {
        const existing = document.querySelector('.strassen-autocomplete-dropdown');
        if (existing) {
            existing.remove();
            document.removeEventListener('click', handleStrassenOutsideClick);
        }
        activeStrassenDropdown = null;
    }

    // Außen-Klick behandeln
    function handleStrassenOutsideClick(e) {
        if (!e.target.closest('.strassen-autocomplete-dropdown')) {
            entferneStrassenDropdown();
        }
    }

    // Nächstes Feld fokussieren
    function fokussiereNaechstesStrassenFeld(currentField) {
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

    // Tastatursteuerung
    function handleStrassenKeyDown(e) {
        // Lösch-Aktion erkennen
        if (e.key === 'Backspace' || e.key === 'Delete') {
            letzteStrassenLoeschAktion = Date.now();
            strassenAutoVervollstaendigungAktiv = false;
            
            if (strassenLoeschBlockadeTimeout) clearTimeout(strassenLoeschBlockadeTimeout);
            
            strassenLoeschBlockadeTimeout = setTimeout(() => {
                letzteStrassenLoeschAktion = 0;
            }, 500);
            
            if (strassenAutoVervollstaendigungAktiv) {
                const cursorPos = e.target.selectionStart;
                e.target.setSelectionRange(cursorPos, cursorPos);
            }
            return;
        }

        // Tab bei Autovervollständigung mit DocuWare-Blockierung
        if (e.key === 'Tab' && strassenAutoVervollstaendigungAktiv && !activeStrassenDropdown) {
            e.preventDefault();
            strassenAutoVervollstaendigungAktiv = false;
            e.target.setSelectionRange(e.target.value.length, e.target.value.length);
            blockiereDocuWareTemporaer(800);
            return;
        }

        if (!activeStrassenDropdown) return;

        const { dropdown, inputField, optionen } = activeStrassenDropdown;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedStrassenIndex = (selectedStrassenIndex + 1) % optionen.length;
                markiereStrassenAuswahl(dropdown, selectedStrassenIndex);
                versteckeDocuWareAutocomplete();
                break;

            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedStrassenIndex = (selectedStrassenIndex - 1 + optionen.length) % optionen.length;
                markiereStrassenAuswahl(dropdown, selectedStrassenIndex);
                versteckeDocuWareAutocomplete();
                break;

            case 'Tab':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedStrassenIndex = (selectedStrassenIndex + 1) % optionen.length;
                markiereStrassenAuswahl(dropdown, selectedStrassenIndex);
                versteckeDocuWareAutocomplete();
                break;

            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const selectedValue = optionen[selectedStrassenIndex];
                inputField.value = selectedValue;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                entferneStrassenDropdown();
                fokussiereNaechstesStrassenFeld(inputField);
                blockiereDocuWareTemporaer(800);
                break;

            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                entferneStrassenDropdown();
                break;
        }
    }

    // Input-Handler mit Sternchen-Entfernung
    function handleStrassenInput(e) {
        const inputField = e.target;
        let value = inputField.value;
        
        // Sternchen entfernen
        if (value.startsWith('*') || value.startsWith(' *')) {
            const bereinigtValue = bereinigeStrassenEingabe(value);
            inputField.value = bereinigtValue;
            value = bereinigtValue;
        }
        
        // Blockade nach Lösch-Aktion
        const zeitSeitLetzterLoeschung = Date.now() - letzteStrassenLoeschAktion;
        if (zeitSeitLetzterLoeschung < 500) {
            strassenAutoVervollstaendigungAktiv = false;
            entferneStrassenDropdown();
            return;
        }
        
        if (!value || value.length < 3) {
            strassenAutoVervollstaendigungAktiv = false;
            entferneStrassenDropdown();
            return;
        }

        const schnellerMatch = findeSchnelleStrassenAutovervollstaendigung(value);
        
        if (schnellerMatch) {
            if (schnellerMatch.typ === 'eindeutig') {
                entferneStrassenDropdown();
                zeigeStrassenAutovervollstaendigung(inputField, schnellerMatch.wert);
            } else if (schnellerMatch.typ === 'mehrfach') {
                strassenAutoVervollstaendigungAktiv = false;
                zeigeStrassenDropdown(inputField, schnellerMatch.wert);
            }
        } else {
            strassenAutoVervollstaendigungAktiv = false;
            entferneStrassenDropdown();
        }
    }

    // ÄNDERUNG: Blur-Handler mit Exakt-Check
    function handleStrassenBlur(e) {
        const inputField = e.target;
        
        setTimeout(() => {
            if (activeStrassenDropdown) return;
            
            strassenAutoVervollstaendigungAktiv = false;
            
            let value = inputField.value;
            if (!value) return;

            // NEU: Wenn bereits exakter Katalogeintrag, nichts tun
            if (istExakterKatalogEintrag(value)) {
                return;
            }

            value = kuerzeStrassenname(value);
            const alleMatches = findeBesteFuzzyMatches(value);

            if (alleMatches.length > 1) {
                zeigeStrassenDropdown(inputField, alleMatches);
            } else if (alleMatches.length === 1 && alleMatches[0] !== value) {
                inputField.value = alleMatches[0];
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 200);
    }

    // Feld identifizieren
    function istStrassenObjektFeld(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        return /^objekt\b/i.test(label.textContent.trim());
    }

    // Handler anhängen
    function attachStrassenHandler(inputField) {
        if (inputField.dataset.strassenObjektAttached) return;
        if (!istStrassenObjektFeld(inputField)) return;

        inputField.addEventListener('input', handleStrassenInput);
        inputField.addEventListener('blur', handleStrassenBlur);
        inputField.addEventListener('keydown', handleStrassenKeyDown, true);
        inputField.dataset.strassenObjektAttached = 'true';
    }

    // Scannen
    function scanStrassen() {
        document.querySelectorAll('input.dw-textField').forEach(attachStrassenHandler);
    }

    const strassenObserver = new MutationObserver(scanStrassen);
    strassenObserver.observe(document.body, { subtree: true, childList: true });
    scanStrassen();

})(); 



