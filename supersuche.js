(function() {
    console.log('🔍 Starte Supersuche-Button mit Modal...');
    
    // FontAwesome laden falls nicht vorhanden
    if(!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
        console.log('✅ FontAwesome geladen');
    }
    
    function openSearchModal() {
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

        var style = document.createElement('style');
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
                left: 25%;
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
                background: #0000;
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
                transition: filter 0.3s;
            }
            .radioGroup label {
                font-family: Tahoma, Arial, sans-serif;
                font-size: 14px;
                cursor: pointer;
                transition: filter 0.3s;
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
            .startButton, .startButton2, .restoreButton {
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
            .startButton, .startButton2 {
                background-color: #4b7199;
                font-size: 16px;
            }
            .startButton:hover, .startButton2:hover {
                background-color: #2d5075;
            }
            .restoreButton {
                background-color: #888;
            }
            .restoreButton:hover {
                background-color: #a4a4a4;
            }
            .radioGroup.documentArea {
                background-color: #d9e6f6;
                padding: 11px 19px 11px 11px;
                border-top: 5px solid #0089cf;
                border-radius: 3px;
                box-shadow: 3px 3px 7px 1px #c6c6c652;
            }
            .radioGroup.bauteilArea {
                background-color: #e1f3e2;
                padding: 11px 19px 11px 11px;
                border-radius: 3px;
                box-shadow: 3px 3px 7px 1px #c6c6c652;
                border-top: 5px solid #368d2e;
            }
            .radioGroup.belegeArea {
                background-color: #fcf2ce;
                padding: 11px 19px 11px 11px;
                border-radius: 3px;
                box-shadow: 3px 3px 7px 1px #c6c6c652;
                border-top: 5px solid #fcb200;
            }
            .radioGroup.mieterArea {
                background-color: #e1e1e1;
                padding: 11px 19px 11px 11px;
                border-radius: 3px;
                box-shadow: 3px 3px 7px 1px #c6c6c652;
                border-top: 5px solid #535353;
            }
            .checkboxContainer {
                margin-top: 10px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
            }
            .checkboxContainer input[type="checkbox"] {
                margin-right: 4px;
            }
            .Suchcontainer {
                display: flex;
                gap: 10px;
            }
            .checkbox-container {
                position: absolute;
                right: 0;
                margin-right: 31px;
                bottom: 147px;
            }
        `;
        document.head.appendChild(style);

        var overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);

        var container = document.createElement('div');
        container.className = 'inputContainer';
        container.innerHTML = `
            <button class="closeButton">×</button>
            <div class="title">Suche</div>
            <div class="radioButtons">
                <div class="radioGroup documentArea">
                    <input type="radio" name="tabOption" value="Dokumente - Alle" id="doc_all" checked />
                    <label for="doc_all">Alle Dokumente</label>
                </div>
                <div class="radioGroup documentArea">
                    <input type="radio" name="tabOption" value="Vorgänge" id="doc_proc" />
                    <label for="doc_proc">Vorgänge</label>
                </div>
                <div class="radioGroup bauteilArea">
                    <input type="radio" name="tabOption" value="Bauteile - Zähler" id="part_counter" />
                    <label for="part_counter">Zähler</label>
                </div>
                <div class="radioGroup bauteilArea">
                    <input type="radio" name="tabOption" value="Bauteile - Bauteil" id="part_part" />
                    <label for="part_part">Bauteile</label>
                </div>
                <div class="radioGroup belegeArea">
                    <input type="radio" name="tabOption" value="Belege - Suche - Rechnung" id="docs_invoice" />
                    <label for="docs_invoice">Rechnungen / Belege</label>
                </div>
                <div class="radioGroup mieterArea">
                    <input type="radio" name="tabOption" value="MietFirmEtPersKont - Mieter" id="docs_mieter" />
                    <label for="docs_mieter">Mieter</label>
                </div>
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
        document.body.appendChild(container);

        const inputField = document.getElementById('inputField');
        const clearButton = document.querySelector('.clearButton');

        const focusInputField = () => {
            setTimeout(() => {
                inputField.focus();
                if (inputField.value) {
                    inputField.setSelectionRange(inputField.value.length, inputField.value.length);
                }
            }, 150);
        };

        function copyTableValues() {
            let copied = false;
            function copyText(textToCopy, targetElement) {
                if (copied) return;
                copied = true;
                textToCopy = textToCopy.replace(/[\u200B]+/g, '').trim();
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const popup = document.createElement('div');
                    popup.textContent = 'Wert kopiert: ' + textToCopy;
                    popup.style.position = 'fixed';
                    popup.style.left = `${targetElement.getBoundingClientRect().left}px`;
                    popup.style.top = `${targetElement.getBoundingClientRect().bottom + window.scrollY}px`;
                    popup.style.backgroundColor = 'rgba(0,0,0,0.7)';
                    popup.style.color = 'white';
                    popup.style.padding = '10px';
                    popup.style.borderRadius = '5px';
                    popup.style.zIndex = '9999';
                    document.body.appendChild(popup);
                    setTimeout(() => {
                        document.body.removeChild(popup);
                        copied = false;
                    }, 1500);
                }).catch(err => {
                    console.error('Fehler beim Kopieren: ', err);
                    alert('Fehler beim Kopieren: ' + err.message);
                });
            }
            document.querySelectorAll('.slick-cell').forEach(cell => {
                cell.addEventListener('click', function () {
                    const textToCopy = Array.from(this.childNodes)
                        .filter(node => node.nodeType === Node.TEXT_NODE)
                        .map(node => node.textContent.trim())
                        .join('');
                    copyText(textToCopy, this);
                });
            });
        }

        function processInput() {
            const inputValue = inputField.value;
            const selectedTab = document.querySelector('input[name="tabOption"]:checked');
            
            if (!inputValue) {
                alert('Bitte einen Suchbegriff eingeben.');
                focusInputField();
                return;
            }
            
            if (!selectedTab) {
                alert('Bitte wählen Sie einen Tab aus.');
                return;
            }

            localStorage.setItem('lastSearch', inputValue);
            localStorage.setItem('lastArea', selectedTab.value);

            const modifiedValue = inputValue.split(' ').map(word => '*' + word + '*').join(' AND ');

            setTimeout(() => {
                inputField.value = '';
                const tabId = findAndActivateTab(selectedTab.value);
                if (!tabId) {
                    alert(`Die Suche "${selectedTab.value}" ist nicht geöffnet. Bitte die Suche öffnen und erneut versuchen.`);
                    return;
                }

                activateSearchTab();
                var escapedTabId = CSS.escape(tabId);
                
                document.querySelectorAll('input.dw-textField').forEach(field => {
                    field.value = '';
                    var event = new Event('input', { bubbles: true });
                    field.dispatchEvent(event);
                });

                var firstDocuWareField = document.querySelector(`#${escapedTabId} input.dw-textField`);
                if (firstDocuWareField) {
                    firstDocuWareField.value = modifiedValue;
                    var event = new Event('input', { bubbles: true });
                    firstDocuWareField.dispatchEvent(event);
                }

                var allDocuWareFields = document.querySelectorAll(`#${escapedTabId} input.dw-textField`);
                if (allDocuWareFields.length >= 3) {
                    var thirdDocuWareField = allDocuWareFields[2];
                    if (document.getElementById('activeHouseCheckbox').checked) {
                        thirdDocuWareField.value = 'j';
                    } else {
                        thirdDocuWareField.value = '';
                    }
                    var event = new Event('input', { bubbles: true });
                    thirdDocuWareField.dispatchEvent(event);
                }

                var submitButton = document.querySelector(`#${escapedTabId} .main.ui-button[data-bind*="commands.searchCommand"]`);
                if (submitButton) {
                    submitButton.click();
                }

                setTimeout(() => {
                    if (document.querySelector('.startButton2:focus')) {
                        copyTableValues();
                    }
                }, 2000);

                container.remove();
                overlay.remove();
                style.remove();
            }, 500);
        }

        inputField.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                processInput();
            }
        });

        document.querySelector('.startButton').addEventListener('click', processInput);

        document.querySelector('.restoreButton').addEventListener('click', () => {
            const lastSearch = localStorage.getItem('lastSearch');
            const lastArea = localStorage.getItem('lastArea');
            
            if (lastSearch) {
                inputField.value = lastSearch;
                focusInputField();
            }
            if (lastArea) {
                const radioButton = document.querySelector(`input[name="tabOption"][value="${lastArea}"]`);
                if (radioButton) {
                    radioButton.checked = true;
                }
            }
        });

        document.querySelector('.closeButton').addEventListener('click', () => {
            container.remove();
            overlay.remove();
            style.remove();
        });

        document.querySelectorAll('.radioGroup').forEach(group => {
            group.addEventListener('click', () => {
                const radio = group.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    focusInputField();
                }
            });
        });

        clearButton.addEventListener('click', () => {
            inputField.value = '';
            focusInputField();
        });

        document.querySelector('.startButton2').addEventListener('click', async () => {
            await processInput();
            setTimeout(copyTableValues, 2000);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                container.remove();
                overlay.remove();
                style.remove();
            }
        });

        focusInputField();
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
        
        supersucheElement.addEventListener('click', function() {
            console.log('✅ Supersuche geklickt - öffne Modal...');
            openSearchModal();
        });
        
        console.log('✅ Supersuche-Button erfolgreich hinzugefügt');
    }
    
    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addSupersucheButton);
    } else {
        addSupersucheButton();
    }
})();