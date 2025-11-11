(function () {
    'use strict';

    const ID = 'dw-betreff-buttons';
    const VERSION = '1.0';
    const STORAGE_KEY = 'dw-betreff-state';
    const DEBUG = true;

    const BETREFF_CONFIG = {
        fieldLabel: 'Betreff',
        prefix: 'dw-betreff',
        gap: '6px',
        keywords: [
            { value: '(tags: ', label: '(tags: ' },
            { value: ')', label: ')' },
            { value: 'Zahlungserinnerung / Mahnung', label: 'Mahnung' },
            { value: 'Mietkürzung / Mietminderung', label: 'Mietkürzung / Mietminderung' },
            { value: 'Ratenzahlungsvereinbarung', label: 'Ratenzahlung' },
            { value: 'Einspruch / Widerspruch', label: 'Einspruch / Widerspruch' },
            { value: 'Kündigung', label: 'Kündigung' },
            { value: 'Mieterhöhung / Mietanpassung', label: 'Mieterhöhung' },
            { value: 'Anwalt / Klage', label: 'Anwalt / Klage' },
            { value: 'Betriebskostenabrechnung / Nebenkostenabrechnung', label: 'BK-Abrechnung' },

            { value: 'Heizung', label: 'Heizung' },
            { value: 'Wasser', label: 'Wasser' },
            { value: 'Warmwasser', label: 'Warmwasser' },
            { value: 'Strom / Elektrik / Elektro', label: 'Strom / Elektrik' },
            { value: 'Schimmel', label: 'Schimmel' },
            { value: 'Feuchtigkeit', label: 'Feuchtigkeit' },
            { value: 'Nass / Nässe', label: 'Nass / Nässe' },
            { value: 'Schädlingsbekämpfung (Ratten, Mäuse, Schaben)', label: 'Schädlingsbekämpfung' },
            { value: 'Wasserschaden', label: 'Wasserschaden' },
            { value: 'Versicherung', label: 'Versicherung' }

        ]
    };

    let STATE = {
        initialized: false,
        observer: null,
        processed: new Set(),
        timeouts: new Set()
    };

    if (window[ID]) cleanup();
    window[ID] = { version: VERSION, state: STATE, cleanup };

    const log = (msg, data) => DEBUG && console.log(`[${ID}] ${msg}`, data || '');

    function cleanup() {
        if (window[ID] && window[ID].state) {
            window[ID].state.observer && window[ID].state.observer.disconnect();
            window[ID].state.timeouts && window[ID].state.timeouts.forEach(clearTimeout);
        }
    }

    function injectCSS() {
        if (document.querySelector(`style[data-${ID}]`)) return;

        const css = `
            .${BETREFF_CONFIG.prefix}-button-row {
                position: relative !important;
                display: table-row !important;
                opacity: 1 !important;
                visibility: visible !important;
                background: inherit !important;
                z-index: 10 !important;
            }
            
            .${BETREFF_CONFIG.prefix}-button-container {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-start !important;
                padding: 4px 1px 8px 29px !important;
                gap: ${BETREFF_CONFIG.gap} !important;
                flex-wrap: wrap !important;
                max-width: 100% !important;
            }
            
            .${BETREFF_CONFIG.prefix}-action-button {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                border-radius: 3px !important;
                border: 1px solid #d1d5db !important;
                background: #fff !important;
                color: #374151 !important;
                padding: 3px 8px !important;
                min-height: 20px !important;
                font-size: 11px !important;
                white-space: nowrap !important;
                transition: all 0.15s ease !important;
            }
            
            .${BETREFF_CONFIG.prefix}-action-button:hover {
                background: #f9fafb !important;
                border-color: #9ca3af !important;
            }
            
            .${BETREFF_CONFIG.prefix}-action-button.selected {
                background: #eff6ff !important;
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 1px #3b82f6 !important;
                color: #1e40af !important;
            }
            
            .ui-dialog .${BETREFF_CONFIG.prefix}-button-row {
                display: table-row !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .ui-dialog .${BETREFF_CONFIG.prefix}-action-button {
                font-size: 10px !important;
                padding: 2px 6px !important;
                min-height: 18px !important;
            }
            
            .${BETREFF_CONFIG.prefix}-fade {
                animation: betreffFade 0.3s ease-out;
            }
            
            @keyframes betreffFade {
                from {
                    opacity: 0;
                    transform: translateY(-5px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute(`data-${ID}`, 'true');
        document.head.appendChild(style);

        log('CSS injiziert');
    }

    function findBetreffFields(container) {
        const fields = [];
        const labels = container.querySelectorAll('.dw-fieldLabel span');

        for (const label of labels) {
            if (!label.textContent) continue;
            const labelText = label.textContent.trim();

            // ÄNDERUNG: Erweiterte Prüfung für Betreff-Varianten
            const isBetreffField =
                labelText === BETREFF_CONFIG.fieldLabel ||
                labelText === `${BETREFF_CONFIG.fieldLabel}:` ||
                labelText === `${BETREFF_CONFIG.fieldLabel} °` ||
                labelText.startsWith(BETREFF_CONFIG.fieldLabel) && labelText.includes('°');

            if (isBetreffField) {
                const row = label.closest('tr');
                if (!row) continue;

                // ÄNDERUNG: Erweiterte Input-Suche für verschiedene Strukturen
                let input = row.querySelector('input.dw-textField[type="text"]');
                if (!input) {
                    input = row.querySelector('td.table-fields-content input.dw-textField');
                }
                if (!input) {
                    input = row.querySelector('input[type="text"]');
                }
                if (!input) {
                    const contentCell = row.querySelector('td[data-bind*="template"]');
                    if (contentCell) {
                        input = contentCell.querySelector('input.dw-textField, input[type="text"]');
                    }
                }

                if (!input || !isValidField(input)) continue;

                const fieldId = generateFieldId(input, labelText);

                const hasExistingButtons = row.nextElementSibling &&
                    row.nextElementSibling.classList.contains(`${BETREFF_CONFIG.prefix}-button-row`);
                const alreadyProcessed = STATE.processed.has(fieldId);
                const hasButtonsInDOM = document.querySelector(`[data-field-id="${fieldId}"]`);

                if (hasExistingButtons || alreadyProcessed || hasButtonsInDOM) {
                    log(`⏭️ Feld bereits verarbeitet: ${fieldId}`);
                    continue;
                }

                fields.push({ input, row, fieldId, labelText });
                log(`✓ Betreff-Feld gefunden: ${labelText}`);
            }
        }

        return fields;
    }

    // ÄNDERUNG: isValidField Funktion robuster gestaltet
    function isValidField(input) {
        if (!input || !input.isConnected) return false;

        // Prüfe ob Input sichtbar ist (auch in Dialogen)
        const rect = input.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;

        // Prüfe ob Input in einer Tabellenzeile ist
        const hasRow = input.closest('tr');

        // ÄNDERUNG: Auch versteckte Parent-Elemente berücksichtigen (für Knockout-Bindings)
        const computedStyle = window.getComputedStyle(input);
        const isDisplayed = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';

        return hasRow && (isVisible || isDisplayed);
    }

    // ÄNDERUNG: generateFieldId präziser für verschiedene Strukturen
    function generateFieldId(input, labelText) {
        const name = input.name || input.id || '';
        const dataBindAttr = input.getAttribute('data-bind') || '';

        // ÄNDERUNG: Nutze data-bind Attribute als zusätzliche Identifikation
        const bindHash = dataBindAttr ? dataBindAttr.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '') : '';

        const table = input.closest('table');
        const position = table ? Array.from(table.querySelectorAll('input')).indexOf(input) : 0;

        const cleanLabel = labelText.replace(/[^a-zA-Z0-9]/g, '');

        return `betreff_${name}_${bindHash}_${cleanLabel}_${position}`;
    }

    function waitForKnockoutBinding(element, callback, attempts = 0) {
        const maxAttempts = 30;

        if (attempts >= maxAttempts) {
            callback();
            return;
        }

        const input = element.querySelector('input.dw-textField');
        const hasBinding = input && input.hasAttribute('data-bind');

        if (hasBinding) {
            // Warte bis Knockout fertig gebunden hat
            setTimeout(() => waitForKnockoutBinding(element, callback, attempts + 1), 150);
        } else {
            callback();
        }
    }


    function createButtonRow(field) {
        const { input, row, fieldId } = field;

        const buttonRow = document.createElement('tr');
        buttonRow.className = `${BETREFF_CONFIG.prefix}-button-row ${BETREFF_CONFIG.prefix}-fade`;
        buttonRow.setAttribute('data-field-id', fieldId);
        buttonRow.setAttribute('data-injection-time', Date.now());
        buttonRow.style.cssText = 'position:relative!important;display:table-row!important;opacity:1!important;visibility:visible!important;background:inherit!important;';

        const labelCell = document.createElement('td');
        labelCell.className = 'dw-fieldLabel';

        const contentCell = document.createElement('td');
        contentCell.className = `table-fields-content ${BETREFF_CONFIG.prefix}-button-content`;

        const buttonContainer = createButtonContainer(input, fieldId);
        contentCell.appendChild(buttonContainer);

        buttonRow.appendChild(labelCell);
        buttonRow.appendChild(contentCell);

        return buttonRow;
    }

    function createButtonContainer(input, fieldId) {
        const container = document.createElement('div');
        container.className = `${BETREFF_CONFIG.prefix}-button-container`;
        container.setAttribute('data-field-id', fieldId);

        const fragment = document.createDocumentFragment();

        BETREFF_CONFIG.keywords.forEach(keyword => {
            const button = createButton(keyword, input, fieldId);
            fragment.appendChild(button);
        });

        container.appendChild(fragment);
        return container;
    }

    function createButton(keyword, input, fieldId) {
        const button = document.createElement('button');
        button.className = `${BETREFF_CONFIG.prefix}-action-button`;
        button.type = 'button';
        button.textContent = keyword.label;
        button.title = keyword.value;
        button.setAttribute('data-value', keyword.value);
        button.setAttribute('data-field-id', fieldId);

        button.addEventListener('click', (e) => handleButtonClick(e, keyword, input, fieldId), { passive: true });

        return button;
    }

    function handleButtonClick(event, keyword, input, fieldId) {
        event.preventDefault();
        event.stopPropagation();

        const currentValue = input.value.trim();
        const newValue = currentValue ? `${currentValue} | ${keyword.value}` : keyword.value;

        input.value = newValue;

        requestAnimationFrame(() => {
            input.focus();
            ['input', 'change', 'blur'].forEach(eventType => {
                input.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
            });
        });

        log(`Betreff gesetzt: ${keyword.value}`);
    }

    function injectButtons(field) {
        const { row, fieldId } = field;

        if (row.nextElementSibling && row.nextElementSibling.classList.contains(`${BETREFF_CONFIG.prefix}-button-row`)) {
            log(`Button-Reihe bereits vorhanden: ${fieldId}`);
            return false;
        }

        if (document.querySelector(`[data-field-id="${fieldId}"]`)) {
            log(`Button mit Field-ID bereits im DOM: ${fieldId}`);
            return false;
        }

        const buttonRow = createButtonRow(field);

        try {
            row.parentNode.insertBefore(buttonRow, row.nextSibling);

            setTimeout(() => {
                buttonRow.style.display = 'table-row';
                buttonRow.style.opacity = '1';
                buttonRow.style.visibility = 'visible';
            }, 50);

            STATE.processed.add(fieldId);
            log(`✅ Buttons erfolgreich injiziert: ${fieldId}`);
            return true;
        } catch (error) {
            log(`❌ Fehler beim Injizieren: ${fieldId}`, error);
            return false;
        }
    }

    // ÄNDERUNG: processContainer mit Knockout-Unterstützung
    function processContainer(container) {
        // ÄNDERUNG: Warte auf Knockout-Bindings bei Dialogen
        const isDialog = container.classList && container.classList.contains('ui-dialog');

        const processFields = () => {
            const fields = findBetreffFields(container);

            if (fields.length === 0) {
                log('Keine Betreff-Felder gefunden in Container');
                return 0;
            }

            log(`${fields.length} Betreff-Feld(er) gefunden`);

            let injected = 0;
            fields.forEach(field => {
                if (!STATE.processed.has(field.fieldId)) {
                    requestAnimationFrame(() => {
                        if (injectButtons(field)) {
                            injected++;
                        }
                    });
                }
            });

            return injected;
        };

        if (isDialog) {
            waitForKnockoutBinding(container, processFields);
            return 0;
        } else {
            return processFields();
        }
    }

    // ÄNDERUNG: createObserver mit verbesserter Knockout-Erkennung
    function createObserver() {
        let timeout = null;

        const processChanges = () => {
            processContainer(document.body);

            const dialogs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dialogs.forEach(dialog => {
                log('Dialog erkannt, verarbeite...');
                processContainer(dialog);
            });
        };

        const debouncedProcess = (isKnockout = false) => {
            timeout && clearTimeout(timeout);
            const delay = isKnockout ? 800 : 400; // ÄNDERUNG: Längere Wartezeit für Knockout
            timeout = setTimeout(processChanges, delay);
            STATE.timeouts.add(timeout);
        };

        const observer = new MutationObserver(mutations => {
            let shouldProcess = false;
            let knockoutDetected = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            // ÄNDERUNG: Prüfe auf Knockout-Templates und data-bind
                            const hasKnockout = node.hasAttribute && node.hasAttribute('data-bind') ||
                                node.querySelector && node.querySelector('[data-bind]');

                            if (hasKnockout) {
                                knockoutDetected = true;
                            }

                            if (node.classList && node.classList.contains('dw-fieldLabel') ||
                                node.querySelector && node.querySelector('.dw-fieldLabel') ||
                                node.querySelector && node.querySelector('input.dw-textField') ||
                                node.classList && node.classList.contains('ui-dialog-content')) {
                                shouldProcess = true;
                                break;
                            }
                        }
                    }

                    for (const node of mutation.removedNodes) {
                        if (node.nodeType === 1 &&
                            ((node.classList && node.classList.contains(`${BETREFF_CONFIG.prefix}-button-row`)) ||
                                (node.querySelector && node.querySelector(`.${BETREFF_CONFIG.prefix}-button-row`)))) {
                            shouldProcess = true;

                            const fieldId = node.getAttribute && node.getAttribute('data-field-id');
                            if (fieldId) {
                                STATE.processed.delete(fieldId);
                                log(`🗑️ Entfernte Button-Reihe aus processed: ${fieldId}`);
                            }
                            break;
                        }
                    }
                }

                if (shouldProcess) break;
            }

            if (shouldProcess) {
                debouncedProcess(knockoutDetected);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });

        return observer;
    }

    function setupEventListeners() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target &&
                ((target.classList && target.classList.contains('ui-button')) ||
                    target.closest('.ui-button') ||
                    (target.getAttribute && target.getAttribute('data-bind')))) {
                setTimeout(() => {
                    const dialogs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                    dialogs.forEach(dialog => processContainer(dialog));
                }, 1000);
            }
        }, { passive: true });

        window.addEventListener('focus', () => {
            if (STATE.initialized) {
                setTimeout(() => {
                    const dialogs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                    dialogs.forEach(dialog => processContainer(dialog));
                }, 300);
            }
        }, { passive: true });
    }

    function startPeriodicCheck() {
        const checkInterval = setInterval(() => {
            if (!STATE.initialized) return;

            const allButtonsInDOM = document.querySelectorAll(`[data-field-id^="betreff_"]`);
            const activeFieldIds = new Set(
                Array.from(allButtonsInDOM).map(btn => btn.getAttribute('data-field-id'))
            );

            STATE.processed.forEach(fieldId => {
                if (!activeFieldIds.has(fieldId)) {
                    STATE.processed.delete(fieldId);
                    log(`🧹 Cleanup: Verwaiste ID entfernt: ${fieldId}`);
                }
            });

            const fields = findBetreffFields(document.body);
            fields.forEach(field => {
                if (!STATE.processed.has(field.fieldId)) {
                    requestAnimationFrame(() => injectButtons(field));
                }
            });
        }, 30000);

        STATE.timeouts.add(checkInterval);
    }

    function initialize() {
        try {
            injectCSS();

            setTimeout(() => {
                processContainer(document.body);

                const dialogs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
                dialogs.forEach(dialog => processContainer(dialog));
            }, 500);

            STATE.observer = createObserver();
            setupEventListeners();
            startPeriodicCheck();
            STATE.initialized = true;

            log('✅ Betreff-Buttons initialisiert');
        } catch (error) {
            log('❌ Initialisierungsfehler:', error);
        }
    }

    window[ID].api = {
        refresh: () => {
            STATE.processed.clear();
            const count = processContainer(document.body);

            let dialogCount = 0;
            const dialogs = document.querySelectorAll('.ui-dialog.dw-dialogs:not([style*="display: none"])');
            dialogs.forEach(dialog => {
                dialogCount += processContainer(dialog);
            });

            return { standard: count, dialogs: dialogCount };
        },

        status: () => ({
            initialized: STATE.initialized,
            buttons: document.querySelectorAll(`.${BETREFF_CONFIG.prefix}-button-row`).length,
            processed: STATE.processed.size,
            keywords: BETREFF_CONFIG.keywords.length
        }),

        debug: () => {
            console.log('Debug Info:', {
                state: STATE,
                buttons: document.querySelectorAll(`.${BETREFF_CONFIG.prefix}-button-row`),
                config: BETREFF_CONFIG
            });
        }
    };

    function main() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize, { once: true });
        } else {
            setTimeout(initialize, 300);
        }

        setTimeout(() => {
            if (!STATE.initialized) initialize();
        }, 2000);
    }

    main();
})();