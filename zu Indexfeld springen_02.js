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
        }
    };

    // Event Listener Management
    const addTrackedEventListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        window[SEARCH_SCRIPT_ID].listeners.push({ element, event, handler });
    };

    // ===== CSS STYLES =====
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

            .dw-field-search-widget {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                width: 500px;
                max-width: 90%;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .dw-field-search-header {
                background: #4b7199;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .dw-field-search-title {
                font-weight: bold;
                font-size: 16px;
            }

            .dw-field-search-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                line-height: 1;
            }

            .dw-field-search-close:hover {
                opacity: 0.8;
            }

            .dw-field-search-content {
                padding: 20px;
                overflow-y: auto;
            }

            .dw-field-search-input-container {
                position: relative;
                margin-bottom: 15px;
            }

            .dw-field-search-input {
                width: 100%;
                padding: 10px 35px 10px 10px;
                border: 2px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                box-sizing: border-box;
            }

            .dw-field-search-input:focus {
                outline: none;
                border-color: #4b7199;
            }

            .dw-field-search-clear {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #999;
                font-size: 20px;
                cursor: pointer;
                display: none;
            }

            .dw-field-search-clear:hover {
                color: #666;
            }

            .dw-field-search-suggestions {
                background: white;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 15px;
                max-height: 200px;
                overflow-y: auto;
                display: none;
            }

.dw-field-search-suggestion {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    /* NEU: Mehr Platz für Tab-Info */
    min-height: 45px;
}

.dw-field-search-suggestion:last-child {
    border-bottom: none;
}

.dw-field-search-suggestion:hover,
.dw-field-search-suggestion.highlighted {
    background: #f0f0f0;
}
            .dw-field-search-info {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
            }

            .dw-field-search-shortcut {
                font-size: 11px;
                color: #999;
                margin-bottom: 15px;
            }

            .dw-field-search-results {
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
            }

            .dw-field-search-results.success {
                background: #e8f5e9;
                color: #2e7d32;
            }

            .dw-field-search-results.error {
                background: #ffebee;
                color: #c62828;
            }

            .dw-field-search-results.loading {
                background: #e3f2fd;
                color: #1976d2;
            }

            .dw-field-found-highlight {
                background-color: #ffeb3b !important;
                animation: pulse 0.5s ease-in-out 3;
            }

            .dw-scroll-indicator {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(75, 113, 153, 0.95);
                color: white;
                padding: 12px 20px;
                border-radius: 5px;
                z-index: 99999;
                font-size: 13px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: none;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(styleElement);
    };

    // ===== INPUTFELD FINDER UND FOKUS FUNKTIONEN =====
    const findInputFieldForRow = (row) => {
        const inputSelectors = [
            'input[type="text"]',
            'input[type="email"]',
            'input[type="tel"]',
            'input[type="number"]',
            'input[type="date"]',
            'input[type="datetime-local"]',
            'textarea',
            'select',
            'input[type="checkbox"]',
            'input[type="radio"]',
            '.table-fields-wrapper input',
            '.dw-input',
            '.form-control'
        ];

        for (let selector of inputSelectors) {
            const input = row.querySelector(selector);
            if (input && isInputFieldAccessible(input)) {
                return input;
            }
        }

        const nextCell = row.querySelector('td:nth-child(2), td:nth-child(3)');
        if (nextCell) {
            for (let selector of inputSelectors) {
                const input = nextCell.querySelector(selector);
                if (input && isInputFieldAccessible(input)) {
                    return input;
                }
            }
        }

        return null;
    };

    const isInputFieldAccessible = (input) => {
        if (!input) return false;

        const style = window.getComputedStyle(input);
        const isVisible = style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0';

        const isEnabled = !input.disabled && !input.readOnly;

        return isVisible && isEnabled;
    };

    const focusInputField = (inputField) => {
        if (!inputField) return;

        try {
            inputField.focus();

            if (inputField.type === 'text' || inputField.type === 'email' ||
                inputField.type === 'tel' || inputField.tagName === 'TEXTAREA') {

                const currentValue = inputField.value;

                if (inputField.setSelectionRange) {
                    const length = currentValue.length;
                    inputField.setSelectionRange(length, length);
                } else if (inputField.createTextRange) {
                    const range = inputField.createTextRange();
                    range.collapse(false);
                    range.select();
                }
            }

            inputField.style.transition = 'box-shadow 0.3s ease';
            inputField.style.boxShadow = '0 0 0 2px #5c9ccc';

            setTimeout(() => {
                inputField.style.boxShadow = '';
            }, 1000);

            console.log(`🎯 Fokus gesetzt auf: ${inputField.tagName}[${inputField.type || 'default'}]`);

        } catch (error) {
            console.warn('⚠️ Fokus konnte nicht gesetzt werden:', error);
        }
    };

    // ===== SCROLL INDIKATOR =====
    const createScrollIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'dw-scroll-indicator';
        document.body.appendChild(indicator);
        return indicator;
    };

    // ===== SUGGESTION SYSTEM =====
// ===== SUGGESTION SYSTEM (NUR AKTIVER TAB) =====
// ===== SUGGESTION SYSTEM (KOMPLETT NEU BEI JEDER EINGABE) =====
const getSuggestions = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) return [];

    console.log(`💡 Generiere Suggestions für: "${searchTerm}"`);

    const suggestions = [];
    const normalizedSearch = searchTerm.toLowerCase();

    // ÄNDERUNG: Bei JEDER Suggestion-Generierung komplett neu ermitteln
    const allTabs = TAB_MANAGEMENT.findAllTabs();
    const activeTab = allTabs.find(tab => tab.isActive);
    
    if (!activeTab) {
        console.warn('⚠️ Kein aktiver Tab für Suggestions');
        return suggestions;
    }

    console.log(`   Aktiver Tab: "${activeTab.name}"`);

    // ÄNDERUNG: Tab-Content komplett neu ermitteln
    let searchArea = null;
    
    // Erst versuchen den spezifischen Tab-Content zu finden
    const tabContent = TAB_MANAGEMENT.findTabContent(activeTab);
    
    if (tabContent) {
        const isHidden = tabContent.classList.contains('ui-hidden') ||
                        window.getComputedStyle(tabContent).display === 'none';
        
        if (isHidden) {
            console.log(`   ⚠️ Tab-Content versteckt, suche sichtbare Panels...`);
            const visiblePanels = TAB_MANAGEMENT.findVisibleContent();
            if (visiblePanels.length > 0) {
                searchArea = visiblePanels[0];
                console.log(`   ✅ Nutze sichtbares Panel: ${searchArea.id}`);
            }
        } else {
            searchArea = tabContent;
            console.log(`   ✅ Nutze Tab-Content: ${tabContent.id}`);
        }
    }
    
    // Fallback
    if (!searchArea) {
        console.log(`   ⚠️ Kein Tab-Content, suche sichtbare Panels...`);
        const visiblePanels = TAB_MANAGEMENT.findVisibleContent();
        if (visiblePanels.length > 0) {
            searchArea = visiblePanels[0];
            console.log(`   ✅ Nutze sichtbares Panel: ${searchArea.id}`);
        } else {
            console.log(`   ⚠️ Keine sichtbaren Panels, nutze Document`);
            searchArea = document;
        }
    }

    // ÄNDERUNG: Sammle Feldnamen komplett neu
    const fieldRows = searchArea.querySelectorAll('tr:has(.dw-fieldLabel), tbody[data-bind*="foreach"] tr, tr');
    const directMatches = new Set();

    console.log(`   Durchsuche ${fieldRows.length} Zeilen im Suchbereich`);

    let fieldsFound = 0;
    fieldRows.forEach(row => {
        const labelSpan = row.querySelector('.dw-fieldLabel span') ||
                         row.querySelector('[class*="label"]') ||
                         row.querySelector('td:first-child span');
        
        if (!labelSpan || !labelSpan.textContent) return;

        const labelText = labelSpan.textContent.trim();
        if (!labelText) return;

        fieldsFound++;
        
        const cleanLabelText = labelText.toLowerCase().replace(/[^\w\säöüß-]/g, '');

        if ((cleanLabelText.includes(normalizedSearch) ||
            labelText.toLowerCase().includes(normalizedSearch)) &&
            !directMatches.has(labelText)) {
            
            const hasInput = findInputFieldForRow(row) !== null;
            
            if (hasInput) {
                directMatches.add(labelText);
                suggestions.push({
                    key: 'direct_' + Math.random(),
                    displayName: labelText,
                    matchingTerms: [normalizedSearch],
                    tabName: activeTab.name
                });
                console.log(`   ✓ Suggestion: "${labelText}"`);
            }
        }
    });

    console.log(`   Gefundene Felder gesamt: ${fieldsFound}`);
    console.log(`   Passende Suggestions: ${suggestions.length}`);

    // Konfigurierte Felder
    Object.entries(SEARCHABLE_FIELDS).forEach(([key, config]) => {
        const matchingTerms = config.searchTerms.filter(term =>
            term.toLowerCase().includes(normalizedSearch) ||
            normalizedSearch.includes(term.toLowerCase())
        );

        if (matchingTerms.length > 0 && !directMatches.has(config.displayName)) {
            const fieldExistsInTab = Array.from(fieldRows).some(row => {
                const labelSpan = row.querySelector('.dw-fieldLabel span') ||
                                row.querySelector('[class*="label"]');
                if (!labelSpan) return false;
                
                const labelText = labelSpan.textContent.toLowerCase().trim();
                return config.searchTerms.some(term => 
                    labelText.includes(term.toLowerCase())
                );
            });
            
            if (fieldExistsInTab) {
                suggestions.push({
                    key: key,
                    displayName: config.displayName,
                    matchingTerms: matchingTerms,
                    tabName: activeTab.name
                });
            }
        }
    });

    console.log(`💡 Finale Suggestions: ${suggestions.length}`);
    
    return suggestions.slice(0, 8);
};
    // ===== TAB-MANAGEMENT =====
    // ===== TAB-MANAGEMENT (VERBESSERT) =====
// ===== TAB-MANAGEMENT (ERWEITERTE DEBUG-AUSGABEN) =====
const TAB_MANAGEMENT = {
    findTabContainer: () => {
        const selectors = [
            '.ui-tabs-nav.dw-tabStrip',
            '.dw-tabStrip',
            '.ui-tabs-nav',
            '[role="tablist"]',
            '.tab-container',
            'ul.ui-tabs-nav'
        ];

        for (let selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                console.log(`✅ Tab-Container gefunden: ${selector}`);
                return container;
            }
        }
        console.warn('⚠️ Kein Tab-Container gefunden');
        return null;
    },

    findAllTabs: () => {
        const tabContainer = TAB_MANAGEMENT.findTabContainer();
        if (!tabContainer) return [];

        const tabs = Array.from(tabContainer.querySelectorAll('li[role="tab"], .ui-tabs-tab, .tab-item, li.ui-state-default'));

        console.log(`📋 Tabs im Container: ${tabs.length}`);

        return tabs.map(tab => {
            const anchor = tab.querySelector('a');
            const span = tab.querySelector('span, .label');
            
            let tabId = null;
            if (anchor) {
                const href = anchor.getAttribute('href');
                if (href && href.startsWith('#')) {
                    tabId = href.replace('#', '');
                }
            }
            
            if (!tabId) {
                tabId = tab.getAttribute('aria-controls');
            }
            
            let tabName = 'Unbenannt';
            if (span && span.textContent.trim()) {
                tabName = span.textContent.trim();
            } else if (anchor && anchor.textContent.trim()) {
                tabName = anchor.textContent.trim();
            } else if (tab.textContent.trim()) {
                tabName = tab.textContent.trim();
            }

            const isActive = tab.classList.contains('ui-state-active') ||
                tab.classList.contains('ui-tabs-active') ||
                tab.classList.contains('active') ||
                tab.getAttribute('aria-selected') === 'true';

            console.log(`Tab gefunden: "${tabName}" (ID: ${tabId}, Aktiv: ${isActive})`);

            return {
                element: tab,
                anchor: anchor,
                span: span,
                tabId: tabId,
                name: tabName,
                isActive: isActive
            };
        });
    },

    activateTab: (tab) => {
        return new Promise((resolve) => {
            if (!tab || !tab.anchor) {
                resolve(false);
                return;
            }

            console.log(`🔄 Aktiviere Tab: ${tab.name}`);

            try {
                tab.anchor.click();

                setTimeout(() => {
                    const isNowActive = tab.element.classList.contains('ui-state-active') ||
                        tab.element.classList.contains('ui-tabs-active') ||
                        tab.element.classList.contains('active');

                    if (isNowActive) {
                        console.log(`✅ Tab erfolgreich aktiviert: ${tab.name}`);
                        resolve(true);
                    } else {
                        console.log(`⚠️ Fallback-Aktivierung für Tab: ${tab.name}`);
                        tab.element.click();
                        setTimeout(() => resolve(true), 300);
                    }
                }, 200);

            } catch (error) {
                console.warn(`⚠️ Fehler beim Aktivieren von Tab ${tab.name}:`, error);
                resolve(false);
            }
        });
    },

    // ÄNDERUNG: Erweiterte Content-Suche mit Sichtbarkeitsprüfung
    findTabContent: (tab) => {
        if (!tab.tabId) {
            console.warn('⚠️ Tab hat keine ID:', tab.name);
            return null;
        }

        console.log(`🔍 Suche Content für Tab "${tab.name}" mit ID: ${tab.tabId}`);

        const contentSelectors = [
            `#${CSS.escape(tab.tabId)}`,
            `[aria-labelledby="${tab.anchor?.id}"]`,
            `.ui-tabs-panel[id="${CSS.escape(tab.tabId)}"]`,
            `div[id="${CSS.escape(tab.tabId)}"]`
        ];

        for (let selector of contentSelectors) {
            try {
                const content = document.querySelector(selector);
                if (content) {
                    // ÄNDERUNG: Prüfe Sichtbarkeit
                    const style = window.getComputedStyle(content);
                    const classList = Array.from(content.classList);
                    const isHidden = content.classList.contains('ui-hidden') ||
                                   style.display === 'none' ||
                                   style.visibility === 'hidden' ||
                                   content.getAttribute('aria-hidden') === 'true';
                    
                    console.log(`✅ Content gefunden für Tab "${tab.name}": ${selector}`);
                    console.log(`   Klassen: ${classList.join(' ')}`);
                    console.log(`   Display: ${style.display}`);
                    console.log(`   Visibility: ${style.visibility}`);
                    console.log(`   aria-hidden: ${content.getAttribute('aria-hidden')}`);
                    console.log(`   ⚠️ VERSTECKT: ${isHidden}`);
                    
                    return content;
                }
            } catch (e) {
                console.warn('Selector-Fehler:', selector, e);
            }
        }

        console.warn(`⚠️ Kein Content gefunden für Tab "${tab.name}" (ID: ${tab.tabId})`);
        return null;
    },

    // NEU: Finde alle sichtbaren Content-Bereiche
    findVisibleContent: () => {
        console.log(`🔍 Suche nach sichtbaren Content-Bereichen...`);
        
        const allPanels = document.querySelectorAll('.ui-tabs-panel, .dw-tabContent, [role="tabpanel"]');
        console.log(`   Gefundene Panels gesamt: ${allPanels.length}`);
        
        const visiblePanels = Array.from(allPanels).filter(panel => {
            const style = window.getComputedStyle(panel);
            const isVisible = !panel.classList.contains('ui-hidden') &&
                            style.display !== 'none' &&
                            style.visibility !== 'hidden' &&
                            panel.getAttribute('aria-hidden') !== 'true';
            
            if (isVisible) {
                console.log(`   ✅ Sichtbares Panel: ${panel.id || 'ohne ID'}`);
                console.log(`      Klassen: ${Array.from(panel.classList).join(' ')}`);
            }
            
            return isVisible;
        });
        
        console.log(`   Sichtbare Panels: ${visiblePanels.length}`);
        return visiblePanels;
    }
};
    // ===== SUCHE IM TAB-CONTENT =====
    // ===== SUCHE IM TAB-CONTENT (MIT MEHR DEBUG-AUSGABEN) =====
// ===== SUCHE IM TAB-CONTENT (MIT FALLBACK AUF SICHTBARE BEREICHE) =====
// ===== SUCHE IM TAB-CONTENT (KOMPLETT FRISCH) =====
const searchInTabContent = (tab, normalizedSearch) => {
    const results = [];

    console.log(`🔎 === STARTE TAB-CONTENT-SUCHE ===`);
    console.log(`🔎 Tab: "${tab.name}"`);
    console.log(`   Suche nach: "${normalizedSearch}"`);

    // ÄNDERUNG: Tab-Content komplett neu ermitteln
    let searchArea = null;
    
    // Schritt 1: Versuche spezifischen Tab-Content zu finden
    const tabContent = TAB_MANAGEMENT.findTabContent(tab);
    
    if (tabContent) {
        const isHidden = tabContent.classList.contains('ui-hidden') ||
                        window.getComputedStyle(tabContent).display === 'none' ||
                        tabContent.getAttribute('aria-hidden') === 'true';
        
        if (isHidden) {
            console.warn(`⚠️ Tab-Content ist VERSTECKT!`);
            console.log(`   ID: ${tabContent.id}`);
            console.log(`   Klassen: ${Array.from(tabContent.classList).join(' ')}`);
            console.log(`   Suche nach sichtbaren Alternativen...`);
            
            // NEU ermitteln
            const visiblePanels = TAB_MANAGEMENT.findVisibleContent();
            
            if (visiblePanels.length > 0) {
                searchArea = visiblePanels[0];
                console.log(`✅ Nutze sichtbares Panel: ${searchArea.id || 'ohne ID'}`);
            } else {
                console.warn(`⚠️ Keine sichtbaren Panels!`);
                searchArea = null;
            }
        } else {
            searchArea = tabContent;
            console.log(`✅ Tab-Content ist sichtbar: ${tabContent.id}`);
        }
    } else {
        console.log(`⚠️ Kein Tab-Content gefunden`);
    }
    
    // Schritt 2: Fallback wenn kein searchArea
    if (!searchArea) {
        console.log(`🔍 Fallback: Suche nach sichtbaren Bereichen...`);
        const visiblePanels = TAB_MANAGEMENT.findVisibleContent();
        
        if (visiblePanels.length > 0) {
            searchArea = visiblePanels[0];
            console.log(`✅ Nutze sichtbares Panel: ${searchArea.id || 'keine ID'}`);
        } else {
            console.warn(`⚠️ Keine sichtbaren Panels, nutze Document`);
            searchArea = document;
        }
    }

    // Debug SearchArea
    console.log(`📦 SearchArea Info:`);
    console.log(`   Element: ${searchArea.tagName}`);
    console.log(`   ID: ${searchArea.id || 'keine'}`);
    console.log(`   Klassen: ${Array.from(searchArea.classList).join(' ') || 'keine'}`);
    console.log(`   Kinder: ${searchArea.children.length}`);
    console.log(`   Alle Elemente: ${searchArea.querySelectorAll('*').length}`);

    // ÄNDERUNG: Feldzeilen komplett neu sammeln
    const fieldSelectors = [
        'tr.index-entries-table-fields',
        'tbody[data-bind*="foreach"] tr',
        'tr:has(.dw-fieldLabel)',
        '.table-fields-content',
        'tr.field-row',
        '.field-container',
        'tr:has(td.dw-fieldLabel)',
        'table.table-fields tbody tr',
        'tr:has(.dw-fieldLabel span)',
        '.dw-dialogContent tr',
        'tbody tr:has(td)'
    ];

    let tabFieldRows = new Set();

    console.log(`   Durchsuche ${fieldSelectors.length} Selektoren...`);

    fieldSelectors.forEach((selector, index) => {
        try {
            const elements = searchArea.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`   ✓ Selector ${index + 1}: ${elements.length} Elemente`);
            }
            
            elements.forEach(el => {
                const row = el.tagName === 'TR' ? el : el.closest('tr');
                if (row) {
                    const hasLabel = row.querySelector('.dw-fieldLabel') ||
                                   row.querySelector('[class*="label"]') ||
                                   row.querySelector('td:first-child span') ||
                                   row.querySelector('.dw-fieldLabel span');
                    
                    if (hasLabel) {
                        tabFieldRows.add(row);
                    }
                }
            });
        } catch (e) {
            // :has() nicht unterstützt
        }
    });

    console.log(`  📊 Gefundene Feldzeilen: ${tabFieldRows.size}`);
    
    if (tabFieldRows.size > 0) {
        console.log(`  📝 Erste Felder:`);
        let count = 0;
        for (let row of tabFieldRows) {
            const labelSpan = row.querySelector('.dw-fieldLabel span') ||
                            row.querySelector('[class*="label"]') ||
                            row.querySelector('td:first-child span');
            if (labelSpan && labelSpan.textContent.trim()) {
                count++;
                console.log(`     ${count}. "${labelSpan.textContent.trim()}"`);
                if (count >= 5) break;
            }
        }
        if (tabFieldRows.size > 5) {
            console.log(`     ... und ${tabFieldRows.size - 5} weitere`);
        }
    } else {
        console.warn(`  ⚠️ KEINE Feldzeilen gefunden!`);
    }

    console.log(`  🔎 Suche Matches für: "${normalizedSearch}"`);

    // Such-Logik (unverändert)
    for (let row of tabFieldRows) {
        if (!row) continue;

        const labelSpan = row.querySelector('.dw-fieldLabel span') ||
                        row.querySelector('[class*="label"]') ||
                        row.querySelector('td:first-child span');
        
        if (!labelSpan || !labelSpan.textContent) continue;

        const labelText = labelSpan.textContent.trim();
        const normalizedLabelText = labelText.toLowerCase();
        const cleanLabelText = normalizedLabelText.replace(/[^\w\säöüß-]/g, '');

        const searchMatches = [
            cleanLabelText.includes(normalizedSearch),
            normalizedLabelText.includes(normalizedSearch),
            labelText.toLowerCase().includes(normalizedSearch),
            cleanLabelText.split(' ').some(word => word.includes(normalizedSearch)),
            normalizedSearch.split(' ').every(searchWord => 
                cleanLabelText.includes(searchWord.toLowerCase())
            )
        ];

        const hasMatch = searchMatches.some(match => match);

        if (hasMatch) {
            console.log(`  ✓ Match: "${labelText}"`);
            
            const inputField = findInputFieldForRow(row);

            if (inputField) {
                results.push({
                    element: row,
                    label: labelSpan,
                    inputField: inputField,
                    labelText: labelText,
                    matchType: 'direct',
                    tab: tab,
                    tabContent: tabContent
                });
                console.log(`  ✅ Vollständiger Treffer: ${labelText}`);
            } else {
                console.log(`  ⚠️ Match ohne Input: ${labelText}`);
            }
        }
    }

    if (results.length === 0) {
        console.log(`  🔍 Prüfe konfigurierte Felder...`);
        
        Object.entries(SEARCHABLE_FIELDS).forEach(([key, config]) => {
            config.searchTerms.forEach(term => {
                if (term.toLowerCase().includes(normalizedSearch) ||
                    normalizedSearch.includes(term.toLowerCase())) {

                    for (let row of tabFieldRows) {
                        if (!row) continue;

                        const labelSpan = row.querySelector('.dw-fieldLabel span') ||
                            row.querySelector('[class*="label"]');
                        if (!labelSpan || !labelSpan.textContent) continue;

                        const labelText = labelSpan.textContent.toLowerCase().trim();
                        const cleanLabelText = labelText.replace(/[^\w\säöüß-]/g, '');

                        if (cleanLabelText.includes(term.toLowerCase()) ||
                            labelText.includes(term.toLowerCase())) {

                            const inputField = findInputFieldForRow(row);

                            if (inputField && !results.find(r => r.element === row)) {
                                results.push({
                                    element: row,
                                    label: labelSpan,
                                    inputField: inputField,
                                    labelText: labelSpan.textContent.trim(),
                                    matchType: 'configured',
                                    configKey: key,
                                    displayName: config.displayName,
                                    tab: tab,
                                    tabContent: tabContent
                                });
                                console.log(`  ✅ Konfigurierter Treffer: ${labelSpan.textContent.trim()}`);
                            }
                        }
                    }
                }
            });
        });
    }

    console.log(`  📊 Endergebnis: ${results.length} Treffer`);
    console.log(`🔎 === TAB-CONTENT-SUCHE BEENDET ===\n`);
    
    return results;
};
    // ===== FELD-SUCHE MIT TABS =====
    // ===== FELD-SUCHE MIT TABS (VERBESSERT MIT WARTEZEIT) =====
// ===== FELD-SUCHE MIT TABS (KOMPLETT NEU BEI JEDER SUCHE) =====
const findFieldBySearchTermWithTabs = (searchTerm) => {
    return new Promise((resolve) => {
        const normalizedSearch = searchTerm.toLowerCase().trim();
        const allResults = [];

        console.log(`🔍 === NEUE SUCHE GESTARTET ===`);
        console.log(`🔍 Suche im aktiven Tab nach: "${searchTerm}"`);

        // ÄNDERUNG: Komplett neu ermitteln
        const allTabs = TAB_MANAGEMENT.findAllTabs();
        console.log(`📋 Gefundene Tabs: ${allTabs.length}`);

        const activeTab = allTabs.find(tab => tab.isActive);
        
        if (!activeTab) {
            console.warn('⚠️ Kein aktiver Tab gefunden');
            resolve(allResults);
            return;
        }

        console.log(`🎯 Aktiver Tab: "${activeTab.name}" (ID: ${activeTab.tabId})`);

        // ÄNDERUNG: Kurz warten und dann komplett neu suchen
        setTimeout(() => {
            // NEU: Tabs erneut ermitteln für frische Daten
            const freshTabs = TAB_MANAGEMENT.findAllTabs();
            const freshActiveTab = freshTabs.find(tab => tab.isActive);
            
            if (!freshActiveTab) {
                console.warn('⚠️ Aktiver Tab nach Wartezeit nicht mehr gefunden');
                resolve(allResults);
                return;
            }
            
            console.log(`🔄 Suche mit frisch ermitteltem Tab: "${freshActiveTab.name}"`);
            
            const results = searchInTabContent(freshActiveTab, normalizedSearch);
            allResults.push(...results);

            console.log(`📊 Treffer im aktiven Tab: ${allResults.length}`);
            console.log(`🔍 === SUCHE BEENDET ===\n`);
            
            resolve(allResults);
        }, 200);
    });
};

    // ===== SCROLL FUNKTION =====
    const scrollToFieldWithTab = (fieldResult) => {
        return new Promise((resolve) => {
            if (!fieldResult.element) {
                resolve();
                return;
            }

            console.log(`🎯 Springe zu Feld: ${fieldResult.labelText} in Tab: ${fieldResult.tab.name}`);

            document.querySelectorAll('.dw-field-found-highlight').forEach(el => {
                el.classList.remove('dw-field-found-highlight');
            });

            const scrollIndicator = document.querySelector('.dw-scroll-indicator') || createScrollIndicator();
            scrollIndicator.innerHTML = `
                <div style="font-weight: bold;">Tab: ${fieldResult.tab.name}</div>
                <div>Feld: ${fieldResult.displayName || fieldResult.labelText}</div>
            `;
            scrollIndicator.style.display = 'block';

            fieldResult.element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });

            setTimeout(() => {
                fieldResult.label.classList.add('dw-field-found-highlight');

                const inputField = findInputFieldForRow(fieldResult.element);
                if (inputField) {
                    focusInputField(inputField);
                }

                setTimeout(() => {
                    scrollIndicator.style.display = 'none';
                }, 1000);

                setTimeout(() => {
                    fieldResult.label.classList.remove('dw-field-found-highlight');
                }, 1000);

                resolve();
            }, 600);

            console.log(`✅ Erfolgreich zu Feld gescrollt: ${fieldResult.labelText} in Tab: ${fieldResult.tab.name}`);
        });
    };

const createSearchWidget = () => {
    const overlay = document.createElement('div');
    overlay.className = 'dw-field-search-overlay';

    const widget = document.createElement('div');
    widget.className = 'dw-field-search-widget';

    widget.innerHTML = `
        <div class="dw-field-search-header">
            <div class="dw-field-search-title">Feldsuche (Aktiver Tab)</div>
            <button class="dw-field-search-close" title="Schließen">×</button>
        </div>
        
        <div class="dw-field-search-content">
            <div class="dw-field-search-input-container">
                <input type="text" class="dw-field-search-input" placeholder="Feldname eingeben..." autocomplete="off">
                <button class="dw-field-search-clear" title="Löschen">×</button>
            </div>
            
            <div class="dw-field-search-suggestions"></div>
            
            <div class="dw-field-search-info">
                Sucht im aktuell geöffneten Tab nach dem gewünschten Feld.
            </div>
            
            <div class="dw-field-search-shortcut">
                Tastenkombination: Strg+Shift+D
            </div>
            
            <div class="dw-field-search-results"></div>
        </div>
    `;

    overlay.appendChild(widget);
    document.body.appendChild(overlay);

    const input = widget.querySelector('.dw-field-search-input');
    const clearBtn = widget.querySelector('.dw-field-search-clear');
    const closeBtn = widget.querySelector('.dw-field-search-close');
    const suggestions = widget.querySelector('.dw-field-search-suggestions');
    const results = widget.querySelector('.dw-field-search-results');

    let selectedSuggestionIndex = -1;

    const closeWidget = () => {
        overlay.remove();
    };

    addTrackedEventListener(overlay, 'click', (e) => {
        if (e.target === overlay) {
            closeWidget();
        }
    });

    const executeSearch = (searchTerm) => {
        return new Promise((resolve) => {
            if (!searchTerm) {
                resolve();
                return;
            }

            results.innerHTML = `
                <div class="dw-field-search-results loading">
                    Suche im aktiven Tab...
                </div>
            `;
            results.className = 'dw-field-search-results loading';

            findFieldBySearchTermWithTabs(searchTerm).then(searchResults => {
                if (searchResults.length > 0) {
                    const firstResult = searchResults[0];

                    scrollToFieldWithTab(firstResult).then(() => {
                        const inputType = firstResult.inputField ?
                            (firstResult.inputField.tagName === 'INPUT' ?
                                firstResult.inputField.type || 'text' :
                                firstResult.inputField.tagName.toLowerCase()) : 'unbekannt';

                        results.innerHTML = `
                            <div style="color: #0066cc; font-weight: bold; margin-bottom: 4px;">
                                ✅ Gefunden: ${firstResult.displayName || firstResult.labelText}
                            </div>
                            <div style="font-size: 10px; color: #666; margin-bottom: 4px;">
                                Tab: ${firstResult.tab.name} | Typ: ${inputType}
                            </div>
                        `;

                        if (searchResults.length > 1) {
                            const additionalInfo = document.createElement('div');
                            additionalInfo.style.fontSize = '10px';
                            additionalInfo.style.color = '#999';
                            additionalInfo.style.marginTop = '4px';
                            additionalInfo.textContent = `${searchResults.length - 1} weitere Treffer im Tab`;
                            results.appendChild(additionalInfo);
                        }

                        results.className = 'dw-field-search-results success';
                        suggestions.style.display = 'none';

                        // ÄNDERUNG: 1111ms statt 2500ms
                        setTimeout(() => {
                            if (overlay.parentNode) {
                                closeWidget();
                            }
                        }, 111);

                        resolve();
                    });
                } else {
                    const allTabs = TAB_MANAGEMENT.findAllTabs();
                    const activeTab = allTabs.find(tab => tab.isActive);
                    const tabName = activeTab ? activeTab.name : 'diesem Tab';

                    results.innerHTML = `
                        <div style="color: #cc0000;">
                            ❌ Kein Feld in "${tabName}" gefunden
                        </div>
                        <div style="font-size: 10px; color: #999; margin-top: 4px;">
                            Suchbegriff: "${searchTerm}"
                        </div>
                        <div style="font-size: 9px; color: #999; margin-top: 4px;">
                            Tipp: Konsole (F12) für Details prüfen
                        </div>
                    `;
                    results.className = 'dw-field-search-results error';
                    resolve();
                }
            }).catch(error => {
                console.error('Fehler bei der Suche:', error);
                results.innerHTML = `
                    <div style="color: #cc0000;">
                        ⚠️ Fehler bei der Suche
                    </div>
                    <div style="font-size: 10px; color: #999; margin-top: 4px;">
                        ${error.message}
                    </div>
                `;
                results.className = 'dw-field-search-results error';
                resolve();
            });
        });
    };

    addTrackedEventListener(input, 'input', (e) => {
        const searchTerm = e.target.value.trim();
        clearBtn.style.display = searchTerm ? 'block' : 'none';

        const suggestionList = getSuggestions(searchTerm);
        updateSuggestions(suggestionList);

        selectedSuggestionIndex = -1;
        results.textContent = '';
    });

    addTrackedEventListener(input, 'keydown', (e) => {
        const suggestionItems = suggestions.querySelectorAll('.dw-field-search-suggestion');

        if (e.key === 'Enter') {
            e.preventDefault();

            if (selectedSuggestionIndex >= 0 && suggestionItems[selectedSuggestionIndex]) {
                const suggestionText = suggestionItems[selectedSuggestionIndex].textContent;
                input.value = suggestionText;
                suggestions.style.display = 'none';
                executeSearch(suggestionText);
            } else {
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

    addTrackedEventListener(clearBtn, 'click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        suggestions.style.display = 'none';
        results.textContent = '';
        input.focus();
    });

    addTrackedEventListener(closeBtn, 'click', closeWidget);

    const updateSuggestionHighlight = () => {
        const suggestionItems = suggestions.querySelectorAll('.dw-field-search-suggestion');
        suggestionItems.forEach((item, index) => {
            item.classList.toggle('highlighted', index === selectedSuggestionIndex);
        });
    };

    const updateSuggestions = (suggestionList) => {
        if (suggestionList.length === 0) {
            suggestions.style.display = 'none';
            return;
        }

        suggestions.innerHTML = '';
        suggestionList.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'dw-field-search-suggestion';
            
            div.innerHTML = `
                <div style="font-weight: 500;">${suggestion.displayName}</div>
                <div style="font-size: 10px; color: #999; margin-top: 2px;">
                    Tab: ${suggestion.tabName || 'Aktuell'}
                </div>
            `;

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

    setTimeout(() => input.focus(), 100);

    return overlay;
};

    // ===== TASTENKOMBINATION =====
// ===== TASTENKOMBINATION (STRG+SHIFT+D) =====
const setupKeyboardShortcut = () => {
    addTrackedEventListener(document, 'keydown', (e) => {
        // ÄNDERUNG: Strg+Shift+D statt F
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFieldSearch);
    } else {
        initializeFieldSearch();
    }

})();

