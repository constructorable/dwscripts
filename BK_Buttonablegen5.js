// duplicateSaveButton.js
(function () {
    'use strict';

    const SAVE_BUTTON_SELECTOR = 'li[data-trackerevent="Save"]';
    const TARGET_BUTTON_SELECTOR = 'li[data-trackerevent="Annotations_TransparentRectangle"]';
    const DUPLICATED_BUTTON_CLASS = 'dw-duplicated-save-button';

    let observer = null;

    // ÄNDERUNG: Click-Event manuell hinzufügen
    function duplicateSaveButton() {
        // Prüfen ob bereits dupliziert
        if (document.querySelector(`.${DUPLICATED_BUTTON_CLASS}`)) {
            console.log('Save-Button bereits dupliziert');
            return;
        }

        const saveButton = document.querySelector(SAVE_BUTTON_SELECTOR);
        const targetButton = document.querySelector(TARGET_BUTTON_SELECTOR);

        if (!saveButton || !targetButton) {
            console.warn('Save-Button oder Ziel-Button nicht gefunden');
            return;
        }

        // Button klonen
        const clonedButton = saveButton.cloneNode(true);

        // Markierung hinzufügen
        clonedButton.classList.add(DUPLICATED_BUTTON_CLASS);

        // Eindeutige ID für Tracking
        clonedButton.setAttribute('data-trackerevent', 'Save_Duplicated');

        // NEU: Click-Event hinzufügen, der den Original-Button triggert
        clonedButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('Duplizierter Save-Button geklickt - triggere Original');

            // Original-Button klicken
            const originalSaveButton = document.querySelector(SAVE_BUTTON_SELECTOR);
            if (originalSaveButton) {
                originalSaveButton.click();
            } else {
                console.warn('Original Save-Button nicht gefunden');
            }
        });

        // Nach dem Ziel-Button einfügen
        targetButton.parentNode.insertBefore(clonedButton, targetButton);

        console.log('Save-Button erfolgreich dupliziert mit Event-Listener');
    }

    // Toolbar-Container überwachen
    function observeToolbar() {
        if (observer) {
            observer.disconnect();
        }

        // Toolbar-Container finden
        const toolbarContainer = document.querySelector('.dw-toolbar-li')?.closest('ul, ol');

        if (!toolbarContainer) {
            console.warn('Toolbar-Container nicht gefunden');
            setTimeout(observeToolbar, 1000);
            return;
        }

        observer = new MutationObserver((mutations) => {
            // Prüfen ob duplizierter Button noch existiert
            const duplicatedExists = document.querySelector(`.${DUPLICATED_BUTTON_CLASS}`);
            const targetExists = document.querySelector(TARGET_BUTTON_SELECTOR);

            if (targetExists && !duplicatedExists) {
                console.log('Duplizierter Button fehlt - wird neu eingefügt');
                duplicateSaveButton();
            }
        });

        observer.observe(toolbarContainer, {
            childList: true,
            subtree: true
        });

        console.log('Toolbar-Observer aktiviert');
    }

    // Initialisierung
    function init() {
        console.log('Initialisiere Save-Button Duplikation');

        // Ersten Button duplizieren
        duplicateSaveButton();

        // Observer für Änderungen starten
        observeToolbar();

        // Zusätzlich: Bei jedem Dokumentwechsel prüfen
        setInterval(() => {
            const duplicatedExists = document.querySelector(`.${DUPLICATED_BUTTON_CLASS}`);
            const targetExists = document.querySelector(TARGET_BUTTON_SELECTOR);

            if (targetExists && !duplicatedExists) {
                duplicateSaveButton();
            }
        }, 2000);
    }

    // Warten bis DOM vollständig geladen ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 500);
        });
    } else {
        setTimeout(init, 500);
    }

})();

