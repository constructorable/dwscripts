// pageNavigation.js - HARMONISIERT MIT ANDEREN SCRIPTS
(function() {
    'use strict';

    const ID = 'dw-page-navigation';
    const INPUT_SELECTOR = '.top-bar-nav-info input[data-trackerevent="NavToPage"]';
    const PAGE_COUNT_SELECTOR = '.top-bar-nav-info span[data-bind*="maxPageValue"]';
    const VIEWER_SELECTOR = '#viewerArea';
    const CONTAINER_CLASS = 'page-navigation-sidebar';
    
    let S = {
        init: false,
        expanded: false,
        container: null,
        lastPageCount: 0,
        observers: [],
        checkInterval: null,
        xhrPatched: false
    };

    if (window[ID]) cleanup();
    window[ID] = { s: S, cleanup };

    function cleanup() {
        if (window[ID]?.s) {
            window[ID].s.observers?.forEach(obs => obs.disconnect());
            window[ID].s.checkInterval && clearInterval(window[ID].s.checkInterval);
            window[ID].s.container?.remove();
        }
    }

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

    // ÄNDERUNG: XHR-Interception nur einmal + mit Flag
    function interceptXHR() {
        if (S.xhrPatched) return;
        
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url) {
            this._dwPageNavUrl = url;
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function() {
            this.addEventListener('load', function() {
                if (this._dwPageNavUrl && (
                    this._dwPageNavUrl.includes('/GetDocument') || 
                    this._dwPageNavUrl.includes('/Documents/') ||
                    this._dwPageNavUrl.includes('/Image')
                )) {
                    setTimeout(() => checkAndUpdatePageCount(), 500);
                }
            });
            return originalSend.apply(this, arguments);
        };
        
        S.xhrPatched = true;
    }

    // ÄNDERUNG: Polling nur alle 2 Sekunden (statt 1 Sekunde)
    function startPolling() {
        if (S.checkInterval) clearInterval(S.checkInterval);
        S.checkInterval = setInterval(() => checkAndUpdatePageCount(), 2000);
    }

    function checkAndUpdatePageCount() {
        const pageCountElement = document.querySelector(PAGE_COUNT_SELECTOR);
        if (!pageCountElement) return;

        const currentPageCount = parseInt(pageCountElement.textContent.trim());
        if (isNaN(currentPageCount) || currentPageCount <= 0) return;

        if (currentPageCount !== S.lastPageCount) {
            console.log('[DW-PAGENAV] Seitenzahl aktualisiert:', S.lastPageCount, '→', currentPageCount);
            S.lastPageCount = currentPageCount;
            updateNavigation();
        }
    }

    // ÄNDERUNG: Throttled Observer (500ms Verzögerung)
    function observePageCountChanges() {
        S.observers.forEach(obs => obs.disconnect());
        S.observers = [];

        const pageCountElement = document.querySelector(PAGE_COUNT_SELECTOR);
        if (!pageCountElement) {
            setTimeout(observePageCountChanges, 1000);
            return;
        }

        let timeout;
        const throttledCheck = () => {
            clearTimeout(timeout);
            timeout = setTimeout(checkAndUpdatePageCount, 500);
        };

        const observer = new MutationObserver(throttledCheck);
        observer.observe(pageCountElement, {
            childList: true,
            characterData: true,
            subtree: true
        });
        S.observers.push(observer);

        const parentContainer = pageCountElement.closest('.top-bar-nav-info');
        if (parentContainer) {
            const containerObserver = new MutationObserver(throttledCheck);
            containerObserver.observe(parentContainer, {
                childList: true,
                subtree: true,
                characterData: true
            });
            S.observers.push(containerObserver);
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

        S.lastPageCount = pageCount;
        createSidebar(pageCount, inputElement);
        
        observePageCountChanges();
        interceptXHR();
        startPolling();
        S.init = true;
    }

    function createSidebar(pageCount, inputElement) {
        const viewerElement = document.querySelector(VIEWER_SELECTOR);
        if (!viewerElement) return;

        if (S.container) {
            const wasExpanded = S.container.classList.contains('expanded');
            S.container.remove();
            S.expanded = wasExpanded;
        }

        const container = document.createElement('div');
        container.className = CONTAINER_CLASS;
        if (S.expanded) container.classList.add('expanded');

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
        S.container = container;
    }

    function toggleSidebar(container) {
        S.expanded = !S.expanded;
        S.expanded ? container.classList.add('expanded') : container.classList.remove('expanded');
    }

    function createPageButton(pageNumber, inputElement) {
        const button = document.createElement('button');
        button.textContent = pageNumber;
        button.className = 'page-nav-btn';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Zu Seite ${pageNumber} navigieren`);
        button.addEventListener('click', () => navigateToPage(pageNumber, inputElement));
        return button;
    }

    function navigateToPage(pageNumber, inputElement) {
        inputElement.value = pageNumber;
        
        ['input', 'change'].forEach(t => {
            inputElement.dispatchEvent(new Event(t, { bubbles: true, cancelable: true }));
        });
        
        inputElement.focus();
        
        setTimeout(() => {
            ['keydown', 'keyup'].forEach((t, i) => {
                setTimeout(() => {
                    inputElement.dispatchEvent(new KeyboardEvent(t, {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    }));
                }, i * 50);
            });
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
