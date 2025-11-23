(function () {
    'use strict';
    const SCRIPT_ID = '03autocomplete';

    // NEU: Individuelle Positionierung pro Feld-Typ
    const POSITION = {
        default: {
            standard: {
                position: 'absolute',
                top: '0px',
                left: '210px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },

        IBAN: {
            standard: {
                position: 'absolute',
                top: '0px',
                left: '240px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '0px',
                left: '70px',
                zIndex: '1000'
            }
        },

        'Objekt-Einheit-Nummer': {
            standard: {
                position: 'absolute',
                top: '0px',
                left: '210px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },

        'Objekt-Einheit-Miet-Nummer': {
            standard: {
                position: 'absolute',
                top: '0px',
                left: '210px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '2px',
                left: '70px',
                zIndex: '1000'
            }
        },

        'betrifft Mieter': {
            standard: {
                position: 'absolute',
                top: '0px',
                left: '300px',
                zIndex: '1000'
            },
            modal: {
                position: 'absolute',
                top: '0px',
                left: '70px',
                zIndex: '1000'
            }
        }
    };

    const CONFIG = {
        IBAN: {
            buttons: [{ triggerText: 'DE', buttonLabel: 'DE' }],
            cssPrefix: 'dw-autocomplete-iban',
            autoSelectRule: 'single_only'
        },
        'Objekt-Einheit-Nummer': {
            buttons: [
                { triggerText: 'M', buttonLabel: 'M' },
                { triggerText: 'W', buttonLabel: 'W' },
                { triggerText: 'C', buttonLabel: 'C' },
                { triggerText: 'P', buttonLabel: 'P' },
                { triggerText: 'E', buttonLabel: 'E' }
            ],
            cssPrefix: 'dw-autocomplete-oem',
            autoSelectRule: 'always'
        },
        'Objekt-Einheit-Miet-Nummer': {
            buttons: [
                { triggerText: 'M', buttonLabel: 'M' },
                { triggerText: 'W', buttonLabel: 'W' },
                { triggerText: 'C', buttonLabel: 'C' },
                { triggerText: 'P', buttonLabel: 'P' },
                { triggerText: 'E', buttonLabel: 'E' }
            ],
            cssPrefix: 'dw-autocomplete-oemn',
            autoSelectRule: 'always'
        },
        'betrifft Mieter': {
            buttons: [{ triggerText: 'Allgemein (', buttonLabel: 'Allgemein' }],
            cssPrefix: 'dw-autocomplete-mieter',
            autoSelectRule: 'single_only'
        }
    };

    const log = (msg) => console.log(`[Autocomplete] ${msg}`);

    // Reset
    if (window[SCRIPT_ID]) {
        Object.values(CONFIG).forEach(c => document.querySelectorAll(`.${c.cssPrefix}-button-row, .${c.cssPrefix}-button-container`).forEach(r => r.remove()));
        document.querySelector('style[data-autocomplete-helper]')?.remove();
        window[SCRIPT_ID].observer?.disconnect();
        window[SCRIPT_ID].listeners?.forEach(({ element, event, handler }) => element.removeEventListener(event, handler));
        window[SCRIPT_ID].timeouts?.forEach(clearTimeout);
        delete window[SCRIPT_ID];
    }

    window[SCRIPT_ID] = { observer: null, listeners: [], timeouts: [], processedFields: new Set() };

    // ÄNDERUNG: Dynamisches CSS mit individuellen Positionen
    function injectCSS() {
        if (document.querySelector('style[data-autocomplete-helper]')) return;

        let css = `
/* Content-Cell Vorbereitung */
td.table-fields-content {
    position: relative !important;
}

/* Standard Inline-Button Container */
.dw-autocomplete-inline-buttons {
    position: ${POSITION.default.standard.position} !important;
    top: ${POSITION.default.standard.top} !important;
    left: ${POSITION.default.standard.left} !important;
    z-index: ${POSITION.default.standard.zIndex} !important;
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    flex-wrap: nowrap !important;
    pointer-events: auto !important;
}

/* Modal Standard */
.dw-autocomplete-inline-buttons.in-modal {
    position: ${POSITION.default.modal.position} !important;
    top: ${POSITION.default.modal.top} !important;
    left: ${POSITION.default.modal.left} !important;
    z-index: ${POSITION.default.modal.zIndex} !important;
}
`;

        // NEU: Individuelle Positionen für jeden Feld-Typ
        Object.keys(POSITION).forEach(fieldType => {
            if (fieldType === 'default') return;

            const pos = POSITION[fieldType];
            const safeClass = fieldType.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();

            css += `
/* ${fieldType} - Standard */
.dw-autocomplete-inline-buttons[data-field-type="${fieldType}"] {
    position: ${pos.standard.position} !important;
    top: ${pos.standard.top} !important;
    left: ${pos.standard.left} !important;
    z-index: ${pos.standard.zIndex} !important;
}

/* ${fieldType} - Modal */
.dw-autocomplete-inline-buttons[data-field-type="${fieldType}"].in-modal {
    position: ${pos.modal.position} !important;
    top: ${pos.modal.top} !important;
    left: ${pos.modal.left} !important;
    z-index: ${pos.modal.zIndex} !important;
}
`;
        });

        // Button-Styles
        css += `
/* Button-Styling */
.dw-autocomplete-inline-buttons button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    border-radius: 2px !important;
    border: 1px solid #d1d5db !important;
    background: rgba(255, 255, 255, 0.95) !important;
    color: #374151 !important;
    padding: 2px 8px !important;
    min-height: 20px !important;
    min-width: 25px !important;
    font-size: 12px !important;
    font-weight: normal !important;
    white-space: nowrap !important;
    line-height: 1.2 !important;
    margin: 0 !important;
    user-select: none !important;
    transition: all 0.15s ease !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.dw-autocomplete-inline-buttons button:hover {
    background: rgba(240, 240, 240, 0.98) !important;
    border-color: #9ca3af !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.ui-dialog .dw-autocomplete-inline-buttons button {
    font-size: 10px !important;
    padding: 2px 6px !important;
    min-height: 18px !important;
    min-width: 20px !important;
}
`;

        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-autocomplete-helper', 'true');
        document.head.appendChild(style);
    }

    const track = (element, event, handler) => {
        element.addEventListener(event, handler);
        window[SCRIPT_ID].listeners.push({ element, event, handler });
    };

    const delay = (callback, ms) => {
        const id = setTimeout(callback, ms);
        window[SCRIPT_ID].timeouts.push(id);
        return id;
    };

    // Autocomplete logic
    const trigger = (input, text, config) => {
        try {
            input.focus();
            if (text) {
                input.value = text;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                delay(() => {
                    input.value = text + ' ';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ' ', keyCode: 32 }));
                    delay(() => {
                        input.value = text;
                        input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Backspace', keyCode: 8 }));
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        waitAndSelect(input, config);
                    }, 11);
                }, 11);
            } else {
                const btn = input.closest('.right-inner-addons')?.querySelector('button.ac-button');
                if (btn) { btn.click(); waitAndSelect(input, config); }
            }
        } catch (e) { log('❌ Trigger error: ' + e); }
    };

    const waitAndSelect = (input, config, attempts = 1) => {
        const dropdown = document.querySelector('.dw-autocompleteScrollArea');
        if (dropdown?.offsetParent && dropdown.style.display !== 'none') {
            delay(() => selectItem(dropdown, input, config), 200);
        } else if (attempts < 20) {
            delay(() => waitAndSelect(input, config, attempts + 1), 150);
        }
    };

    const selectItem = (dropdown, input, config) => {
        try {
            const items = dropdown.querySelectorAll('.dw-MultiControlList li');
            const shouldSelect = config.autoSelectRule === 'always' || (config.autoSelectRule === 'single_only' && items.length === 1);
            if (shouldSelect && items[0]) {
                const text = items[0].textContent?.trim();
                try {
                    items[0].click();
                    log(`✅ Selected: ${text}`);
                } catch {
                    items[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    log(`✅ Selected (event): ${text}`);
                }
            }
        } catch (e) { log('❌ Select error: ' + e); }
    };

    // ÄNDERUNG: Prüft ob Buttons bereits in Content-Cell existieren
    function hasButtons(contentCell, cssPrefix) {
        return contentCell.querySelector(`.${cssPrefix}-button-container, .dw-autocomplete-inline-buttons[data-css-prefix="${cssPrefix}"]`) !== null;
    }

    // ÄNDERUNG: Button-Erstellung als Inline-Container
    const createButtons = (input, config, fieldName, configKey) => {
        const row = input.closest('tr');
        if (!row) return false;

        const contentCell = input.closest('td.table-fields-content');
        if (!contentCell) return false;

        if (hasButtons(contentCell, config.cssPrefix)) return false;

        // Content-Cell für relative Positionierung vorbereiten
        if (getComputedStyle(contentCell).position === 'static') {
            contentCell.style.position = 'relative';
        }

        const container = document.createElement('div');
        container.className = `${config.cssPrefix}-button-container dw-autocomplete-inline-buttons`;
        container.setAttribute('data-field-type', configKey); // NEU: Feld-Typ für CSS-Selektor
        container.setAttribute('data-css-prefix', config.cssPrefix);

        // NEU: Modal-Erkennung
        const inModal = input.closest('.ui-dialog') !== null;
        if (inModal) {
            container.classList.add('in-modal');
        }

        config.buttons.forEach(btn => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = btn.buttonLabel;
            button.title = `Autocomplete ${fieldName} mit "${btn.triggerText}"`;

            track(button, 'click', (e) => {
                e.preventDefault();
                if (!input.value.trim()) trigger(input, btn.triggerText, config);
            });

            container.appendChild(button);
        });

        // NEU: Container direkt in Content-Cell einfügen (nicht als neue Zeile)
        contentCell.appendChild(container);

        log(`✅ Inline-Buttons eingefügt für: ${configKey}`);
        return true;
    };

    // ÄNDERUNG: Field processing mit configKey
    const processFields = () => {
        let count = 0;
        document.querySelectorAll('input.dw-textField').forEach(input => {
            try {
                const label = input.closest('tr')?.querySelector('.dw-fieldLabel span')?.textContent?.trim() || '';

                // NEU: configKey mit übergeben
                const configEntry = Object.entries(CONFIG).find(([name]) => label.includes(name));
                if (!configEntry) return;

                const [configKey, config] = configEntry;

                if (config && input.closest('.right-inner-addons')?.querySelector('button.ac-button')) {
                    const id = `${config.cssPrefix}_${input.name || input.id || Date.now()}`;
                    if (!window[SCRIPT_ID].processedFields.has(id)) {
                        if (createButtons(input, config, label, configKey)) {
                            window[SCRIPT_ID].processedFields.add(id);
                            count++;
                        }
                    }
                }
            } catch (e) { log('Process error: ' + e); }
        });
        if (count > 0) log(`${count} fields processed`);
    };

    // Observer
    window[SCRIPT_ID].observer = new MutationObserver(() => delay(processFields, 500));
    window[SCRIPT_ID].observer.observe(document.body, { childList: true, subtree: true });

    // Initialize
    const init = () => {
        log('🚀 Started');
        injectCSS(); // NEU: CSS injizieren
        processFields();
    };

    document.readyState === 'loading' ? track(document, 'DOMContentLoaded', init) : init();
    [500, 1500, 3000, 5000].forEach((ms, i) => delay(() => processFields(), ms));

    log('Multi-Button Autocomplete Helper mit individueller Positionskontrolle aktiviert');
})();

