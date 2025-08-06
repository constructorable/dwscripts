(function() {
    'use strict';

    const CONFIG = {

        originalButtonSelector: 'button[data-bind*="commands.commit"]',

        targetSelector: 'td.dw-fieldLabel span:contains("an Mieter weiterverrechnen")',

        fallbackTargetSelector: 'span[data-bind*="displayName()"]',

        duplicatedButtonId: 'duplicated-commit-button',

        retryInterval: 500,

        maxRetries: 20
    };

    const buttonStyles = `
        <style id="duplicated-button-styles">
            .duplicated-commit-container {
                margin-top: 0px;
                padding: 0;
                border-top: 1px solid #ddd;
            }

            .duplicated-commit-button {
                background: #5984c9 !important;
                border: 1px solid #5984c9 !important;
                color: white !important;
                padding: 8px 16px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-size: 14px !important;
                transition: background-color 0.3s !important;
            }

            .duplicated-commit-button:hover {
                background: #486faeff !important;
            }

            .duplicated-commit-button:disabled {
                background: #cccccc !important;
                border-color: #cccccc !important;
                cursor: not-allowed !important;
            }

.duplicated-commit-container {
    display: flex;
    justify-content: flex-end;
}

#duplicated-commit-button {
    transform: translateX(160px); 
    margin-bottom: 7px;
}
        </style>
    `;

    function findElement(selector) {
        if (selector.includes(':contains')) {
            const text = selector.match(/:contains\("([^"]+)"\)/)[1];
            const baseSelector = selector.replace(/:contains\("[^"]+"\)/, '');
            const elements = document.querySelectorAll(baseSelector);

            for (let element of elements) {
                if (element.textContent.includes(text)) {
                    return element;
                }
            }
            return null;
        }
        return document.querySelector(selector);
    }

    function isDuplicatedButtonExists() {
        return document.getElementById(CONFIG.duplicatedButtonId) !== null;
    }

    function createDuplicatedButton(originalButton) {
        const container = document.createElement('div');
        container.className = 'duplicated-commit-container';

        const button = document.createElement('button');
        button.id = CONFIG.duplicatedButtonId;
        button.type = 'button';
        button.className = 'duplicated-commit-button ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only';
        button.innerHTML = '<span class="ui-button-text">Bestätigen</span>';

        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (originalButton && typeof originalButton.click === 'function') {
                originalButton.click();
            } else {

                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                originalButton.dispatchEvent(clickEvent);
            }
        });

        function syncButtonState() {
            if (originalButton) {
                button.disabled = originalButton.disabled;
                button.style.display = originalButton.style.display === 'none' ? 'none' : 'inline-block';
            }
        }

        syncButtonState();

        if (originalButton && window.MutationObserver) {
            const observer = new MutationObserver(syncButtonState);
            observer.observe(originalButton, {
                attributes: true,
                attributeFilter: ['disabled', 'style', 'class']
            });

            button._observer = observer;
        }

        container.appendChild(button);
        return container;
    }

    function insertDuplicatedButton() {
        const originalButton = document.querySelector(CONFIG.originalButtonSelector);
        if (!originalButton) {
            console.log('Original-Button nicht gefunden, versuche es erneut...');
            return false;
        }

        let targetElement = findElement(CONFIG.targetSelector);
        if (!targetElement) {

            const fallbackElements = document.querySelectorAll(CONFIG.fallbackTargetSelector);
            for (let element of fallbackElements) {
                if (element.textContent.includes('an Mieter weiterverrechnen')) {
                    targetElement = element;
                    break;
                }
            }
        }

        if (!targetElement) {
            console.log('Ziel-Element nicht gefunden, versuche es erneut...');
            return false;
        }

        let targetTR = targetElement.closest('tr');
        if (!targetTR) {
            console.log('Übergeordnete TR nicht gefunden, versuche es erneut...');
            return false;
        }

        const duplicatedButtonContainer = createDuplicatedButton(originalButton);

        targetTR.parentNode.insertBefore(duplicatedButtonContainer, targetTR.nextSibling);

        console.log('Duplizierter Button erfolgreich hinzugefügt');
        return true;
    }

    function initializeDuplicatedButton() {

        if (isDuplicatedButtonExists()) {
            console.log('Duplizierter Button bereits vorhanden');
            return;
        }

        let attempts = 0;

        function tryInsert() {
            attempts++;

            if (insertDuplicatedButton()) {
                console.log(`Duplizierter Button nach ${attempts} Versuchen erfolgreich hinzugefügt`);
                return;
            }

            if (attempts < CONFIG.maxRetries) {
                setTimeout(tryInsert, CONFIG.retryInterval);
            } else {
                console.error('Maximale Anzahl Versuche erreicht. Duplizierter Button konnte nicht hinzugefügt werden.');
            }
        }

        tryInsert();
    }

    function cleanup() {
        const existingButton = document.getElementById(CONFIG.duplicatedButtonId);
        if (existingButton) {

            if (existingButton._observer) {
                existingButton._observer.disconnect();
            }

            const container = existingButton.closest('.duplicated-commit-container');
            if (container) {
                container.remove();
            }
        }

        const existingStyles = document.getElementById('duplicated-button-styles');
        if (existingStyles) {
            existingStyles.remove();
        }
    }

    function addStyles() {
        if (!document.getElementById('duplicated-button-styles')) {
            document.head.insertAdjacentHTML('beforeend', buttonStyles);
        }
    }

    function setupEventListeners() {

        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let shouldReinit = false;

                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { 

                                if (node.querySelector && 
                                   (node.querySelector(CONFIG.originalButtonSelector) || 
                                    node.textContent.includes('an Mieter weiterverrechnen'))) {
                                    shouldReinit = true;
                                }
                            }
                        });

                        mutation.removedNodes.forEach(function(node) {
                            if (node.nodeType === 1 && node.id === CONFIG.duplicatedButtonId) {
                                shouldReinit = true;
                            }
                        });
                    }
                });

                if (shouldReinit && !isDuplicatedButtonExists()) {
                    setTimeout(initializeDuplicatedButton, 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        window.addEventListener('hashchange', function() {
            setTimeout(function() {
                cleanup();
                addStyles();
                initializeDuplicatedButton();
            }, 500);
        });

        window.addEventListener('popstate', function() {
            setTimeout(function() {
                cleanup();
                addStyles();
                initializeDuplicatedButton();
            }, 500);
        });
    }

    function init() {
        console.log('Initialisiere duplizierten Bestätigen-Button...');

        addStyles();

        setupEventListeners();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeDuplicatedButton);
        } else {
            initializeDuplicatedButton();
        }

        setTimeout(initializeDuplicatedButton, 1000);
    }

    window.DuplicatedButtonManager = {
        reinit: function() {
            cleanup();
            addStyles();
            initializeDuplicatedButton();
        },
        cleanup: cleanup,
        isExists: isDuplicatedButtonExists
    };

    init();
})();