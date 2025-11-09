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

    // Präfix-Mappings beim Start berechnen
    const PRAFIX_MAPPING = strassenBerechnePrafixMapping();

    // Straßen nach Basisnamen gruppieren
    const strassenGruppen = strassenAnalysiereStrassen();

    // Globale Variablen mit Namespace
    let strassenActiveDropdown = null;
    let strassenSelectedIndex = 0;
    let strassenWertDurchDropdownGesetzt = false;
    let strassenAutoVervollstaendigungAktiv = false;

    // Präfix-Mapping mit eindeutigen UND mehrfachen Straßen
    function strassenBerechnePrafixMapping() {
        const eindeutigMapping = {};
        const mehrfachMapping = {};
        const basisnamenGruppen = {};
        
        STRASSEN_KATALOG.forEach(strasse => {
            const basisname = strassenExtrahiereStrassenname(strasse);
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

    // Straßen analysieren und gruppieren
    function strassenAnalysiereStrassen() {
        const gruppen = {};
        
        STRASSEN_KATALOG.forEach(strasse => {
            const basisname = strassenExtrahiereStrassenname(strasse);
            if (!gruppen[basisname.toLowerCase()]) {
                gruppen[basisname.toLowerCase()] = [];
            }
            gruppen[basisname.toLowerCase()].push(strasse);
        });
        
        return gruppen;
    }

    // Intelligente Suche mit kontinuierlicher Autovervollständigung
    function strassenFindeSchnelleAutovervollstaendigung(input) {
        if (!input || input.length < 3) return null;
        
        const inputLower = input.toLowerCase().trim();
        
        if (PRAFIX_MAPPING.eindeutig[inputLower]) {
            return {
                typ: 'eindeutig',
                wert: PRAFIX_MAPPING.eindeutig[inputLower]
            };
        }
        
        if (PRAFIX_MAPPING.mehrfach[inputLower]) {
            return {
                typ: 'mehrfach',
                wert: PRAFIX_MAPPING.mehrfach[inputLower]
            };
        }
        
        for (const praefix in PRAFIX_MAPPING.eindeutig) {
            if (praefix.startsWith(inputLower) && inputLower.length >= 3) {
                return {
                    typ: 'eindeutig',
                    wert: PRAFIX_MAPPING.eindeutig[praefix]
                };
            }
        }
        
        for (const praefix in PRAFIX_MAPPING.mehrfach) {
            if (praefix.startsWith(inputLower) && inputLower.length >= 3) {
                return {
                    typ: 'mehrfach',
                    wert: PRAFIX_MAPPING.mehrfach[praefix]
                };
            }
        }
        
        for (const praefix in PRAFIX_MAPPING.eindeutig) {
            if (inputLower.startsWith(praefix)) {
                const strasseVollstaendig = PRAFIX_MAPPING.eindeutig[praefix];
                const strasseLower = strasseVollstaendig.toLowerCase();
                
                if (strasseLower.startsWith(inputLower)) {
                    return {
                        typ: 'eindeutig',
                        wert: strasseVollstaendig
                    };
                }
            }
        }
        
        for (const praefix in PRAFIX_MAPPING.mehrfach) {
            if (inputLower.startsWith(praefix)) {
                const varianten = PRAFIX_MAPPING.mehrfach[praefix];
                
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

    // Autovervollständigung anzeigen
    function strassenZeigeAutovervollstaendigung(inputField, vorschlag) {
        const currentValue = inputField.value;
        
        inputField.value = vorschlag;
        inputField.setSelectionRange(currentValue.length, vorschlag.length);
        
        strassenAutoVervollstaendigungAktiv = true;
    }

    // DocuWare Autocomplete-Modal verstecken
    function strassenVersteckeDocuWareAutocomplete() {
        const modals = document.querySelectorAll('.dw-autocompleteColumnContainer');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Observer für DocuWare Modals
    const strassenModalObserver = new MutationObserver(() => {
        if (strassenWertDurchDropdownGesetzt) {
            strassenVersteckeDocuWareAutocomplete();
        }
    });

    strassenModalObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    // Levenshtein-Distanz für Fuzzy Matching
    function strassenLevenshteinDistance(str1, str2) {
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

    // Straßenname ohne Hausnummer extrahieren
    function strassenExtrahiereStrassenname(text) {
        return text.replace(/\s+\d+.*$/, '').trim();
    }

    // Prüfen ob Katalogeintrag Hausnummer enthält
    function strassenHatHausnummer(text) {
        return /\s+\d+/.test(text);
    }

    // Hausnummer extrahieren
    function strassenExtraiereHausnummer(text) {
        const match = text.match(/\s+(\d+.*?)$/);
        return match ? match[1] : '';
    }

    // Exakte Übereinstimmung prüfen
    function strassenFindeExakteUebereinstimmung(input) {
        const inputNormalized = input.trim().toLowerCase();
        
        for (const strasse of STRASSEN_KATALOG) {
            if (strasse.toLowerCase() === inputNormalized) {
                return strasse;
            }
        }
        return null;
    }

    // Intelligente Match-Suche
    function strassenFindBestMatches(input) {
        if (!input || input.length < 3) return [];

        const inputOhneNr = strassenExtrahiereStrassenname(input);
        const userHausnummer = strassenExtraiereHausnummer(input);

        if (userHausnummer) {
            const exakt = strassenFindeExakteUebereinstimmung(input);
            if (exakt) {
                return [exakt];
            }
        }

        const matches = [];
        const threshold = Math.ceil(inputOhneNr.length * 0.3);

        for (const strasse of STRASSEN_KATALOG) {
            const strasseOhneNr = strassenExtrahiereStrassenname(strasse);
            const distance = strassenLevenshteinDistance(inputOhneNr, strasseOhneNr);

            if (distance <= threshold) {
                matches.push({ text: strasse, distance });
            }
        }

        if (matches.length === 0) return [];

        matches.sort((a, b) => a.distance - b.distance);

        if (userHausnummer) {
            const uniqueStrassen = new Set(matches.map(m => strassenExtrahiereStrassenname(m.text)));
            
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

    // Nächstes Input-Feld finden und fokussieren
    function strassenFokussiereNaechstesFeld(currentField) {
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

    // Auswahl im Dropdown hervorheben
    function strassenMarkiereAuswahl(dropdown, index) {
        const items = dropdown.querySelectorAll('.strassen-dropdown-item-' + STRASSEN_NS);
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

    // Dropdown erstellen
    function strassenZeigeDropdown(inputField, optionen) {
        strassenEntferneDropdown();
        strassenSelectedIndex = 0;

        const dropdown = document.createElement('div');
        dropdown.className = 'strassen-dropdown-container-' + STRASSEN_NS;
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
            item.className = 'strassen-dropdown-item-' + STRASSEN_NS;
            item.textContent = option;
            item.style.cssText = `
                padding: 10px 14px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: all 0.2s;
            `;

            item.addEventListener('mouseenter', () => {
                strassenSelectedIndex = index;
                strassenMarkiereAuswahl(dropdown, strassenSelectedIndex);
            });

            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                strassenWertDurchDropdownGesetzt = true;
                strassenVersteckeDocuWareAutocomplete();
                
                inputField.value = option;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                strassenEntferneDropdown();
                
                setTimeout(() => {
                    strassenVersteckeDocuWareAutocomplete();
                }, 50);
                
                strassenFokussiereNaechstesFeld(inputField);
                
                setTimeout(() => {
                    strassenWertDurchDropdownGesetzt = false;
                }, 500);
            });

            if (index === optionen.length - 1) {
                item.style.borderBottom = 'none';
            }

            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);
        strassenActiveDropdown = { dropdown, inputField, optionen };
        strassenMarkiereAuswahl(dropdown, strassenSelectedIndex);

        setTimeout(() => {
            inputField.focus();
        }, 0);

        setTimeout(() => {
            document.addEventListener('click', strassenHandleOutsideClick);
        }, 100);
    }

    // Dropdown entfernen
    function strassenEntferneDropdown() {
        const existing = document.querySelector('.strassen-dropdown-container-' + STRASSEN_NS);
        if (existing) {
            existing.remove();
            document.removeEventListener('click', strassenHandleOutsideClick);
        }
        strassenActiveDropdown = null;
    }

    // Klick außerhalb behandeln
    function strassenHandleOutsideClick(e) {
        if (!e.target.closest('.strassen-dropdown-container-' + STRASSEN_NS)) {
            strassenEntferneDropdown();
        }
    }

    // Tastatursteuerung
    function strassenHandleKeyDown(e) {
        if (e.key === 'Tab' && strassenAutoVervollstaendigungAktiv && !strassenActiveDropdown) {
            e.preventDefault();
            strassenAutoVervollstaendigungAktiv = false;
            e.target.setSelectionRange(e.target.value.length, e.target.value.length);
            return;
        }

        if (!strassenActiveDropdown) return;

        const { dropdown, inputField, optionen } = strassenActiveDropdown;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                strassenSelectedIndex = (strassenSelectedIndex + 1) % optionen.length;
                strassenMarkiereAuswahl(dropdown, strassenSelectedIndex);
                break;

            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                strassenSelectedIndex = (strassenSelectedIndex - 1 + optionen.length) % optionen.length;
                strassenMarkiereAuswahl(dropdown, strassenSelectedIndex);
                break;

            case 'Tab':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                strassenSelectedIndex = (strassenSelectedIndex + 1) % optionen.length;
                strassenMarkiereAuswahl(dropdown, strassenSelectedIndex);
                break;

            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                strassenWertDurchDropdownGesetzt = true;
                strassenVersteckeDocuWareAutocomplete();
                
                const selectedValue = optionen[strassenSelectedIndex];
                inputField.value = selectedValue;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                
                strassenEntferneDropdown();
                
                setTimeout(() => {
                    strassenVersteckeDocuWareAutocomplete();
                }, 50);
                
                strassenFokussiereNaechstesFeld(inputField);
                
                setTimeout(() => {
                    strassenWertDurchDropdownGesetzt = false;
                }, 500);
                break;

            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                strassenEntferneDropdown();
                break;
        }
    }

    function strassenFeldIstObjekt(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        return /^objekt\b/i.test(label.textContent.trim());
    }

    function strassenKuerzeStrassenname(text) {
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

    // Live-Autovervollständigung mit kontinuierlicher Unterstützung
    function strassenHandleInput(e) {
        const inputField = e.target;
        let value = inputField.value;
        
        if (!value || value.length < 3) {
            strassenAutoVervollstaendigungAktiv = false;
            strassenEntferneDropdown();
            return;
        }

        const schnellerMatch = strassenFindeSchnelleAutovervollstaendigung(value);
        
        if (schnellerMatch) {
            if (schnellerMatch.typ === 'eindeutig') {
                strassenEntferneDropdown();
                strassenZeigeAutovervollstaendigung(inputField, schnellerMatch.wert);
            } else if (schnellerMatch.typ === 'mehrfach') {
                strassenAutoVervollstaendigungAktiv = false;
                strassenZeigeDropdown(inputField, schnellerMatch.wert);
            }
        } else {
            strassenAutoVervollstaendigungAktiv = false;
            strassenEntferneDropdown();
        }
    }

    // Intelligente Verarbeitung bei Blur
    function strassenVerarbeiteEingabe(inputField) {
        if (strassenWertDurchDropdownGesetzt) return;
        
        strassenAutoVervollstaendigungAktiv = false;
        
        let value = inputField.value;
        if (!value) return;

        value = strassenKuerzeStrassenname(value);
        const alleMatches = strassenFindBestMatches(value);

        if (alleMatches.length > 1) {
            strassenZeigeDropdown(inputField, alleMatches);
        } else if (alleMatches.length === 1 && alleMatches[0] !== value) {
            inputField.value = alleMatches[0];
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function strassenAttachHandler(inputField) {
        if (inputField.dataset['strassenAbkuerzungAttached' + STRASSEN_NS]) return;
        if (!strassenFeldIstObjekt(inputField)) return;

        inputField.addEventListener('input', strassenHandleInput);

        inputField.addEventListener('blur', function (e) {
            setTimeout(() => {
                if (!strassenActiveDropdown && !strassenWertDurchDropdownGesetzt) {
                    strassenVerarbeiteEingabe(this);
                }
            }, 200);
        });

        inputField.addEventListener('keydown', strassenHandleKeyDown, true);

        inputField.dataset['strassenAbkuerzungAttached' + STRASSEN_NS] = 'true';
    }

    function strassenScan() {
        document.querySelectorAll('input.dw-textField').forEach(strassenAttachHandler);
    }

    const strassenObs = new MutationObserver(strassenScan);
    strassenObs.observe(document.body, { subtree: true, childList: true });
    strassenScan();
})();
