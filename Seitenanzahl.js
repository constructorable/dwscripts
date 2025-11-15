// pageNavigation.js - FUNKTIONIERT MIT BEWÄHRTEN MECHANISMEN
(function() {
    'use strict';

    const INPUT_SELECTOR = '.top-bar-nav-info input[data-trackerevent="NavToPage"]';
    const PAGE_COUNT_SELECTOR = '.top-bar-nav-info span[data-bind*="maxPageValue"]';
    const VIEWER_SELECTOR = '#viewerArea';
    const CONTAINER_CLASS = 'page-navigation-sidebar';
    
    let isExpanded = false;
    let currentContainer = null;
    let lastPageCount = 0;
    let observers = [];
    let checkInterval = null;

    function injectStyles() {
        if (document.getElementById('page-navigation-styles')) return;

        const style = document.createElement('style');
        style.id = 'page-navigation-styles';
        style.textContent = `
            .page-navigation-sidebar {
                position: absolute;
                top: 90vh;
                right: 1px;
                z-index: 1000;
                transition: all 0.3s ease;
            }

            .page-navigation-sidebar:not(.expanded) {
                width: 22px;
                height: 22px;
            }

            .page-navigation-sidebar.expanded {
                right: 0;
                width: auto;
                max-width: 95%;
                max-height: calc(100% - 16px);
                background: rgba(30, 30, 30, 0);
                backdrop-filter: blur(12px);
                border-radius: 6px 0 0 6px;
                box-shadow: -2px 0 8px rgba(0, 0, 0, 0);
                display: flex;
                flex-direction: column;
            }

            .page-nav-tab {
                width: 15px;
                height: 15px;
                background: rgba(50, 50, 50, 0.75);
                backdrop-filter: blur(6px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 5px;
                color: rgba(255, 255, 255, 0.9);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                font-weight: bold;
                transition: all 0.2s ease;
                flex-shrink: 0;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
            }

            .page-navigation-sidebar.expanded .page-nav-tab {
                display: none;
            }

            .page-nav-tab:hover {
                background: rgba(70, 70, 70, 0.85);
            }

            .page-nav-tab::before {
                content: '☰';
                transform: rotate(90deg);
                display: block;
            }

            .page-nav-content {
                display: none;
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 1px;
            }

            .page-navigation-sidebar.expanded .page-nav-content {
                display: flex;
                justify-content: flex-end;
            }

            .page-nav-grid {
                display: grid;
                gap: 2px;
                width: auto;
            }

            .page-nav-btn {
                width: 17px;
                height: 20px;
                padding: 0;
                background: rgba(255, 255, 255, 0.75);
                backdrop-filter: blur(2px);
                border: 1px solid rgba(192, 192, 192, 0.4);
                border-radius: 2px;
                font-size: 9px;
                font-weight: 500;
                color: #222222;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .page-nav-btn:hover {
                background: rgba(0, 120, 212, 0.9);
                color: #ffffff;
                border-color: rgba(0, 120, 212, 0.6);
                transform: scale(1.15);
                box-shadow: 0 1px 4px rgba(0, 120, 212, 0.4);
                z-index: 1;
            }

            .page-nav-btn:active {
                transform: scale(1.0);
                background: rgba(0, 90, 158, 0.9);
            }

            .page-nav-close-btn {
                width: 17px;
                height: 20px;
                padding: 0;
                background: rgba(220, 53, 69, 0.8);
                backdrop-filter: blur(2px);
                border: 1px solid rgba(200, 35, 51, 0.5);
                border-radius: 2px;
                font-size: 14px;
                font-weight: bold;
                color: #ffffff;
                cursor: pointer;
                transition: all 0.15s ease;
                line-height: 1;
            }

            .page-nav-close-btn:hover {
                background: rgba(220, 53, 69, 0.95);
                border-color: rgba(200, 35, 51, 0.8);
                transform: scale(1.15);
                box-shadow: 0 1px 4px rgba(220, 53, 69, 0.4);
            }

            .page-nav-content::-webkit-scrollbar {
                width: 4px;
            }

            .page-nav-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 2px;
            }

            .page-nav-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
            }

            .page-nav-content::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.35);
            }
        `;
        document.head.appendChild(style);
    }

    // AUS ALTEM CODE: XHR-Interception
    function interceptXHR() {
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function() {
            this.addEventListener('load', function() {
                if (this._url && (
                    this._url.includes('/GetDocument') || 
                    this._url.includes('/Documents/') ||
                    this._url.includes('/Image')
                )) {
                    setTimeout(() => checkAndUpdatePageCount(), 500);
                }
            });
            return originalSend.apply(this, arguments);
        };
    }

    // AUS ALTEM CODE: Polling
    function startPolling() {
        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(() => checkAndUpdatePageCount(), 1000);
    }

    // AUS ALTEM CODE: Prüfung und Update
    function checkAndUpdatePageCount() {
        const pageCountElement = document.querySelector(PAGE_COUNT_SELECTOR);
        if (!pageCountElement) return;

        const currentPageCount = parseInt(pageCountElement.textContent.trim());
        if (isNaN(currentPageCount) || currentPageCount <= 0) return;

        if (currentPageCount !== lastPageCount) {
            console.log('Seitenzahl aktualisiert:', lastPageCount, '→', currentPageCount);
            lastPageCount = currentPageCount;
            updateNavigation();
        }
    }

    // AUS ALTEM CODE: MutationObserver
    function observePageCountChanges() {
        observers.forEach(obs => obs.disconnect());
        observers = [];

        const pageCountElement = document.querySelector(PAGE_COUNT_SELECTOR);
        if (!pageCountElement) {
            setTimeout(observePageCountChanges, 1000);
            return;
        }

        const observer = new MutationObserver(() => checkAndUpdatePageCount());
        observer.observe(pageCountElement, {
            childList: true,
            characterData: true,
            subtree: true
        });
        observers.push(observer);

        const parentContainer = pageCountElement.closest('.top-bar-nav-info');
        if (parentContainer) {
            const containerObserver = new MutationObserver(() => checkAndUpdatePageCount());
            containerObserver.observe(parentContainer, {
                childList: true,
                subtree: true,
                characterData: true
            });
            observers.push(containerObserver);
        }
    }

    function updateNavigation() {
        const pageCountElement = document.querySelector(PAGE_COUNT_SELECTOR);
        const inputElement = document.querySelector(INPUT_SELECTOR);
        
        if (!pageCountElement || !inputElement) return;

        const pageCount = parseInt(pageCountElement.textContent.trim());
        if (isNaN(pageCount) || pageCount <= 0) return;

        createSidebar(pageCount, inputElement);
    }

    // AUS ALTEM CODE: Initialisierung
    function init() {
        injectStyles();
        
        const pageCountElement = document.querySelector(PAGE_COUNT_SELECTOR);
        const inputElement = document.querySelector(INPUT_SELECTOR);
        const viewerElement = document.querySelector(VIEWER_SELECTOR);
        
        if (!pageCountElement || !inputElement || !viewerElement) {
            setTimeout(init, 500);
            return;
        }

        const pageCount = parseInt(pageCountElement.textContent.trim());
        if (isNaN(pageCount) || pageCount <= 0) {
            setTimeout(init, 500);
            return;
        }

        lastPageCount = pageCount;
        createSidebar(pageCount, inputElement);
        
        if (!window.pageNavObserverInitialized) {
            observePageCountChanges();
            interceptXHR();
            startPolling();
            window.pageNavObserverInitialized = true;
        }
    }

    function createSidebar(pageCount, inputElement) {
        const viewerElement = document.querySelector(VIEWER_SELECTOR);
        if (!viewerElement) return;

        if (currentContainer) {
            const wasExpanded = currentContainer.classList.contains('expanded');
            currentContainer.remove();
            isExpanded = wasExpanded;
        }

        const container = document.createElement('div');
        container.className = CONTAINER_CLASS;
        if (isExpanded) container.classList.add('expanded');

        const tab = document.createElement('button');
        tab.className = 'page-nav-tab';
        tab.setAttribute('type', 'button');
        tab.setAttribute('aria-label', 'Seitennavigation ein/ausblenden');
        tab.addEventListener('click', () => toggleSidebar(container));

        const content = document.createElement('div');
        content.className = 'page-nav-content';

        const grid = document.createElement('div');
        grid.className = 'page-nav-grid';
        
        const maxPerRow = 20;
        const totalButtons = pageCount + 1;
        const columnsNeeded = Math.min(totalButtons, maxPerRow);
        grid.style.gridTemplateColumns = `repeat(${columnsNeeded}, 17px)`;

        for (let i = 1; i <= pageCount; i++) {
            const button = createPageButton(i, inputElement);
            grid.appendChild(button);
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.className = 'page-nav-close-btn';
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('aria-label', 'Navigation schließen');
        closeBtn.addEventListener('click', () => toggleSidebar(container));
        grid.appendChild(closeBtn);

        content.appendChild(grid);
        container.appendChild(tab);
        container.appendChild(content);

        viewerElement.appendChild(container);
        currentContainer = container;
    }

    function toggleSidebar(container) {
        isExpanded = !isExpanded;
        if (isExpanded) {
            container.classList.add('expanded');
        } else {
            container.classList.remove('expanded');
        }
    }

    function createPageButton(pageNumber, inputElement) {
        const button = document.createElement('button');
        button.textContent = pageNumber;
        button.className = 'page-nav-btn';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Zu Seite ${pageNumber} navigieren`);
        
        button.addEventListener('click', () => {
            navigateToPage(pageNumber, inputElement);
        });
        
        return button;
    }

    function navigateToPage(pageNumber, inputElement) {
        inputElement.value = pageNumber;
        
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        inputElement.dispatchEvent(inputEvent);
        
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        inputElement.dispatchEvent(changeEvent);
        
        inputElement.focus();
        
        setTimeout(() => {
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });
            inputElement.dispatchEvent(enterEvent);
            
            setTimeout(() => {
                const keyupEvent = new KeyboardEvent('keyup', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                inputElement.dispatchEvent(keyupEvent);
            }, 50);
        }, 100);
    }

    // Auto-Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

