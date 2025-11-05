(function () {
    'use strict';
    const SEARCH_SCRIPT_ID = 'docuware-field-search-script';

    // Reset bei erneuter Ausführung
    if (window[SEARCH_SCRIPT_ID]) {
        console.log('🔄 DocuWare Field Search wird zurückgesetzt...');
        document.querySelectorAll('.dw-field-search-overlay, .dw-field-search-widget').forEach(el => el.remove());
        if (window[SEARCH_SCRIPT_ID].listeners) {
            window[SEARCH_SCRIPT_ID].listeners.forEach(({ element, event, handler }) => 
                element.removeEventListener(event, handler)
            );
        }
        delete window[SEARCH_SCRIPT_ID];
        console.log('✅ DocuWare Field Search zurückgesetzt');
    }

    window[SEARCH_SCRIPT_ID] = { listeners: [] };
    console.log('🚀 DocuWare Field Search wird initialisiert...');

    // ===== SUCHBARE FELDER KONFIGURATION =====
    const SEARCHABLE_FIELDS = {
        'dokumententyp': {
            searchTerms: ['dokumententyp', 'unterart', 'document type'],
            displayName: 'Dokumententyp (Unterart)'
        },
        'objekt': {
            searchTerms: ['objekt', 'object', 'haus', 'gebäude'],
            displayName: 'Objekt'
        },
        'portfolio': {
            searchTerms: ['portfolio'],
            displayName: 'Portfolio'
        },
        'bemerkungen': {
            searchTerms: ['bemerkungen', 'notiz', 'anmerkung'],
            displayName: 'Bemerkungen'
        },
        'erstellungsdatum': {
            searchTerms: ['erstellungsdatum', 'erstellt', 'creation date'],
            displayName: 'Erstellungsdatum'
        },
        'eingangsdatum': {
            searchTerms: ['eingangsdatum', 'eingang', 'receipt date'],
            displayName: 'Eingangsdatum'
        },
        'ausgangsdatum': {
            searchTerms: ['ausgangsdatum', 'ausgang', 'output date'],
            displayName: 'Ausgangsdatum'
        },
        'absender': {
            searchTerms: ['absender', 'firma', 'mieter', 'sender'],
            displayName: 'Absender (Firma, Mieter usw.)'
        },
        'aktivermieter': {
            searchTerms: ['aktiver mieter', 'mieter', 'tenant'],
            displayName: 'aktiver Mieter'
        },
        'betrifftmieter': {
            searchTerms: ['betrifft mieter', 'mieter'],
            displayName: 'betrifft Mieter'
        },
        'objekteinheitnummer': {
            searchTerms: ['objekt-einheit-nummer', 'einheit nummer', 'unit number'],
            displayName: 'Objekt-Einheit-Nummer'
        },
        'objekteinheitmietnummer': {
            searchTerms: ['objekt-einheit-miet-nummer', 'miet nummer', 'rental number'],
            displayName: 'Objekt-Einheit-Miet-Nummer'
        },
        'vnnummer': {
            searchTerms: ['vn-nummer', 'vn nummer', 'vnnummer'],
            displayName: 'VN-Nummer'
        },
        'betreff': {
            searchTerms: ['betreff', 'subject'],
            displayName: 'Betreff'
        },
        'thema': {
            searchTerms: ['thema', 'gewerk', 'topic'],
            displayName: 'Thema / Gewerk'
        },
        'empfaenger': {
            searchTerms: ['empfänger', 'recipient'],
            displayName: 'Empfänger (Firma, Mieter usw.)'
        },
        'bauteil': {
            searchTerms: ['bauteil', 'component'],
            displayName: 'Bauteil'
        },
        'vertragsnehmer': {
            searchTerms: ['vertragsnehmer', 'contractor'],
            displayName: 'Vertragsnehmer'
        },
        'vertragsgeber': {
            searchTerms: ['vertragsgeber', 'contracting party'],
            displayName: 'Vertragsgeber'
        },
        'nebenkosten': {
            searchTerms: ['nebenkosten', 'für nebenkosten relevant', 'ancillary costs'],
            displayName: 'für Nebenkosten relevant'
        },
        'wirtschaftsjahr': {
            searchTerms: ['wirtschaftsjahr', 'wirtschafts jahr', 'fiscal year'],
            displayName: 'Wirtschaftsjahr'
        },
        'zahlungsart': {
            searchTerms: ['zahlungsart', 'payment method'],
            displayName: 'Zahlungsart'
        },
        'wiedervorlage': {
            searchTerms: ['wiedervorlage', 'reminder', 'follow up'],
            displayName: 'Wiedervorlage'
        },
        'status': {
            searchTerms: ['status', 'zustand'],
            displayName: 'Status'
        }
    };

    // Event Listener Management
    const addTrackedEventListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        window[SEARCH_SCRIPT_ID].listeners.push({ element, event, handler });
    };

    // ===== CSS STYLES (DocuWare-Stil) =====
    const createStyles = () => {
        const styleElement = document.createElement('style');
        styleElement.setAttribute('data-dw-field-search', 'true');
        styleElement.textContent = `
            .dw-field-search-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.4);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .dw-field-search-widget {
                background: #ffffff;
                border: 1px solid #d0d0d0;
                border-radius: 3px;
                padding: 0;
                box-shadow: 0 3px 9px rgba(0, 0, 0, 0.2);
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                width: 420px;
                max-width: 90vw;
                max-height: 80vh;
                animation: slideDown 0.2s ease;
            }

            @keyframes slideDown {
                from { 
                    transform: translateY(-20px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
            }

            .dw-field-search-header {
                background: #f5f5f5;
                border-bottom: 1px solid #d0d0d0;
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .dw-field-search-title {
                font-weight: normal;
                color: #333;
                font-size: 12px;
                margin: 0;
            }

            .dw-field-search-close {
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
                color: #666;
                padding: 2px 6px;
                border-radius: 2px;
                transition: background-color 0.2s ease;
            }

            .dw-field-search-close:hover {
                background: #e0e0e0;
                color: #333;
            }

            .dw-field-search-content {
                padding: 12px;
            }

            .dw-field-search-input-container {
                position: relative;
                margin-bottom: 8px;
            }

            .dw-field-search-input {
                width: 100%;
                padding: 6px 8px;
                border: 1px solid #d0d0d0;
                border-radius: 2px;
                font-size: 12px;
                font-family: inherit;
                box-sizing: border-box;
                background: #ffffff;
                outline: none;
                transition: border-color 0.2s ease;
            }

            .dw-field-search-input:focus {
                border-color: #5c9ccc;
                box-shadow: 0 0 0 1px #5c9ccc;
            }

            .dw-field-search-clear {
                position: absolute;
                right: 6px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                color: #999;
                font-size: 14px;
                padding: 2px;
                display: none;
                border-radius: 2px;
            }

            .dw-field-search-clear:hover {
                background: #f0f0f0;
                color: #666;
            }

            .dw-field-search-suggestions {
                max-height: 180px;
                overflow-y: auto;
                border: 1px solid #d0d0d0;
                border-radius: 2px;
                background: white;
                display: none;
                margin-bottom: 8px;
            }

            .dw-field-search-suggestion {
                padding: 6px 8px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                font-size: 12px;
                color: #333;
                transition: background-color 0.1s ease;
            }

            .dw-field-search-suggestion:last-child {
                border-bottom: none;
            }

            .dw-field-search-suggestion:hover {
                background: #f0f8ff;
            }

            .dw-field-search-suggestion.highlighted {
                background: #e6f3ff;
                color: #0066cc;
            }

            .dw-field-search-info {
                font-size: 11px;
                color: #666;
                margin-bottom: 8px;
                line-height: 1.3;
            }

            .dw-field-search-shortcut {
                font-size: 10px;
                color: #999;
                text-align: center;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid #f0f0f0;
            }

            .dw-field-search-results {
                font-size: 11px;
                font-weight: normal;
                margin-top: 8px;
            }

            .dw-field-search-results.success {
                color: #0066cc;
            }

            .dw-field-search-results.error {
                color: #cc0000;
            }

            .dw-field-found-highlight {
                background: #ffeb3b !important;
                padding: 2px 4px !important;
                border-radius: 2px !important;
                animation: highlightPulse 2.5s ease-in-out;
                border: 1px solid #ffc107 !important;
                font-weight: 500 !important;
            }

            @keyframes highlightPulse {
                0%, 100% { 
                    background: #ffeb3b;
                }
                50% { 
                    background: #ffc107;
                }
            }

            /* Scroll-Indikator im DocuWare-Stil */
            .dw-scroll-indicator {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                background: #f5f5f5;
                color: #333;
                padding: 8px 12px;
                border: 1px solid #d0d0d0;
                border-radius: 2px;
                font-size: 11px;
                z-index: 9998;
                animation: slideInRight 0.2s ease;
                display: none;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }

            @keyframes slideInRight {
                from { 
                    transform: translateY(-50%) translateX(50px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(-50%) translateX(0); 
                    opacity: 1; 
                }
            }

            /* Scrollbar für Suggestions */
            .dw-field-search-suggestions::-webkit-scrollbar {
                width: 8px;
            }

            .dw-field-search-suggestions::-webkit-scrollbar-track {
                background: #f5f5f5;
            }

            .dw-field-search-suggestions::-webkit-scrollbar-thumb {
                background: #d0d0d0;
                border-radius: 4px;
            }

            .dw-field-search-suggestions::-webkit-scrollbar-thumb:hover {
                background: #b0b0b0;
            }

            /* Mobile Responsiveness */
            @media (max-width: 768px) {
                .dw-field-search-widget {
                    width: 340px;
                    margin: 20px;
                }

                .dw-scroll-indicator {
                    right: 10px;
                    font-size: 10px;
                    padding: 6px 10px;
                }
            }
        `;
        document.head.appendChild(styleElement);
    };

    // ===== VERBESSERTE FELD SUCHE =====
    const findFieldBySearchTerm = (searchTerm) => {
        const normalizedSearch = searchTerm.toLowerCase().trim();
        const results = [];

        console.log(`🔍 Suche nach: "${searchTerm}"`);

        // Erweiterte Selektoren für alle DocuWare-Felder
        const fieldSelectors = [
            'tr.index-entries-table-fields',  // Standard-Felder
            'tbody[data-bind*="foreach"] tr', // Dynamische Felder
            'tr:has(.dw-fieldLabel)',         // Allgemeine Felder mit Labels
            '.table-fields-content'           // Tabellen-Felder
        ];

        let allFieldRows = new Set();

        // Sammle alle möglichen Feld-Zeilen
        fieldSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.querySelector('.dw-fieldLabel') || 
                        el.closest('tr')?.querySelector('.dw-fieldLabel')) {
                        allFieldRows.add(el.tagName === 'TR' ? el : el.closest('tr'));
                    }
                });
            } catch (e) {
                // Fallback für :has() Selektor
            }
        });

        console.log(`📊 Gefundene Feldzeilen: ${allFieldRows.size}`);

        // Durchsuche alle gefundenen Felder
        for (let row of allFieldRows) {
            if (!row) continue;

            const labelSpan = row.querySelector('.dw-fieldLabel span');
            if (!labelSpan || !labelSpan.textContent) continue;
            
            const labelText = labelSpan.textContent.trim();
            const normalizedLabelText = labelText.toLowerCase();
            const cleanLabelText = normalizedLabelText.replace(/[^\w\säöüß-]/g, ''); // Entferne Emojis
            
            // Verschiedene Suchstrategien
            const searchMatches = [
                cleanLabelText.includes(normalizedSearch),
                normalizedLabelText.includes(normalizedSearch),
                labelText.toLowerCase().includes(normalizedSearch),
                // Teilwort-Suche
                cleanLabelText.split(' ').some(word => word.includes(normalizedSearch)),
                // Fuzzy-Suche für Tippfehler
                normalizedSearch.length > 2 && cleanLabelText.includes(normalizedSearch.substring(0, normalizedSearch.length - 1))
            ];

            if (searchMatches.some(match => match)) {
                const inputField = row.querySelector('input, textarea, .table-fields-wrapper, select');
                
                if (inputField) {
                    results.push({
                        element: row,
                        label: labelSpan,
                        inputField: inputField,
                        labelText: labelText,
                        matchType: 'direct'
                    });
                    console.log(`✅ Direkter Treffer: ${labelText}`);
                }
            }
        }

        // Wenn keine direkten Treffer, suche in konfigurierten Feldern
        if (results.length === 0) {
            Object.entries(SEARCHABLE_FIELDS).forEach(([key, config]) => {
                config.searchTerms.forEach(term => {
                    if (term.toLowerCase().includes(normalizedSearch) || 
                        normalizedSearch.includes(term.toLowerCase())) {
                        
                        for (let row of allFieldRows) {
                            if (!row) continue;
                            
                            const labelSpan = row.querySelector('.dw-fieldLabel span');
                            if (!labelSpan || !labelSpan.textContent) continue;
                            
                            const labelText = labelSpan.textContent.toLowerCase().trim();
                            const cleanLabelText = labelText.replace(/[^\w\säöüß-]/g, '');
                            
                            if (cleanLabelText.includes(term.toLowerCase()) || 
                                labelText.includes(term.toLowerCase())) {
                                const inputField = row.querySelector('input, textarea, .table-fields-wrapper, select');
                                
                                if (inputField && !results.find(r => r.element === row)) {
                                    results.push({
                                        element: row,
                                        label: labelSpan,
                                        inputField: inputField,
                                        labelText: labelSpan.textContent.trim(), 
                                        matchType: 'configured',
                                        configKey: key,
                                        displayName: config.displayName
                                    });
                                    console.log(`✅ Konfigurierter Treffer: ${labelSpan.textContent.trim()}`);
                                }
                            }
                        }
                    }
                });
            });
        }

        console.log(`📋 Gesamte Treffer: ${results.length}`);
        return results;
    };

    // ===== SCROLL FUNKTION =====
    const scrollToField = (fieldResult) => {
        if (!fieldResult.element) return;

        // Vorherige Highlights entfernen
        document.querySelectorAll('.dw-field-found-highlight').forEach(el => {
            el.classList.remove('dw-field-found-highlight');
        });

        // Scroll-Indikator anzeigen
        const scrollIndicator = document.querySelector('.dw-scroll-indicator') || createScrollIndicator();
        scrollIndicator.textContent = `Springe zu: ${fieldResult.displayName || fieldResult.labelText}`;
        scrollIndicator.style.display = 'block';

        // Zum Feld scrollen
        fieldResult.element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
        });

        // Feld highlighten
        setTimeout(() => {
            fieldResult.label.classList.add('dw-field-found-highlight');
            
            // Scroll-Indikator nach 3 Sekunden ausblenden
            setTimeout(() => {
                scrollIndicator.style.display = 'none';
            }, 3000);
            
            // Highlight nach 4 Sekunden entfernen
            setTimeout(() => {
                fieldResult.label.classList.remove('dw-field-found-highlight');
            }, 4000);
        }, 500);

        console.log(`📍 Gescrollt zu Feld: ${fieldResult.labelText}`);
    };

    // ===== SCROLL INDIKATOR =====
    const createScrollIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'dw-scroll-indicator';
        document.body.appendChild(indicator);
        return indicator;
    };

    // ===== SUGGESTION SYSTEM =====
    const getSuggestions = (searchTerm) => {
        if (!searchTerm || searchTerm.length < 1) return [];
        
        const suggestions = [];
        const normalizedSearch = searchTerm.toLowerCase();

        // Alle verfügbaren Feldnamen sammeln
        const fieldRows = document.querySelectorAll('tr:has(.dw-fieldLabel), tbody[data-bind*="foreach"] tr');
        const directMatches = new Set();
        
        fieldRows.forEach(row => {
            const labelSpan = row.querySelector('.dw-fieldLabel span');
            if (!labelSpan || !labelSpan.textContent) return;
            
            const labelText = labelSpan.textContent.trim();
            const cleanLabelText = labelText.toLowerCase().replace(/[^\w\säöüß-]/g, '');
            
            if ((cleanLabelText.includes(normalizedSearch) || 
                 labelText.toLowerCase().includes(normalizedSearch)) && 
                !directMatches.has(labelText)) {
                directMatches.add(labelText);
                suggestions.push({
                    key: 'direct_' + Math.random(),
                    displayName: labelText,
                    matchingTerms: [normalizedSearch]
                });
            }
        });

        // Konfigurierte Felder hinzufügen
        Object.entries(SEARCHABLE_FIELDS).forEach(([key, config]) => {
            const matchingTerms = config.searchTerms.filter(term => 
                term.toLowerCase().includes(normalizedSearch) || 
                normalizedSearch.includes(term.toLowerCase())
            );

            if (matchingTerms.length > 0 && !directMatches.has(config.displayName)) {
                suggestions.push({
                    key: key,
                    displayName: config.displayName,
                    matchingTerms: matchingTerms
                });
            }
        });

        return suggestions.slice(0, 8); // Mehr Vorschläge
    };

    // ===== SEARCH WIDGET =====
    const createSearchWidget = () => {
        // Overlay erstellen
        const overlay = document.createElement('div');
        overlay.className = 'dw-field-search-overlay';
        
        // Widget erstellen
        const widget = document.createElement('div');
        widget.className = 'dw-field-search-widget';
        
        widget.innerHTML = `
            <div class="dw-field-search-header">
                <div class="dw-field-search-title">Feldsuche</div>
                <button class="dw-field-search-close" title="Schließen">×</button>
            </div>
            
            <div class="dw-field-search-content">
                <div class="dw-field-search-input-container">
                    <input type="text" class="dw-field-search-input" placeholder="Feldname eingeben..." autocomplete="off">
                    <button class="dw-field-search-clear" title="Löschen">×</button>
                </div>
                
                <div class="dw-field-search-suggestions"></div>
                
                <div class="dw-field-search-info">
                    Geben Sie einen Feldnamen ein, um direkt zu diesem Feld zu springen.
                </div>
                
                <div class="dw-field-search-shortcut">
                    Tastenkombination: Strg+Shift+D
                </div>
                
                <div class="dw-field-search-results"></div>
            </div>
        `;

        overlay.appendChild(widget);
        document.body.appendChild(overlay);

        // Event Listeners
        const input = widget.querySelector('.dw-field-search-input');
        const clearBtn = widget.querySelector('.dw-field-search-clear');
        const closeBtn = widget.querySelector('.dw-field-search-close');
        const suggestions = widget.querySelector('.dw-field-search-suggestions');
        const results = widget.querySelector('.dw-field-search-results');

        let selectedSuggestionIndex = -1;

        // Widget schließen Funktion
        const closeWidget = () => {
            overlay.remove();
        };

        // Overlay Click zum Schließen
        addTrackedEventListener(overlay, 'click', (e) => {
            if (e.target === overlay) {
                closeWidget();
            }
        });

        // Input Events
        addTrackedEventListener(input, 'input', (e) => {
            const searchTerm = e.target.value.trim();
            
            // Clear Button anzeigen/verstecken
            clearBtn.style.display = searchTerm ? 'block' : 'none';
            
            // Suggestions aktualisieren
            const suggestionList = getSuggestions(searchTerm);
            updateSuggestions(suggestionList);
            
            selectedSuggestionIndex = -1;
            results.textContent = '';
        });

        // Enter Key - Suche ausführen
        addTrackedEventListener(input, 'keydown', (e) => {
            const suggestionItems = suggestions.querySelectorAll('.dw-field-search-suggestion');
            
            if (e.key === 'Enter') {
                e.preventDefault();
                
                if (selectedSuggestionIndex >= 0 && suggestionItems[selectedSuggestionIndex]) {
                    // Ausgewählten Vorschlag verwenden
                    suggestionItems[selectedSuggestionIndex].click();
                } else {
                    // Direkte Suche
                    executeSearch(input.value.trim());
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestionItems.length - 1);
                updateSuggestionHighlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateSuggestionHighlight();
            } else if (e.key === 'Escape') {
                closeWidget();
            }
        });

        // Clear Button
        addTrackedEventListener(clearBtn, 'click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            suggestions.style.display = 'none';
            results.textContent = '';
            input.focus();
        });

        // Close Button
        addTrackedEventListener(closeBtn, 'click', closeWidget);

        // Suggestion Highlight Update
        const updateSuggestionHighlight = () => {
            const suggestionItems = suggestions.querySelectorAll('.dw-field-search-suggestion');
            suggestionItems.forEach((item, index) => {
                item.classList.toggle('highlighted', index === selectedSuggestionIndex);
            });
        };

        // Suggestions Update
        const updateSuggestions = (suggestionList) => {
            if (suggestionList.length === 0) {
                suggestions.style.display = 'none';
                return;
            }

            suggestions.innerHTML = '';
            suggestionList.forEach((suggestion, index) => {
                const div = document.createElement('div');
                div.className = 'dw-field-search-suggestion';
                div.textContent = suggestion.displayName;
                
                addTrackedEventListener(div, 'click', () => {
                    input.value = suggestion.displayName;
                    suggestions.style.display = 'none';
                    executeSearch(suggestion.displayName);
                });

                addTrackedEventListener(div, 'mouseenter', () => {
                    selectedSuggestionIndex = index;
                    updateSuggestionHighlight();
                });

                suggestions.appendChild(div);
            });

            suggestions.style.display = 'block';
        };

        // Suche ausführen
        const executeSearch = (searchTerm) => {
            if (!searchTerm) return;

            const searchResults = findFieldBySearchTerm(searchTerm);
            
            if (searchResults.length > 0) {
                const firstResult = searchResults[0];
                scrollToField(firstResult);
                results.textContent = `Gefunden: ${firstResult.displayName || firstResult.labelText}`;
                results.className = 'dw-field-search-results success';
                
                // Suggestions ausblenden
                suggestions.style.display = 'none';
                
                // Widget nach kurzer Zeit schließen
                setTimeout(closeWidget, 1500);
            } else {
                results.textContent = `Kein Feld gefunden für: "${searchTerm}"`;
                results.className = 'dw-field-search-results error';
            }
        };

        // Initial Focus
        setTimeout(() => input.focus(), 100);

        return overlay;
    };

    // ===== TASTENKOMBINATION =====
// ÄNDERUNG - Tastenkombination auf Strg+Shift+D geändert
const setupKeyboardShortcut = () => {
    addTrackedEventListener(document, 'keydown', (e) => {
        // Strg+Shift+D
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            
            // Prüfen ob Widget bereits offen ist
            if (!document.querySelector('.dw-field-search-overlay')) {
                createSearchWidget();
            }
        }
    });
};

    // ===== INITIALISIERUNG =====
    const initializeFieldSearch = () => {
        createStyles();
        createScrollIndicator();
        setupKeyboardShortcut();
        
        console.log('✅ DocuWare Field Search aktiviert');
        console.log('⌨️ Tastenkombination: Strg+Shift+D');
        console.log('📋 Verfügbare Feldtypen:', Object.values(SEARCHABLE_FIELDS).map(f => f.displayName).join(', '));
    };

    // Script starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFieldSearch);
    } else {
        initializeFieldSearch();
    }


})();
