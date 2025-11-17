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


    let activeDokTypDropdown = null;
    let selectedDokTypIndex = 0;
    let letzteLoeschAktion = 0;
    const attachedFields = new WeakSet();

    function bereinigeEingabe(input) {
        if (!input) return '';
        return input.replace(/^[\s*]+/, '').trim();
    }

    function findeDokumententypMatch(input) {
        input = bereinigeEingabe(input);
        if (!input || input.length < 2) return null;
        const inputLower = input.toLowerCase().trim();
        const inputTeile = inputLower.split(/\s+/).filter(t => t.length > 0);

        let matches = DOKUMENTENTYP_KATALOG.filter(typ =>
            inputTeile.every(teil => typ.toLowerCase().includes(teil))
        );

        if (matches.length === 1) return { typ: 'eindeutig', wert: matches[0] };
        // ÄNDERUNG: Limit von 10 auf 20 erhöht
        if (matches.length > 1 && matches.length <= 35) return { typ: 'mehrfach', wert: matches };

        const prefixMatches = DOKUMENTENTYP_KATALOG.filter(typ =>
            typ.toLowerCase().startsWith(inputLower)
        );
        if (prefixMatches.length === 1) return { typ: 'eindeutig', wert: prefixMatches[0] };
        // ÄNDERUNG: Limit von 10 auf 20 erhöht
        if (prefixMatches.length > 1 && prefixMatches.length <= 35) return { typ: 'mehrfach', wert: prefixMatches };

        // ÄNDERUNG: Zeige erste 20 statt 10
        if (matches.length > 35) {
            return { typ: 'mehrfach', wert: matches.slice(0, 35), mehr: true, total: matches.length };
        }

        return null;
    }

    function zeigeDropdown(inputField, optionenMeta) {
        entferneDropdown();
        selectedDokTypIndex = 0;

        document.querySelectorAll('.dw-MultiControlList').forEach(el => el.style.display = 'none');

        const dropdown = document.createElement('div');
        dropdown.className = 'dokumententyp-dropdown';
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
            .dokumententyp-dropdown::-webkit-scrollbar { width: 8px; }
            .dokumententyp-dropdown::-webkit-scrollbar-track { background: #e6edf6; border-radius: 4px; }
            .dokumententyp-dropdown::-webkit-scrollbar-thumb { background: #4b70a6; border-radius: 4px; }
            .dokumententyp-dropdown::-webkit-scrollbar-thumb:hover { background: #3d5a87; }
        `;
        if (!document.getElementById('doktyp-scrollbar-style')) {
            style.id = 'doktyp-scrollbar-style';
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
            item.className = 'dropdown-item';
            item.textContent = option;
            item.style.cssText = `
                padding: 2px 12px;
                cursor: pointer;
                border-bottom: 1px solid #e6edf6;
                font-size: 13px;
                transition: background 0.14s;
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
        activeDokTypDropdown = { dropdown, inputField, optionen };
        markiereAuswahl(dropdown, selectedDokTypIndex);

        // ÄNDERUNG: Fokus bleibt im Input-Feld
        setTimeout(() => {
            inputField.focus();
            // ÄNDERUNG: Cursor ans Ende setzen
            inputField.setSelectionRange(inputField.value.length, inputField.value.length);
        }, 0);

        setTimeout(() => document.addEventListener('click', handleOutsideClick), 100);
    }

    function markiereAuswahl(dropdown, index) {
        const items = dropdown.querySelectorAll('.dropdown-item');
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

    function entferneDropdown() {
        const existing = document.querySelector('.dokumententyp-dropdown');
        if (existing) existing.remove();
        document.querySelectorAll('.dw-MultiControlList').forEach(el => el.style.display = '');
        document.removeEventListener('click', handleOutsideClick);
        activeDokTypDropdown = null;
    }

    function handleOutsideClick(e) {
        if (!e.target.closest('.dokumententyp-dropdown')) entferneDropdown();
    }

    // ÄNDERUNG: Keydown-Handler erlaubt Weiterschreiben
    function handleKeyDown(e) {
        if (!activeDokTypDropdown) return;

        const { dropdown, inputField, optionen } = activeDokTypDropdown;
        const items = dropdown.querySelectorAll('.dropdown-item');

        const navigationKeys = ['ArrowDown', 'ArrowUp', 'Tab', 'Enter', 'Escape'];

        if (!navigationKeys.includes(e.key)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (!items || items.length === 0) return;

        const gotoIndex = (idx) => {
            selectedDokTypIndex = (idx + items.length) % items.length;
            markiereAuswahl(dropdown, selectedDokTypIndex);
        };

        if (e.key === 'ArrowDown') {
            gotoIndex(selectedDokTypIndex + 1);
            return;
        }
        if (e.key === 'ArrowUp') {
            gotoIndex(selectedDokTypIndex - 1);
            return;
        }

        if (e.key === 'Tab') {
            if (e.shiftKey) gotoIndex(selectedDokTypIndex - 1);
            else gotoIndex(selectedDokTypIndex + 1);
            return;
        }

        if (e.key === 'Enter') {
            const chosen = optionen[selectedDokTypIndex];
            if (chosen) {
                inputField.value = chosen;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                entferneDropdown();
                suppressDocuWareDropdown(inputField); // ÄNDERUNG: inputField übergeben
                fokussiereNaechstesFeld(inputField);
            }
        }

        if (e.key === 'Escape') {
            entferneDropdown();
        }
    }

    function suppressDocuWareDropdown(inputField) {
        if (!inputField || !istDokumententypFeld(inputField)) return;

        const dwDropdown = document.querySelector('.dw-autocompleteColumnContainer, .dw-scroll-content.scroll-content');
        if (dwDropdown) {
            dwDropdown.style.display = 'none';
            dwDropdown.setAttribute('data-suppressed', 'true');
            const koData = ko?.dataFor?.(dwDropdown);
            if (koData?.visible) koData.visible(false);
        }
    }

    function handleInput(e) {
        const inputField = e.target;

        if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
            letzteLoeschAktion = Date.now();
            entferneDropdown();
            if (inputField.value.trim() === '') {
                inputField.value = '';
                return;
            }
        }

        let value = bereinigeEingabe(inputField.value);
        inputField.value = value;

        const zeitSeitLetzterLoeschung = Date.now() - letzteLoeschAktion;
        if (zeitSeitLetzterLoeschung < 400 || value.length < 2) {
            entferneDropdown();
            return;
        }

        const match = findeDokumententypMatch(value);
        if (match) {
            if (match.typ === 'eindeutig') {
                inputField.value = match.wert;
                setTimeout(() => {
                    inputField.setSelectionRange(match.wert.length, match.wert.length);
                }, 10);
                entferneDropdown();
            } else if (match.typ === 'mehrfach') {
                // ÄNDERUNG: Dropdown zeigen, aber Input-Fokus behalten
                zeigeDropdown(inputField, match.wert);
            }
        } else entferneDropdown();
    }

    function istDokumententypFeld(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        const labelText = label.textContent.trim().toLowerCase();

        // ÄNDERUNG: Präzise Prüfung auf Dokumententyp-Felder
        return labelText.startsWith('dokumententyp') ||
            labelText.startsWith('dokumentenart') ||
            labelText.startsWith('dokumentenunterart') ||
            labelText === 'dokumententyp' ||
            labelText === 'dokumentenart' ||
            labelText === 'dokumentenunterart' ||
            labelText.includes('dokumententyp (') ||
            labelText.includes('dokumentenart (') ||
            labelText.includes('dokumentenunterart (');
    }

    function fokussiereNaechstesFeld(currentField) {
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

    function attachHandler(inputField) {
        if (attachedFields.has(inputField)) return;
        if (!istDokumententypFeld(inputField)) return;

        inputField.addEventListener('input', handleInput);
        inputField.addEventListener('keydown', handleKeyDown, true);
        attachedFields.add(inputField);
    }

    function scan() {
        document.querySelectorAll('input.dw-textField').forEach(attachHandler);
    }

    let observerTimeout;
    const observer = new MutationObserver(() => {
        clearTimeout(observerTimeout);
        observerTimeout = setTimeout(() => {
            // suppressDocuWareDropdown(); // ENTFERNT - nicht mehr global aufrufen
            scan();
        }, 150);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    scan();

})();

