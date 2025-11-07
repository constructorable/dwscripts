// duplicateStoreButtonUnderZuweisenField.js
(function () {
    'use strict';

    const STORE_BUTTON_SELECTOR = 'button[data-trackerevent="store"]';
    const ZUWEISEN_LABEL_SELECTOR = '.dw-fieldLabel span';
    const DUPLICATED_BUTTON_CLASS = 'dw-store-btn-under-zuweisen';

    let observer = null;

    // CSS für Button unter dem Input
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
            }

            .dw-store-btn-under-zuweisen:hover {
                background:  #2b4979ff !important;
          
            }

        `;
        document.head.appendChild(style);
    }

    // "zuweisen an"-Feld finden
    function findZuweisenField() {
        const labels = document.querySelectorAll(ZUWEISEN_LABEL_SELECTOR);

        for (let label of labels) {
            const labelText = label.textContent.trim().toLowerCase();
            if (labelText.includes('zuweisen')) {
                // Zugehörige Zeile finden
                const row = label.closest('tr');
                if (row) {
                    // Input-Feld in der nächsten td finden
                    const inputCell = row.querySelector('td.table-fields-content');
                    if (inputCell) {
                        const container = inputCell.querySelector('.right-inner-addons');

                        if (container) {
                            return { container, inputCell, row };
                        }
                    }
                }
            }
        }

        return null;
    }

    // Button einfügen
    function addButtonUnderZuweisenField() {
        const fieldInfo = findZuweisenField();

        if (!fieldInfo) {
            console.warn('Zuweisen-Feld nicht gefunden');
            return false;
        }

        const { container, inputCell } = fieldInfo;

        // Prüfen ob bereits ein Button vorhanden ist
        if (inputCell.querySelector(`.${DUPLICATED_BUTTON_CLASS}`)) {
            console.log('Ablegen-Button bereits unter Zuweisen-Feld vorhanden');
            return true;
        }

        const storeButton = document.querySelector(STORE_BUTTON_SELECTOR);
        if (!storeButton) {
            console.warn('Original Store-Button nicht gefunden');
            return false;
        }

        // Button erstellen
        const button = document.createElement('button');
        button.type = 'button';
        button.className = DUPLICATED_BUTTON_CLASS;
        button.textContent = 'Ablegen';
        button.setAttribute('title', 'Dokument ablegen (Speichern)');

        // Click-Event
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('Ablegen-Button unter Zuweisen-Feld geklickt');

            // Original-Button triggern
            const originalButton = document.querySelector(STORE_BUTTON_SELECTOR);
            if (originalButton) {
                originalButton.click();
            } else {
                console.warn('Original Store-Button nicht gefunden');
            }
        });

        // Button direkt nach dem Container einfügen
        container.parentNode.insertBefore(button, container.nextSibling);

        console.log('Ablegen-Button erfolgreich unter Zuweisen-Feld eingefügt');
        return true;
    }

    // DOM überwachen
    function observeDOM() {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
            const fieldInfo = findZuweisenField();

            if (fieldInfo) {
                const hasButton = fieldInfo.inputCell.querySelector(`.${DUPLICATED_BUTTON_CLASS}`);
                if (!hasButton) {
                    console.log('Button unter Zuweisen-Feld fehlt - wird eingefügt');
                    addButtonUnderZuweisenField();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Zuweisen-Field-Observer aktiviert');
    }

    // Initialisierung
    function init() {
        console.log('Initialisiere Store-Button unter Zuweisen-Feld');

        // CSS injizieren
        injectStyles();

        // Button einfügen
        const success = addButtonUnderZuweisenField();

        if (success) {
            // Observer starten
            observeDOM();
        } else {
            // Erneut versuchen nach kurzer Wartezeit
            setTimeout(() => {
                if (addButtonUnderZuweisenField()) {
                    observeDOM();
                }
            }, 1000);
        }

        // Backup: Regelmäßig prüfen
        setInterval(() => {
            const fieldInfo = findZuweisenField();
            if (fieldInfo) {
                const hasButton = fieldInfo.inputCell.querySelector(`.${DUPLICATED_BUTTON_CLASS}`);
                if (!hasButton) {
                    addButtonUnderZuweisenField();
                }
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

