// DocuWare Suchmodul mit Supersuche-Button
// Ermöglicht erweiterte Suche mit verschiedenen Dokumenttypen und Kopierfunktion

const DocuWareSearch = (function() {
    'use strict';

    // ÄNDERUNG: searchTerm für alle Bereiche - nur Teilstrings für flexible Suche
    const SEARCH_AREAS = {
        DOCUMENTS: [
            { id: 'doc_all', label: 'Alle Dokumente', cssClass: 'documentArea', checked: true, searchTerm: 'Alle' },
            { id: 'doc_proc', label: 'Vorgänge', cssClass: 'documentArea', searchTerm: 'Vorgänge' }
        ],
        PARTS: [
            { id: 'part_counter', label: 'Zähler', cssClass: 'bauteilArea', searchTerm: 'Zähler' },
            { id: 'part_part', label: 'Bauteile', cssClass: 'bauteilArea', searchTerm: 'Bauteil' }
        ],
        INVOICES: [
            { id: 'docs_invoice', label: 'Rechnungen / Belege', cssClass: 'belegeArea', searchTerm: 'Rechnung' }
        ],
        TENANTS: [
            { id: 'docs_mieter', label: 'Mieter', cssClass: 'mieterArea', searchTerm: 'Mieter' }
        ]
    };

    let elements = {};

    function loadFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
            console.log('✅ FontAwesome geladen');
        }
    }

    function injectButtonStyles() {
        const buttonStyle = document.createElement('style');
        buttonStyle.textContent = `
            .supersucheContentArea {
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            .supersucheContentArea:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }
            .dw-icon-supersucheContentArea:before {
                content: "\\f135";
                font-family: FontAwesome;
                font-size: 16px;
            }
        `;
        document.head.appendChild(buttonStyle);
        return buttonStyle;
    }

    function injectModalStyles() {
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
                height: 50px;
                opacity: 1;
                visibility: visible;
            }

            .inputContainer input[type="text"]:focus {
                border-color: #4b7199;
                outline: none;
                box-shadow: 0 0 5px rgba(75, 113, 153, 0.3);
            }

            .clearButton {
                position: absolute;
                top: 26px;
                right: 8px;
                font-size: 25px;
                background: transparent;
                border: none;
                color: #8e8e8e;
                cursor: pointer;
                opacity: 1;
                visibility: visible;
                transition: opacity 0.3s ease-in-out;
            }

            .clearButton:hover {
                color: #666;
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
                <input type="radio" name="tabOption" id="${area.id}" ${area.checked ? 'checked' : ''} data-search-term="${area.searchTerm}" />
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

    function findAndActivateTab(searchTerm) {
        const tabs = document.querySelectorAll('.dw-tabStrip .ui-tabs-tab a');
        
        for (let tab of tabs) {
            if (tab.textContent.includes(searchTerm)) {
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
            if (inputField.value) {
                inputField.setSelectionRange(inputField.value.length, inputField.value.length);
            }
        }, 150);
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
            focusInputField(elements.inputField);
            return;
        }

        if (!selectedTab) {
            alert('Bitte wählen Sie einen Tab aus.');
            return;
        }

        const searchTerm = selectedTab.getAttribute('data-search-term');
        
        localStorage.setItem('lastSearch', inputValue);
        localStorage.setItem('lastSearchTerm', searchTerm);

        const modifiedValue = inputValue
            .split(' ')
            .map(word => '*' + word + '*')
            .join(' AND ');

        setTimeout(() => {
            elements.inputField.value = '';
            
            const tabId = findAndActivateTab(searchTerm);
            
            if (!tabId) {
                alert(`Die Suche "${searchTerm}" ist nicht geöffnet. Bitte die Suche öffnen und erneut versuchen.`);
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

    // ÄNDERUNG: Restore nutzt searchTerm statt value
    function restoreLastSearch() {
        const lastSearch = localStorage.getItem('lastSearch');
        const lastSearchTerm = localStorage.getItem('lastSearchTerm');

        if (lastSearch) {
            elements.inputField.value = lastSearch;
            focusInputField(elements.inputField);
        }

        if (lastSearchTerm) {
            const radio = document.querySelector(`input[name="tabOption"][data-search-term="${lastSearchTerm}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    }

    function cleanup() {
        elements.container.remove();
        elements.overlay.remove();
        elements.modalStyle.remove();
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
            focusInputField(elements.inputField);
        });

        document.querySelectorAll('.radioGroup').forEach(group => {
            group.addEventListener('click', () => {
                const radio = group.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
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

    function openSearchModal() {
        console.log('✅ Supersuche geklickt - öffne Modal...');
        elements.modalStyle = injectModalStyles();
        const { overlay, container } = createOverlay();
        elements.overlay = overlay;
        elements.container = container;
        
        cacheElements();
        attachEventListeners();
        focusInputField(elements.inputField);
    }

    function addSupersucheButton() {
        const suchenElement = document.querySelector('li.searchContentArea');
        
        if (!suchenElement) {
            console.log('Suchen-Element nicht gefunden, versuche erneut...');
            setTimeout(addSupersucheButton, 500);
            return;
        }
        
        if (document.querySelector('.supersucheContentArea')) {
            console.log('Supersuche-Button bereits vorhanden');
            return;
        }
        
        const supersucheElement = document.createElement('li');
        supersucheElement.tabIndex = 0;
        supersucheElement.className = 'supersucheContentArea';
        supersucheElement.setAttribute('tabbable-command', 'true');
        
        supersucheElement.innerHTML = `
            <div class="dw-relativeContainer">
                <div class="ui-icon icon-auto c-inh m-l-10 dw-icon-supersucheContentArea"></div>
                <span class="label">Supersuche</span>
            </div>
        `;
        
        suchenElement.parentNode.insertBefore(supersucheElement, suchenElement.nextSibling);
        
        supersucheElement.addEventListener('click', openSearchModal);
        
        console.log('✅ Supersuche-Button erfolgreich hinzugefügt');
    }

    function init() {
        console.log('🔍 Starte Supersuche-Button mit Modal...');
        loadFontAwesome();
        injectButtonStyles();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addSupersucheButton);
        } else {
            addSupersucheButton();
        }
    }

    return {
        init
    };
})();


DocuWareSearch.init();
