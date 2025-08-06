(function () {
    'use strict';
    const SCRIPT_ID = 'docuware-autocomplete-helper';

    // ÄNDERN: Im CONFIG Objekt, füge diese neue Konfiguration hinzu:
    const CONFIG = {
        IBAN: { buttons: [{ triggerText: 'DE', buttonLabel: 'DE' }], cssPrefix: 'dw-autocomplete-iban', autoSelectRule: 'single_only' },
        'Objekt-Einheit-Nummer': { buttons: [{ triggerText: 'M', buttonLabel: 'M' }, { triggerText: 'W', buttonLabel: 'W' }, { triggerText: 'C', buttonLabel: 'C' }, { triggerText: 'P', buttonLabel: 'P' }, { triggerText: 'E', buttonLabel: 'E' }], cssPrefix: 'dw-autocomplete-oem', autoSelectRule: 'always' },
        'Objekt-Einheit-Miet-Nummer': { buttons: [{ triggerText: 'M', buttonLabel: 'M' }, { triggerText: 'W', buttonLabel: 'W' }, { triggerText: 'C', buttonLabel: 'C' }, { triggerText: 'P', buttonLabel: 'P' }, { triggerText: 'E', buttonLabel: 'E' }], cssPrefix: 'dw-autocomplete-oemn', autoSelectRule: 'always' },
        'betrifft Mieter': { buttons: [{ triggerText: 'Allgemein (', buttonLabel: 'Allgemein' }], cssPrefix: 'dw-autocomplete-mieter', autoSelectRule: 'single_only' } // NEU
    };

    const log = (msg) => console.log(`[Autocomplete] ${msg}`);

    // Reset
    if (window[SCRIPT_ID]) {
        Object.values(CONFIG).forEach(c => document.querySelectorAll(`.${c.cssPrefix}-button-row`).forEach(r => r.remove()));
        document.querySelector('style[data-autocomplete-helper]')?.remove();
        window[SCRIPT_ID].observer?.disconnect();
        window[SCRIPT_ID].listeners?.forEach(({ element, event, handler }) => element.removeEventListener(event, handler));
        window[SCRIPT_ID].timeouts?.forEach(clearTimeout);
        delete window[SCRIPT_ID];
    }

    window[SCRIPT_ID] = { observer: null, listeners: [], timeouts: [], processedFields: new Set() };

    // CSS - ANGEPASST mit gewünschten Styles
    const css = Object.values(CONFIG).map(c => `.${c.cssPrefix}-button-row{background:inherit!important}.${c.cssPrefix}-button-content{word-break:normal!important}.${c.cssPrefix}-button-container{display:flex!important;align-items:center!important;justify-content:flex-start!important;padding:0px 1px 8px 29px!important;gap:6px!important;flex-wrap:wrap!important;margin-top:-5px!important;font-family:inherit;font-size:inherit}.${c.cssPrefix}-action-button{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border-radius:3px;border:1px solid #ccc;white-space:nowrap;background:inherit;color:inherit;font-weight:normal;user-select:none;padding:0px 8px;min-height:20px;font-size:inherit;min-width:25px}.${c.cssPrefix}-action-button:hover{background-color:#f0f0f0}`).join('');
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-autocomplete-helper', 'true');
    document.head.appendChild(style);

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

    // Button creation
    const createButtons = (input, config, fieldName) => {
        const row = input.closest('tr');
        if (!row || row.nextElementSibling?.classList.contains(`${config.cssPrefix}-button-row`)) return false;

        const container = document.createElement('div');
        container.className = `${config.cssPrefix}-button-container`;

        config.buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `${config.cssPrefix}-action-button`;
            button.type = 'button';
            button.textContent = btn.buttonLabel;
            button.title = `Autocomplete ${fieldName} mit "${btn.triggerText}"`;

            track(button, 'click', (e) => {
                e.preventDefault();
                if (!input.value.trim()) trigger(input, btn.triggerText, config);
            });

            container.appendChild(button);
        });

        const newRow = document.createElement('tr');
        newRow.className = `${config.cssPrefix}-button-row`;

        const labelCell = document.createElement('td');
        labelCell.className = 'dw-fieldLabel';

        const contentCell = document.createElement('td');
        contentCell.className = `table-fields-content ${config.cssPrefix}-button-content`;
        contentCell.style.cssText = 'word-break:normal!important';

        contentCell.appendChild(container);
        newRow.appendChild(labelCell);
        newRow.appendChild(contentCell);
        row.parentNode.insertBefore(newRow, row.nextSibling);
        return true;
    };

    // Field processing
    const processFields = () => {
        let count = 0;
        document.querySelectorAll('input.dw-textField').forEach(input => {
            try {
                const label = input.closest('tr')?.querySelector('.dw-fieldLabel span')?.textContent?.trim() || '';
                const config = Object.entries(CONFIG).find(([name]) => label.includes(name))?.[1];

                if (config && input.closest('.right-inner-addons')?.querySelector('button.ac-button')) {
                    const id = `${config.cssPrefix}_${input.name || input.id || Date.now()}`;
                    if (!window[SCRIPT_ID].processedFields.has(id)) {
                        if (createButtons(input, config, label)) {
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
    const init = () => { log('🚀 Started'); processFields(); };
    document.readyState === 'loading' ? track(document, 'DOMContentLoaded', init) : init();
    [500, 1500, 3000, 5000].forEach((ms, i) => delay(() => processFields(), ms));

    log('Multi-Button Autocomplete Helper aktiviert');
})();