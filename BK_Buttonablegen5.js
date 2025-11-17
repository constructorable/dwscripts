// duplicateStoreButtonUnderZuweisenField.js
(function () {
    'use strict';

    const STORE_BUTTON_SELECTOR = 'button[data-trackerevent="store"]';
    const ZUWEISEN_BUTTON_ROW_SELECTOR = 'tr.dw-zuw-button-row.dw-ko-btn-row';
    const DUPLICATED_BUTTON_CLASS = 'dw-store-btn-under-zuweisen';

    let observer = null;

    // CSS für Button unter den Zuweisen-Buttons
    function injectStyles() {
        if (document.getElementById('store-button-under-zuweisen-styles')) return;

        const style = document.createElement('style');
        style.id = 'store-button-under-zuweisen-styles';
        style.textContent = `
            .dw-store-btn-under-zuweisen {
                display: inline-block !important;
                margin-top: 8px !important;
                padding: 6px 20px !important;
                background: #5984c9 !important;
                color: #ffffff !important;
                border: none !important;
                border-radius: 3px !important;
                cursor: pointer !important;
                font-size: 14px !important;
                font-weight: 300 !important;
                transition: all 0.2s ease !important;
                box-shadow: none !important;
                text-align: center !important;
            }

            .dw-store-btn-under-zuweisen:hover {
                background: #2b4979ff !important;
            }

            .dw-store-btn-ablegen-row {
                position: relative !important;
                display: table-row !important;
                opacity: 1 !important;
                visibility: visible !important;
            }

            .dw-store-btn-ablegen-row td {
                padding: 8px 1px 4px 29px !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Zuweisen-Button-Row finden
    function findZuweisenButtonRow() {
        return document.querySelector(ZUWEISEN_BUTTON_ROW_SELECTOR);
    }

    // Prüfen ob Ablegen-Button bereits vorhanden ist
    function hasAbelegenButton(buttonRow) {
        const nextRow = buttonRow.nextElementSibling;
        return nextRow && nextRow.classList.contains('dw-store-btn-ablegen-row');
    }

    // Button-Row einfügen
    function addButtonUnderZuweisenButtons() {
        const zuweisenRow = findZuweisenButtonRow();

        if (!zuweisenRow) {
            console.warn('Zuweisen-Button-Row nicht gefunden');
            return false;
        }

        // Prüfen ob bereits vorhanden
        if (hasAbelegenButton(zuweisenRow)) {
            console.log('Ablegen-Button bereits unter Zuweisen-Buttons vorhanden');
            return true;
        }

        const storeButton = document.querySelector(STORE_BUTTON_SELECTOR);
        if (!storeButton) {
            console.warn('Original Store-Button nicht gefunden');
            return false;
        }

        // Neue Zeile erstellen
        const newRow = document.createElement('tr');
        newRow.className = 'dw-store-btn-ablegen-row dw-ko-btn-row';

        // Leere Label-Zelle
        const labelCell = document.createElement('td');
        labelCell.className = 'dw-fieldLabel';

        // Content-Zelle mit Button
        const contentCell = document.createElement('td');
        contentCell.className = 'table-fields-content';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = DUPLICATED_BUTTON_CLASS;
        button.textContent = 'Ablegen';
        button.setAttribute('title', 'Dokument ablegen (Speichern)');

        // Click-Event
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('Ablegen-Button unter Zuweisen-Buttons geklickt');

            const originalButton = document.querySelector(STORE_BUTTON_SELECTOR);
            if (originalButton) {
                originalButton.click();
            } else {
                console.warn('Original Store-Button nicht gefunden');
            }
        });

        contentCell.appendChild(button);
        newRow.appendChild(labelCell);
        newRow.appendChild(contentCell);

        // Nach der Zuweisen-Button-Row einfügen
        zuweisenRow.parentNode.insertBefore(newRow, zuweisenRow.nextSibling);

        console.log('Ablegen-Button erfolgreich unter Zuweisen-Buttons eingefügt');
        return true;
    }

    // DOM überwachen
    function observeDOM() {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
            const zuweisenRow = findZuweisenButtonRow();

            if (zuweisenRow && !hasAbelegenButton(zuweisenRow)) {
                console.log('Zuweisen-Buttons erkannt - füge Ablegen-Button ein');
                // ÄNDERUNG: Zeitversatz von 300ms
                setTimeout(() => {
                    addButtonUnderZuweisenButtons();
                }, 300);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Zuweisen-Button-Observer aktiviert');
    }

    // Initialisierung
    function init() {
        console.log('Initialisiere Store-Button unter Zuweisen-Buttons');

        // CSS injizieren
        injectStyles();

        // ÄNDERUNG: Mehrfache Versuche mit Zeitversatz
        setTimeout(() => {
            if (addButtonUnderZuweisenButtons()) {
                observeDOM();
            } else {
                setTimeout(() => {
                    if (addButtonUnderZuweisenButtons()) {
                        observeDOM();
                    }
                }, 1000);
            }
        }, 500);

        // Observer sofort starten
        observeDOM();

        // Backup: Regelmäßig prüfen
        setInterval(() => {
            const zuweisenRow = findZuweisenButtonRow();
            if (zuweisenRow && !hasAbelegenButton(zuweisenRow)) {
                setTimeout(() => {
                    addButtonUnderZuweisenButtons();
                }, 300);
            }
        }, 2000);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 500);
        });
    } else {
        setTimeout(init, 500);
    }

})();

