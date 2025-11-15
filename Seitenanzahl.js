// pageNavigation.js - ROBUST MIT WARTESCHLEIFE
(function() {
    'use strict';

    const ID = 'dw-page-navigation', V = '2.1', D = true;
    
    const SEL = {
        input: '.top-bar-nav-info input[data-trackerevent="NavToPage"]',
        pageCount: '.top-bar-nav-info span[data-bind*="maxPageValue"]',
        viewer: '#viewerArea',
        container: 'page-navigation-sidebar'
    };
    
    let S = {
        init: false,
        obs: null,
        expanded: false,
        container: null,
        lastPageCount: 0,
        initAttempts: 0
    };

    if (window[ID]) cleanup();
    window[ID] = { v: V, s: S, cleanup };

    const log = (m, d) => D && console.log(`[DW-PAGENAV] ${m}`, d || '');

    function cleanup() {
        if (window[ID]?.s) {
            window[ID].s.obs?.disconnect();
            window[ID].s.container?.remove();
        }
    }

    function injectStyles() {
        if (document.getElementById('page-navigation-styles')) return;

        const style = document.createElement('style');
        style.id = 'page-navigation-styles';
        style.textContent = `
            .${SEL.container} {
                position: absolute;
                top: 90vh;
                right: 1px;
                z-index: 1000;
                transition: all 0.3s ease;
            }

            .${SEL.container}:not(.expanded) {
                width: 22px;
                height: 22px;
            }

            .${SEL.container}.expanded {
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

            .${SEL.container}.expanded .page-nav-tab {
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

            .${SEL.container}.expanded .page-nav-content {
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

    // ÄNDERUNG: Prüft ob Seitenzahl wirklich geladen ist
    function getValidPageCount() {
        const pageCountEl = document.querySelector(SEL.pageCount);
        if (!pageCountEl) return null;

        const text = pageCountEl.textContent.trim();
        
        // ÄNDERUNG: Ignoriere Platzhalter und ungültige Werte
        if (!text || text === '0' || text === '...' || text === '-' || text === '') {
            return null;
        }

        const count = parseInt(text);
        
        // ÄNDERUNG: Nur gültige Zahlen > 0 akzeptieren
        if (isNaN(count) || count <= 0) return null;
        
        return count;
    }

    function checkPageCount() {
        const count = getValidPageCount();
        if (!count) return;

        if (count !== S.lastPageCount) {
            log(`Seitenzahl aktualisiert: ${S.lastPageCount} → ${count}`);
            S.lastPageCount = count;
            updateNav();
        }
    }

    function updateNav() {
        const inputEl = document.querySelector(SEL.input);
        if (!inputEl || !S.lastPageCount) return;
        
        createSidebar(S.lastPageCount, inputEl);
    }

    function createSidebar(pageCount, inputEl) {
        const viewerEl = document.querySelector(SEL.viewer);
        if (!viewerEl) return;

        if (S.container) {
            const wasExpanded = S.container.classList.contains('expanded');
            S.container.remove();
            S.expanded = wasExpanded;
        }

        const container = document.createElement('div');
        container.className = SEL.container;
        if (S.expanded) container.classList.add('expanded');

        const tab = document.createElement('button');
        tab.className = 'page-nav-tab';
        tab.type = 'button';
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
            const btn = createPageButton(i, inputEl);
            grid.appendChild(btn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.className = 'page-nav-close-btn';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Navigation schließen');
        closeBtn.addEventListener('click', () => toggleSidebar(container));
        grid.appendChild(closeBtn);

        content.appendChild(grid);
        container.appendChild(tab);
        container.appendChild(content);

        viewerEl.appendChild(container);
        S.container = container;
        
        log(`✅ Sidebar mit ${pageCount} Seiten erstellt`);
    }

    function toggleSidebar(container) {
        S.expanded = !S.expanded;
        S.expanded ? container.classList.add('expanded') : container.classList.remove('expanded');
    }

    function createPageButton(pageNum, inputEl) {
        const btn = document.createElement('button');
        btn.textContent = pageNum;
        btn.className = 'page-nav-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', `Zu Seite ${pageNum} navigieren`);
        btn.addEventListener('click', () => navigateToPage(pageNum, inputEl));
        return btn;
    }

    function navigateToPage(pageNum, inputEl) {
        inputEl.value = pageNum;
        
        ['input', 'change'].forEach(t => {
            inputEl.dispatchEvent(new Event(t, { bubbles: true, cancelable: true }));
        });
        
        inputEl.focus();
        
        setTimeout(() => {
            ['keydown', 'keyup'].forEach((t, i) => {
                setTimeout(() => {
                    inputEl.dispatchEvent(new KeyboardEvent(t, {
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

    function mkObs() {
        let timeout;
        const obs = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(checkPageCount, 400);
        });
        
        const targetEl = document.querySelector('.top-bar-nav-info') || document.body;
        obs.observe(targetEl, { 
            childList: true, 
            subtree: true,
            characterData: true 
        });
        
        return obs;
    }

    // ÄNDERUNG: Aggressive Warteschleife mit Retry-Logik
    function waitForValidPageCount(callback, attempt = 0) {
        const maxAttempts = 40; // 40 × 500ms = 20 Sekunden
        
        if (attempt >= maxAttempts) {
            log('⚠️ Timeout: Konnte keine gültige Seitenzahl finden');
            return;
        }

        const pageCountEl = document.querySelector(SEL.pageCount);
        const inputEl = document.querySelector(SEL.input);
        const viewerEl = document.querySelector(SEL.viewer);

        if (!pageCountEl || !inputEl || !viewerEl) {
            log(`Versuch ${attempt + 1}/${maxAttempts}: Warte auf DOM-Elemente...`);
            setTimeout(() => waitForValidPageCount(callback, attempt + 1), 500);
            return;
        }

        const pageCount = getValidPageCount();
        
        if (!pageCount) {
            log(`Versuch ${attempt + 1}/${maxAttempts}: Warte auf Seitenzahl... (aktuell: "${pageCountEl.textContent.trim()}")`);
            setTimeout(() => waitForValidPageCount(callback, attempt + 1), 500);
            return;
        }

        // ERFOLG: Gültige Seitenzahl gefunden
        log(`✅ Gültige Seitenzahl gefunden: ${pageCount} (nach ${attempt + 1} Versuchen)`);
        S.lastPageCount = pageCount;
        callback();
    }

    function init() {
        injectStyles();
        
        // ÄNDERUNG: Warte aktiv auf gültige Seitenzahl
        waitForValidPageCount(() => {
            const inputEl = document.querySelector(SEL.input);
            if (inputEl && S.lastPageCount > 0) {
                createSidebar(S.lastPageCount, inputEl);
                
                // Observer erst nach erfolgreicher Initialisierung
                setTimeout(() => {
                    S.obs = mkObs();
                    S.init = true;
                    log(`✅ Vollständig initialisiert mit ${S.lastPageCount} Seiten`);
                }, 500);
            }
        });
    }

    window[ID].api = {
        refresh: () => {
            checkPageCount();
            return { pageCount: S.lastPageCount };
        },
        status: () => ({
            init: S.init,
            pageCount: S.lastPageCount,
            expanded: S.expanded,
            attempts: S.initAttempts
        }),
        forceUpdate: () => {
            const count = getValidPageCount();
            if (count && count > 0) {
                S.lastPageCount = count;
                updateNav();
                log(`🔄 Force Update: ${count} Seiten`);
            } else {
                log('⚠️ Force Update fehlgeschlagen: Keine gültige Seitenzahl');
            }
        }
    };

    function main() {
        document.readyState === 'loading' ?
            document.addEventListener('DOMContentLoaded', init, { once: true }) :
            setTimeout(init, 800); // ÄNDERUNG: 800ms initiale Verzögerung
    }

    main();
})();

