(function () {
    // NEU: Dokumententyp-Katalog
    const DOKUMENTENTYP_KATALOG = [
        'Angebot',
        'Anleitung (Ablaufbeschreibung)',
        'Anmeldung',
        'Antrag - Sonstige',
        'Anwesenheitsliste',
        'Aushang',
        'Ausweisdokument',
        'Baugenehmigung',
        'Bedienungsanleitung / Produktblatt',
        'Bericht - Abnahme & Übergabeprotokoll',
        'Bericht - Abnahme- & Übergabeprotokoll',
        'Bericht - Abnahmeprotokoll',
        'Bericht - Brandschutzgutachten',
        'Bericht - Gefährdungsbeurteilung (Aufzug)',
        'Bericht - Gutachten (Sonstige)',
        'Bericht - Leckageortung',
        'Bericht - Prüfung',
        'Bericht - Regiebericht',
        'Bericht - Schadenaufnahme',
        'Bericht - Übergabeprotokoll',
        'Bericht - Wartung',
        'Bericht (Sonstige)',
        'Bescheid (Sonstiges)',
        'Beschlusssammlung',
        'Bild',
        'Brief',
        'Dauermietrechnung',
        'Einheitswertbescheid',
        'Einladung zur Eigentümerversammlung',
        'Einzelwirtschaftsplan',
        'E-Mail',
        'Energieausweis',
        'Exposé',
        'Fax',
        'Flächenberechnung',
        'Freistellungsbescheinigung',
        'Geräteübersicht',
        'Grundbuchauszug',
        'Grundsteuermessbescheid',
        'Heizkostenabrechnung',
        'Heizkostenaufstellung',
        'Infoschreiben',
        'Inventory List',
        'Jahresabrechnung',
        'Kautionsabrechnung',
        'Kautionseinzahlungsbestätigung',
        'KautionsENDabrechnung',
        'KautionsTEILabrechnung',
        'Kautionsunterlagen',
        'Kündigungsbestätigung',
        'Leistungsverzeichnis',
        'Lieferschein',
        'Mängelmeldung',
        'Mängelmeldung von Mieter',
        'Meldung',
        'Mietenspiegel',
        'Mieterakte (Sauer Immobilien)',
        'Mieterselbstauskunft',
        'Mietkürzung / Mietminderung',
        'Mietschuldenfreiheitsbescheinigung',
        'Monatsabrechnung',
        'Monatsabrechnung / Hausabrechnung',
        'Nebenkosten- / Betriebskostenabrechnung',
        'Nebenkostenabrechnung',
        'Nebenkosten-Einzelabrechnung',
        'Nebenkosten-Gesamtabrechnung',
        'noch nicht bestimmt',
        'Notiz - Allgemein',
        'Oposliste',
        'Plan - Ansicht',
        'Plan - Dachbodenbelegungsplan',
        'Plan - Entwässerungsplan',
        'Plan - Fluchtwegplan',
        'Plan - Flurkarte / Katasterauszug',
        'Plan - Freiflächenplan',
        'Plan - Grundriss',
        'Plan - Kellerbelegungsplan',
        'Plan - Räumplan (Winterdienst)',
        'Plan - Sonstiges',
        'Plan - Stellplatzbelegungsplan',
        'Protokoll der Eigentümerversammlung',
        'Rechnung (eingehend)',
        'Rundschreiben',
        'Schließplan',
        'Schlüsselkarte',
        'Schlüsselquittung',
        'Schnellaufgabe',
        'Selbstauskunft (Mieterbewerbung)',
        'SEPA-Lastschriftmandat',
        'Sonstige',
        'Sonstiges Dokument',
        'Teilungserklärung',
        'Terminankündigung',
        'Testdokument',
        'tmp_Zählermeldung',
        'Umlaufbeschluss',
        'Urlaubsantrag',
        'Verkäuferabrechnung',
        'Vermieterbescheinigung',
        'Verrechnung',
        'Vertrag - Abmahnung',
        'Vertrag - Abmeldebestätigung',
        'Vertrag - Aufhebungsvereinbarung',
        'Vertrag - Auftragsbestätigung',
        'Vertrag - Auftragserteilung',
        'Vertrag - Bauvertrag',
        'Vertrag - Bürgschaft',
        'Vertrag - Dienstleistungsvertrag',
        'Vertrag - DSGVO',
        'Vertrag - Einspruch / Widerspruch',
        'Vertrag - Energieversorgung',
        'Vertrag - Indexmieterhöhung',
        'Vertrag - Kaufvertrag',
        'Vertrag - Kündigung',
        'Vertrag - Kündigungsbestätigung',
        'Vertrag - Mieterhöhungsverlangen',
        'Vertrag - Mietvertrag (Gewerbe)',
        'Vertrag - Mietvertrag (Keller, Lager)',
        'Vertrag - Mietvertrag (Stellplatz)',
        'Vertrag - Mietvertrag (Wohnung)',
        'Vertrag - Nachtrag',
        'Vertrag - Preisanpassungsschreiben',
        'Vertrag - Ratenzahlungsvereinbarung',
        'Vertrag - Sonstige',
        'Vertrag - Übernahmeerklärung',
        'Vertrag - Versicherungspolice',
        'Vertrag - Vertrag (Sonstige)',
        'Vertrag - Vertragsbestätigung',
        'Vertrag - Vertragsentwurf',
        'Vertrag - Verwaltervertrag',
        'Vertrag - Zustimmung Mieterhöhungsverlangen',
        'Vollmacht - Sonstige',
        'Vollmacht - Verwaltervollmacht',
        'Vorgangsblatt',
        'Vorgangsblatt - Kündigung (eingehend)',
        'WEG Einladung',
        'Wirtschaftsplan (WEG)',
        'Wohnflächenberechnung',
        'Wohngeldabrechnung',
        'Wohnraumbestätigung',
        'Wohnungsgeberbestätigung',
        'Zähler- / Ablesekarte',
        'Zahlungserinnerung / Mahnung'
    ];


    // NEU: Globale Variablen
    let activeDokTypDropdown = null;
    let selectedDokTypIndex = 0;
    let dokTypAutoVervollstaendigungAktiv = false;
    let letzteLoeschAktion = 0;
    let loeschBlockadeTimeout = null;

    // NEU: Sternchen entfernen
    function bereinigeEingabe(input) {
        if (!input) return '';
        return input.replace(/^[\s*]+/, '').trim();
    }

    // NEU: Intelligente Dokumententyp-Suche
    function findeDokumententypMatch(input) {
        input = bereinigeEingabe(input);
        
        if (!input || input.length < 3) return null;
        
        const inputLower = input.toLowerCase().trim();
        const inputTeile = inputLower.split(/\s+/).filter(t => t.length > 0);
        
        // 1. Multi-Word-Matching (alle Teile müssen vorkommen)
        if (inputTeile.length > 1) {
            const matches = DOKUMENTENTYP_KATALOG.filter(typ => {
                const typLower = typ.toLowerCase();
                return inputTeile.every(teil => typLower.includes(teil));
            });
            
            if (matches.length === 1) return { typ: 'eindeutig', wert: matches[0] };
            if (matches.length > 1 && matches.length <= 10) return { typ: 'mehrfach', wert: matches };
        }
        
        // 2. Teilstring-Suche
        const matches = DOKUMENTENTYP_KATALOG.filter(typ => 
            typ.toLowerCase().includes(inputLower)
        );
        
        if (matches.length === 1) return { typ: 'eindeutig', wert: matches[0] };
        if (matches.length > 1 && matches.length <= 10) return { typ: 'mehrfach', wert: matches };
        
        // 3. Prefix-Start-Suche
        const prefixMatches = DOKUMENTENTYP_KATALOG.filter(typ => 
            typ.toLowerCase().startsWith(inputLower)
        );
        
        if (prefixMatches.length === 1) return { typ: 'eindeutig', wert: prefixMatches[0] };
        if (prefixMatches.length > 1 && prefixMatches.length <= 10) return { typ: 'mehrfach', wert: prefixMatches };
        
        return null;
    }

    // NEU: Autovervollständigung anzeigen
    function zeigeAutovervollstaendigung(inputField, vorschlag) {
        const currentValue = bereinigeEingabe(inputField.value);
        inputField.value = vorschlag;
        inputField.setSelectionRange(currentValue.length, vorschlag.length);
        dokTypAutoVervollstaendigungAktiv = true;
    }

    // NEU: Dropdown erstellen
    function zeigeDropdown(inputField, optionen) {
        entferneDropdown();
        selectedDokTypIndex = 0;

        const dropdown = document.createElement('div');
        dropdown.className = 'dokumententyp-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            background: white;
            border: 2px solid #28a745;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-height: 300px;
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
                font-size: 13px;
            `;

            item.addEventListener('mouseenter', () => {
                selectedDokTypIndex = index;
                markiereAuswahl(dropdown, selectedDokTypIndex);
            });

            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                inputField.value = option;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                entferneDropdown();
                fokussiereNaechstesFeld(inputField);
            });

            if (index === optionen.length - 1) item.style.borderBottom = 'none';
            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);
        activeDokTypDropdown = { dropdown, inputField, optionen };
        markiereAuswahl(dropdown, selectedDokTypIndex);

        setTimeout(() => inputField.focus(), 0);
        setTimeout(() => document.addEventListener('click', handleOutsideClick), 100);
    }

    // NEU: Auswahl markieren
    function markiereAuswahl(dropdown, index) {
        const items = dropdown.querySelectorAll('.dropdown-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.style.background = '#28a745';
                item.style.color = 'white';
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.background = 'white';
                item.style.color = 'black';
            }
        });
    }

    // NEU: Dropdown entfernen
    function entferneDropdown() {
        const existing = document.querySelector('.dokumententyp-dropdown');
        if (existing) {
            existing.remove();
            document.removeEventListener('click', handleOutsideClick);
        }
        activeDokTypDropdown = null;
    }

    // NEU: Außen-Klick behandeln
    function handleOutsideClick(e) {
        if (!e.target.closest('.dokumententyp-dropdown')) {
            entferneDropdown();
        }
    }

    // NEU: Tastatursteuerung
    function handleKeyDown(e) {
        // ÄNDERUNG: Lösch-Aktion erkennen und blockieren
        if (e.key === 'Backspace' || e.key === 'Delete') {
            letzteLoeschAktion = Date.now();
            dokTypAutoVervollstaendigungAktiv = false;
            
            if (loeschBlockadeTimeout) clearTimeout(loeschBlockadeTimeout);
            
            loeschBlockadeTimeout = setTimeout(() => {
                letzteLoeschAktion = 0;
            }, 500);
            
            if (dokTypAutoVervollstaendigungAktiv) {
                const cursorPos = e.target.selectionStart;
                e.target.setSelectionRange(cursorPos, cursorPos);
            }
            return;
        }

        // Tab bei Autovervollständigung
        if (e.key === 'Tab' && dokTypAutoVervollstaendigungAktiv && !activeDokTypDropdown) {
            e.preventDefault();
            dokTypAutoVervollstaendigungAktiv = false;
            e.target.setSelectionRange(e.target.value.length, e.target.value.length);
            return;
        }

        if (!activeDokTypDropdown) return;

        const { dropdown, inputField, optionen } = activeDokTypDropdown;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedDokTypIndex = (selectedDokTypIndex + 1) % optionen.length;
                markiereAuswahl(dropdown, selectedDokTypIndex);
                break;

            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedDokTypIndex = (selectedDokTypIndex - 1 + optionen.length) % optionen.length;
                markiereAuswahl(dropdown, selectedDokTypIndex);
                break;

            case 'Tab':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                selectedDokTypIndex = (selectedDokTypIndex + 1) % optionen.length;
                markiereAuswahl(dropdown, selectedDokTypIndex);
                break;

            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const selectedValue = optionen[selectedDokTypIndex];
                inputField.value = selectedValue;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                entferneDropdown();
                fokussiereNaechstesFeld(inputField);
                break;

            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                entferneDropdown();
                break;
        }
    }

    // NEU: Input-Handler
    function handleInput(e) {
        const inputField = e.target;
        let value = inputField.value;
        
        // Sternchen entfernen
        if (value.startsWith('*') || value.startsWith(' *')) {
            const bereinigtValue = bereinigeEingabe(value);
            inputField.value = bereinigtValue;
            value = bereinigtValue;
        }
        
        // ÄNDERUNG: Blockade nach Lösch-Aktion
        const zeitSeitLetzterLoeschung = Date.now() - letzteLoeschAktion;
        if (zeitSeitLetzterLoeschung < 500) {
            dokTypAutoVervollstaendigungAktiv = false;
            entferneDropdown();
            return;
        }
        
        if (!value || value.length < 3) {
            dokTypAutoVervollstaendigungAktiv = false;
            entferneDropdown();
            return;
        }

        const match = findeDokumententypMatch(value);
        
        if (match) {
            if (match.typ === 'eindeutig') {
                entferneDropdown();
                zeigeAutovervollstaendigung(inputField, match.wert);
            } else if (match.typ === 'mehrfach') {
                dokTypAutoVervollstaendigungAktiv = false;
                zeigeDropdown(inputField, match.wert);
            }
        } else {
            dokTypAutoVervollstaendigungAktiv = false;
            entferneDropdown();
        }
    }

    // NEU: Feld identifizieren
    function istDokumententypFeld(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        const labelText = label.textContent.trim();
        return /^Dokumententyp\s*\(Unterart\)/i.test(labelText);
    }

    // NEU: Nächstes Feld fokussieren
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

    // NEU: Handler anhängen
    function attachHandler(inputField) {
        if (inputField.dataset.dokTypAttached) return;
        if (!istDokumententypFeld(inputField)) return;

        inputField.addEventListener('input', handleInput);
        inputField.addEventListener('keydown', handleKeyDown, true);
        inputField.dataset.dokTypAttached = 'true';
    }

    // NEU: Scannen
    function scan() {
        document.querySelectorAll('input.dw-textField').forEach(attachHandler);
    }

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { subtree: true, childList: true });
    scan();
})();