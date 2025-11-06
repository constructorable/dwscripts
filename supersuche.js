// DocuWare Suchmodul
// Ermöglicht erweiterte Suche mit verschiedenen Dokumenttypen und Kopierfunktion

const DocuWareSearch = (function() {
    'use strict';

    // Konfiguration der Suchbereiche
    const SEARCH_AREAS = {
        DOCUMENTS: [
            { id: 'doc_all', value: 'Alle', label: 'Alle Dokumente', cssClass: 'documentArea' },
            { id: 'doc_proc', value: 'Vorgänge', label: 'Vorgänge', cssClass: 'documentArea' }
        ],
        PARTS: [
            { id: 'part_counter', value: 'Zähler', label: 'Zähler', cssClass: 'bauteilArea' },
            { id: 'part_part', value: 'Bauteil', label: 'Bauteile', cssClass: 'bauteilArea' }
        ],
        INVOICES: [
            { id: 'docs_invoice', value: 'Rechnung', label: 'Belege', cssClass: 'belegeArea' }
        ],
        TENANTS: [
            { id: 'docs_mieter', value: 'Mieter', label: 'Mieter', cssClass: 'mieterArea' }
        ]
    };

    let elements = {};

    function injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999998;
            }

            .inputContainer {
                position: fixed;
                top: 25%;
                left: 50%;
                height: 444px;
                transform: translate(-50%, -50%);
                background: #fffffffa;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
                font-family: Arial, sans-serif;
                width: 840px;
                text-align: left;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                min-height: 420px;
            }

            .inputContainer input[type="text"] {
                width: 100%;
                padding: 23px 10px;
                margin-top: 20px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 14px;
                transition: border 0.3s ease-in-out;
                opacity: 0;
                visibility: hidden;
                height: 50px;
            }

            .inputContainer input[type="text"].visible {
                opacity: 1;
                visibility: visible;
                transition: opacity 0.5s ease-in-out;
            }

            .clearButton {
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.5s ease-in-out;
                position: absolute;
                top: 26px;
                right: 8px;
                font-size: 25px;
            }

            .clearButton.visible {
                opacity: 1;
                visibility: visible;
                background: transparent;
                border: none;
                color: #8e8e8e;
                cursor: pointer;
            }

            .radioButtons {
                display: flex;
                flex-direction: row;
                gap: 9px;
                margin-bottom: 32px;
                height: 50px;
            }

            .radioGroup {
                display: flex;
                align-items: center;
                margin-bottom: 7px;
                white-space: nowrap;
                cursor: pointer;
            }

            .radioGroup:hover {
                filter: brightness(0.95);
            }

            .radioGroup input {
                margin-right: 10px;
                cursor: pointer;
            }

            .radioGroup label {
                font-family: Tahoma, Arial, sans-serif;
                font-size: 14px;
                cursor: pointer;
            }

            .radioGroup.documentArea {
                background-color: #d9e6f6;
                padding: 11px 19px 11px 11px;
                border-top: 5px solid #0089cf;
                border-radius: 3px;
                box-shadow: 3px 3px 7px 1px rgba(198, 198, 198, 0.32);
            }

            .radioGroup.bauteilArea {
                background-color: #e1f3e2;
                padding: 11px 19px 11px 11px;
                border-radius: 3px;
                box-shadow: 3px 3px 7px 1px rgba(198, 198, 198, 0.32);
                border-top: 5px solid #368d2e;
            }

            .radioGroup.belegeArea {
                background-color: #fcf2ce;
                padding: 11px 19px 11px 11px;
                border-radius: 3px;
                box-shadow: 3px 3px 7px 1px rgba(198, 198, 198, 0.32);
                border-top: 5px solid #fcb200;
            }

            .radioGroup.mieterArea {
                background-color: #e1e1e1;
                padding: 11px 19px 11px 11px;
                border-radius: 3px;
                box-shadow: 3px 3px 7px 1px rgba(198, 198, 198, 0.32);
                border-top: 5px solid #535353;
            }

            .closeButton {
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                color: #919191;
                font-size: 24px;
                cursor: pointer;
            }

            .title {
                font-size: 22px;
                margin-bottom: 20px;
                color: #333;
                text-align: center;
            }

            .startButton,
            .startButton2,
            .restoreButton {
                margin-top: 1px;
                padding: 14px;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                align-self: center;
                font-size: 14px;
                width: 100%;
            }

            .startButton,
            .startButton2 {
                background-color: #4b7199;
                font-size: 16px;
            }

            .startButton:hover,
            .startButton2:hover {
                background-color: #2d5075;
            }

            .restoreButton {
                background-color: #888;
            }

            .restoreButton:hover {
                background-color: #a4a4a4;
            }

            .checkbox-container {
                position: absolute;
                right: 31px;
                bottom: 147px;
            }

            .Suchcontainer {
                display: flex;
                gap: 10px;
            }
        `;
        
        document.head.appendChild(style);
        return style;
    }

    function createOverlayHTML() {
        const allAreas = [
            ...SEARCH_AREAS.DOCUMENTS,
            ...SEARCH_AREAS.PARTS,
            ...SEARCH_AREAS.INVOICES,
            ...SEARCH_AREAS.TENANTS
        ];

        const radioButtonsHTML = allAreas.map(area => `
            <div class="radioGroup ${area.cssClass}">
                <input type="radio" name="tabOption" value="${area.value}" id="${area.id}" />
                <label for="${area.id}">${area.label}</label>
            </div>
        `).join('');

        return `
            <button class="closeButton">×</button>
            <div class="title">Suche</div>
            <div class="radioButtons">
                ${radioButtonsHTML}
            </div>
            <div style="position:relative;">
                <input type="text" id="inputField" placeholder="Suchbegriffe eingeben..." />
                <button class="clearButton">×</button>
            </div>
            <div class="checkbox-container">
                <label for="activeHouseCheckbox">Aktives Haus</label>
                <input type="checkbox" id="activeHouseCheckbox" checked>
            </div>
            <div class="Suchcontainer">
                <button class="startButton">Suche</button>
                <button class="startButton2">Suche mit Kopierfunktion</button>
            </div>
            <button class="restoreButton">Letzte Suche einfügen</button>
        `;
    }

    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const container = document.createElement('div');
        container.className = 'inputContainer';
        container.innerHTML = createOverlayHTML();

        document.body.appendChild(overlay);
        document.body.appendChild(container);

        return { overlay, container };
    }

    function findAndActivateTab(tabName) {
        const tabs = document.querySelectorAll('.dw-tabStrip .ui-tabs-tab a');
        
        for (let tab of tabs) {
            if (tab.textContent.includes(tabName)) {
                if (!tab.closest('.ui-tabs-tab').classList.contains('ui-state-active')) {
                    tab.click();
                }
                return tab.getAttribute('href').substring(1);
            }
        }
        
        return null;
    }

    function activateSearchTab() {
        const searchTab = document.querySelector('.dw-navigationTab li.searchContentArea');
        
        if (searchTab && !searchTab.classList.contains('active')) {
            searchTab.click();
        }
    }

    function focusInputField(inputField) {
        setTimeout(() => {
            inputField.focus();
        }, 100);
    }

    function setupCopyTableValues() {
        let copied = false;

        function copyText(textToCopy, targetElement) {
            if (copied) return;
            
            copied = true;
            textToCopy = textToCopy.replace(/[\u200B]+/g, '').trim();

            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    const popup = document.createElement('div');
                    popup.textContent = 'Wert kopiert: ' + textToCopy;
                    popup.style.position = 'fixed';
                    popup.style.left = `${targetElement.getBoundingClientRect().left}px`;
                    popup.style.top = `${targetElement.getBoundingClientRect().bottom + window.scrollY}px`;
                    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    popup.style.color = 'white';
                    popup.style.padding = '10px';
                    popup.style.borderRadius = '5px';
                    popup.style.zIndex = '9999';
                    
                    document.body.appendChild(popup);
                    
                    setTimeout(() => {
                        document.body.removeChild(popup);
                        copied = false;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Fehler beim Kopieren: ', err);
                    alert('Fehler beim Kopieren: ' + err.message);
                });
        }

        document.querySelectorAll('.slick-cell').forEach(cell => {
            cell.addEventListener('click', function() {
                const textToCopy = Array.from(this.childNodes)
                    .filter(node => node.nodeType === Node.TEXT_NODE)
                    .map(node => node.textContent.trim())
                    .join('');
                
                copyText(textToCopy, this);
            });
        });
    }

    function processSearch(inputValue, selectedTab, withCopy = false) {
        if (!inputValue) {
            alert('Bitte einen Suchbegriff eingeben.');
            return;
        }

        if (!selectedTab) {
            alert('Bitte wählen Sie einen Tab aus.');
            return;
        }

        localStorage.setItem('lastSearch', inputValue);
        localStorage.setItem('lastArea', selectedTab.value);

        const modifiedValue = inputValue
            .split(' ')
            .map(word => '*' + word + '*')
            .join(' AND ');

        setTimeout(() => {
            elements.inputField.value = '';
            
            const tabId = findAndActivateTab(selectedTab.value);
            
            if (!tabId) {
                alert(`Die Suche "${selectedTab.value}" ist nicht geöffnet. Bitte die Suche öffnen und erneut versuchen.`);
                return;
            }

            activateSearchTab();

            const escapedTabId = CSS.escape(tabId);

            document.querySelectorAll('input.dw-textField').forEach(field => {
                field.value = '';
                const event = new Event('input', { bubbles: true });
                field.dispatchEvent(event);
            });

            const firstDocuWareField = document.querySelector(`#${escapedTabId} input.dw-textField`);
            if (firstDocuWareField) {
                firstDocuWareField.value = modifiedValue;
                const event = new Event('input', { bubbles: true });
                firstDocuWareField.dispatchEvent(event);
            }

            const allDocuWareFields = document.querySelectorAll(`#${escapedTabId} input.dw-textField`);
            if (allDocuWareFields.length >= 3) {
                const thirdDocuWareField = allDocuWareFields[2];
                thirdDocuWareField.value = elements.activeHouseCheckbox.checked ? 'j' : '';
                const event = new Event('input', { bubbles: true });
                thirdDocuWareField.dispatchEvent(event);
            }

            const submitButton = document.querySelector(`#${escapedTabId} .main.ui-button[data-bind*="commands.searchCommand"]`);
            if (submitButton) {
                submitButton.click();
            }

            if (withCopy) {
                setTimeout(setupCopyTableValues, 2000);
            }

            cleanup();
        }, 500);
    }

    function restoreLastSearch() {
        const lastSearch = localStorage.getItem('lastSearch');
        const lastArea = localStorage.getItem('lastArea');

        if (lastSearch) {
            elements.inputField.value = lastSearch;
            elements.inputField.classList.add('visible');
            elements.clearButton.classList.add('visible');
            focusInputField(elements.inputField);
        }

        if (lastArea) {
            const radio = document.querySelector(`input[name="tabOption"][value="${lastArea}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    }

    function cleanup() {
        elements.container.remove();
        elements.overlay.remove();
        elements.style.remove();
    }

    function attachEventListeners() {
        elements.inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const selectedTab = document.querySelector('input[name="tabOption"]:checked');
                processSearch(elements.inputField.value, selectedTab);
            }
        });

        elements.startButton.addEventListener('click', () => {
            const selectedTab = document.querySelector('input[name="tabOption"]:checked');
            processSearch(elements.inputField.value, selectedTab);
        });

        elements.startButton2.addEventListener('click', () => {
            const selectedTab = document.querySelector('input[name="tabOption"]:checked');
            processSearch(elements.inputField.value, selectedTab, true);
        });

        elements.restoreButton.addEventListener('click', restoreLastSearch);

        elements.closeButton.addEventListener('click', cleanup);

        elements.clearButton.addEventListener('click', () => {
            elements.inputField.value = '';
        });

        document.querySelectorAll('.radioGroup').forEach(group => {
            group.addEventListener('click', () => {
                const radio = group.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    elements.inputField.classList.add('visible');
                    elements.clearButton.classList.add('visible');
                    focusInputField(elements.inputField);
                }
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                cleanup();
            }
        });
    }

    function cacheElements() {
        elements.inputField = document.getElementById('inputField');
        elements.clearButton = document.querySelector('.clearButton');
        elements.activeHouseCheckbox = document.getElementById('activeHouseCheckbox');
        elements.startButton = document.querySelector('.startButton');
        elements.startButton2 = document.querySelector('.startButton2');
        elements.restoreButton = document.querySelector('.restoreButton');
        elements.closeButton = document.querySelector('.closeButton');
    }

    function init() {
        elements.style = injectStyles();
        const { overlay, container } = createOverlay();
        elements.overlay = overlay;
        elements.container = container;
        
        cacheElements();
        attachEventListeners();
        focusInputField(elements.inputField);
    }

    return {
        init
    };
})();

// Initialisierung
DocuWareSearch.init();
