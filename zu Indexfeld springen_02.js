(function () {
    'use strict';

    // ===== KONFIGURATION =====
    const CONFIG = {
        scriptId: 'docuware-field-search',
        shortcut: { ctrl: true, shift: true, key: 'D' },
        timing: { scroll: 600, highlight: 555, close: 333, tabWait: 111 },
        searchableFields: {
            'dokumententyp': { terms: ['dokumententyp', 'unterart', 'document type'], label: 'Dokumententyp (Unterart)' },
            'objekt': { terms: ['objekt', 'object', 'haus', 'gebäude'], label: 'Objekt' }
        }
    };

    // ===== RESET & INIT =====
    if (window[CONFIG.scriptId]) {
        console.log('🔄 Reset...');
        document.querySelectorAll('.dw-fs-overlay, .dw-fs-widget').forEach(el => el.remove());
        window[CONFIG.scriptId].cleanup?.();
        delete window[CONFIG.scriptId];
    }

    const state = {
        listeners: [],
        results: [],
        currentIndex: 0,
        selectedSuggestion: -1
    };
    window[CONFIG.scriptId] = state;

    // ===== UTILITIES =====
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const addListener = (el, evt, fn) => {
        el.addEventListener(evt, fn);
        state.listeners.push({ el, evt, fn });
    };

    state.cleanup = () => state.listeners.forEach(({ el, evt, fn }) => el.removeEventListener(evt, fn));

    // ===== TAB MANAGEMENT =====
    const TabManager = {
        findActive: () => {
            const container = $('.ui-tabs-nav, .dw-tabStrip, [role="tablist"]');
            if (!container) return null;

            const tabs = $$('li[role="tab"], .ui-tabs-tab', container).map(tab => ({
                el: tab,
                anchor: $('a', tab),
                id: ($('a', tab)?.getAttribute('href') || '').replace('#', ''),
                name: ($('span', tab) || $('a', tab) || tab).textContent.trim(),
                active: tab.classList.contains('ui-state-active') || tab.classList.contains('ui-tabs-active')
            }));

            return tabs.find(t => t.active);
        },

        getContent: (tab) => {
            if (!tab?.id) return null;
            const content = $(`#${CSS.escape(tab.id)}`);
            if (!content) return null;

            const visible = !content.classList.contains('ui-hidden') &&
                getComputedStyle(content).display !== 'none';

            return visible ? content : null;
        },

        getVisibleContent: () => {
            return $$('.ui-tabs-panel, [role="tabpanel"]').find(p =>
                !p.classList.contains('ui-hidden') &&
                getComputedStyle(p).display !== 'none'
            );
        }
    };

    // ===== FIELD FINDER =====
    const FieldFinder = {
        findInput: (row) => {
            const selectors = 'input:not([type="hidden"]), textarea, select';
            const input = $(selectors, row) || $(selectors, row.nextElementSibling);
            if (!input) return null;

            const style = getComputedStyle(input);
            const accessible = style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                !input.disabled &&
                !input.readOnly;

            return accessible ? input : null;
        },

        search: (term) => {
            const tab = TabManager.findActive();
            if (!tab) return [];

            const area = TabManager.getContent(tab) || TabManager.getVisibleContent() || document;
            const normalized = term.toLowerCase().trim();
            const results = [];

            $$('tr', area).forEach(row => {
                const label = $('.dw-fieldLabel span, [class*="label"], td:first-child span', row);
                if (!label) return;

                const text = label.textContent.trim();
                const clean = text.toLowerCase().replace(/[^\w\säöüß-]/g, '');

                if (clean.includes(normalized) || text.toLowerCase().includes(normalized)) {
                    const input = FieldFinder.findInput(row);
                    if (input) {
                        results.push({ row, label, input, text, tab });
                    }
                }
            });

            // Konfigurierte Felder
            Object.entries(CONFIG.searchableFields).forEach(([key, config]) => {
                if (config.terms.some(t => t.includes(normalized) || normalized.includes(t))) {
                    $$('tr', area).forEach(row => {
                        const label = $('.dw-fieldLabel span', row);
                        if (!label) return;

                        const labelText = label.textContent.toLowerCase();
                        if (config.terms.some(t => labelText.includes(t.toLowerCase()))) {
                            const input = FieldFinder.findInput(row);
                            if (input && !results.find(r => r.row === row)) {
                                results.push({ row, label, input, text: label.textContent.trim(), tab, config: config.label });
                            }
                        }
                    });
                }
            });

            console.log(`🔍 "${term}" → ${results.length} Treffer`);
            return results;
        }
    };

    // ===== UI =====
    const UI = {
        createStyles: () => {
            const style = document.createElement('style');
            style.textContent = `
            .dw-fs-overlay { 
                position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 9999; 
                display: flex; align-items: center; justify-content: center; 
                animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(2px);
            }
            .dw-fs-widget { 
                background: white; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); 
                width: 500px; max-width: 90%; max-height: 80vh; display: flex; flex-direction: column;
                animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                transform-origin: center;
            }
            .dw-fs-header { 
                background: #4b7199; color: white; padding: 15px 20px; display: flex; 
                justify-content: space-between; align-items: center;
                transition: background 0.2s ease;
            }
            .dw-fs-title { font-weight: bold; font-size: 16px; }
            .dw-fs-close { 
                background: none; border: none; color: white; font-size: 24px; cursor: pointer; 
                width: 30px; height: 30px; padding: 0;
                transition: transform 0.2s ease, opacity 0.2s ease;
            }
            .dw-fs-close:hover { transform: rotate(90deg); opacity: 0.8; }
            .dw-fs-content { padding: 20px; overflow-y: auto; }
            .dw-fs-input-wrap { position: relative; margin-bottom: 15px; }
            .dw-fs-input { 
                width: 100%; padding: 10px 35px 10px 10px; border: 2px solid #ddd; 
                border-radius: 5px; font-size: 14px; box-sizing: border-box;
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }
            .dw-fs-input:focus { 
                outline: none; border-color: #4b7199;
                box-shadow: 0 0 0 3px rgba(75, 113, 153, 0.1);
            }
            .dw-fs-clear { 
                position: absolute; right: 10px; top: 50%; transform: translateY(-50%); 
                background: none; border: none; color: #999; font-size: 20px; cursor: pointer;
                opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease;
                pointer-events: none;
            }
            .dw-fs-clear.visible { opacity: 1; pointer-events: auto; }
            .dw-fs-clear:hover { transform: translateY(-50%) scale(1.2); color: #666; }
            .dw-fs-suggestions { 
                background: white; border: 1px solid #ddd; border-radius: 5px; 
                margin-bottom: 15px; max-height: 200px; overflow-y: auto;
                opacity: 0; max-height: 0; transition: opacity 0.3s ease, max-height 0.3s ease;
            }
            .dw-fs-suggestions.visible { opacity: 1; max-height: 200px; }
            .dw-fs-suggestion { 
                padding: 2px 21px 2px 5px; cursor: pointer; border-bottom: 1px solid #eee; 
                min-height: 10px; transition: background 0.15s ease, transform 0.15s ease;
            }
            .dw-fs-suggestion:last-child { border-bottom: none; }
            .dw-fs-suggestion:hover, .dw-fs-suggestion.active { 
                background: #f0f0f0; transform: translateX(3px);
            }
            .dw-fs-info { 
                font-size: 12px; color: #666; margin-bottom: 10px;
                animation: fadeInUp 0.4s ease 0.1s both;
            }
            .dw-fs-shortcut { 
                font-size: 11px; color: #999; margin-bottom: 15px;
                animation: fadeInUp 0.4s ease 0.2s both;
            }
            .dw-fs-results { 
                padding: 10px; border-radius: 5px; font-size: 12px;
                transition: all 0.3s ease;
                transform-origin: top;
            }
            .dw-fs-results.success { 
                background: #e8f5e9; color: #2e7d32;
                animation: expandIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .dw-fs-results.error { 
                background: #ffebee; color: #c62828;
                animation: shake 0.4s ease;
            }
            .dw-fs-results.loading { 
                background: #e3f2fd; color: #1976d2;
                animation: pulse 1.5s ease-in-out infinite;
            }
            .dw-fs-highlight { 
                background: #ffeb3b !important; 
                animation: highlightPulse 0.6s cubic-bezier(0.4, 0, 0.2, 1) 3;
                box-shadow: 0 0 20px rgba(255, 235, 59, 0.6);
            }
            .dw-fs-indicator { 
                position: fixed; top: 20px; right: 20px; background: rgba(75,113,153,0.95); 
                color: white; padding: 12px 20px; border-radius: 5px; z-index: 99999; font-size: 13px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                opacity: 0; transform: translateY(-20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
            }
            .dw-fs-indicator.visible { opacity: 1; transform: translateY(0); }
            
            /* ANIMATIONEN */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes expandIn {
                from { opacity: 0; transform: scaleY(0.8); }
                to { opacity: 1; transform: scaleY(1); }
            }
            @keyframes highlightPulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.02); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            /* SCROLLBAR */
            .dw-fs-suggestions::-webkit-scrollbar { width: 8px; }
            .dw-fs-suggestions::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .dw-fs-suggestions::-webkit-scrollbar-thumb { 
                background: #888; border-radius: 4px; 
                transition: background 0.2s ease;
            }
            .dw-fs-suggestions::-webkit-scrollbar-thumb:hover { background: #555; }
        `;
            document.head.appendChild(style);
        },


        createIndicator: () => {
            const ind = document.createElement('div');
            ind.className = 'dw-fs-indicator';
            document.body.appendChild(ind);
            return ind;
        },

        // ÄNDERUNG: Smooth Indicator mit Klasse
        showIndicator: (result) => {
            const ind = $('.dw-fs-indicator') || UI.createIndicator();
            ind.innerHTML = `<div style="font-weight:bold">${result.tab.name}</div><div>Feld: ${result.config || result.text}</div>`;
            ind.classList.add('visible');
            setTimeout(() => ind.classList.remove('visible'), 1000);
        },
        
        // ÄNDERUNG: Smooth Input-Focus mit längerer Transition
        scrollTo: (result, keepFocus = false) => {
            return new Promise(resolve => {
                $$('.dw-fs-highlight').forEach(el => el.classList.remove('dw-fs-highlight'));

                UI.showIndicator(result);
                result.row.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setTimeout(() => {
                    result.label.classList.add('dw-fs-highlight');

                    if (!keepFocus) {
                        result.input.focus();
                        result.input.style.transition = 'box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                        result.input.style.boxShadow = '0 0 0 3px rgba(92, 156, 204, 0.4)';
                        setTimeout(() => {
                            result.input.style.boxShadow = '';
                        }, CONFIG.timing.highlight + 200);
                    }

                    setTimeout(() => result.label.classList.remove('dw-fs-highlight'), CONFIG.timing.highlight);
                    resolve();
                }, CONFIG.timing.scroll);
            });
        },

        createWidget: () => {
            const overlay = document.createElement('div');
            overlay.className = 'dw-fs-overlay';
            overlay.innerHTML = `
            <div class="dw-fs-widget">
                <div class="dw-fs-header">
                    <div class="dw-fs-title">Feldsuche (Aktiver Tab)</div>
                    <button class="dw-fs-close">×</button>
                </div>
                <div class="dw-fs-content">
                    <div class="dw-fs-input-wrap">
                        <input type="text" class="dw-fs-input" placeholder="Feldname eingeben..." autocomplete="off">
                        <button class="dw-fs-clear">×</button>
                    </div>
                    <div class="dw-fs-suggestions"></div>
                    <div class="dw-fs-info">Sucht im aktuell geöffneten Tab nach dem gewünschten Feld.</div>
                    <div class="dw-fs-shortcut"></div>
                    <div class="dw-fs-results"></div>
                </div>
            </div>
        `;
            document.body.appendChild(overlay);

            const widget = $('.dw-fs-widget', overlay);
            const input = $('.dw-fs-input', widget);
            const clear = $('.dw-fs-clear', widget);
            const close = $('.dw-fs-close', widget);
            const suggestions = $('.dw-fs-suggestions', widget);
            const results = $('.dw-fs-results', widget);

            // ÄNDERUNG: Smooth Close mit Fade-Out
            const closeWidget = () => {
                overlay.style.animation = 'fadeOut 0.2s ease';
                widget.style.animation = 'slideOut 0.2s ease';
                setTimeout(() => {
                    state.results = [];
                    state.currentIndex = 0;
                    overlay.remove();
                }, 200);
            };

            // ÄNDERUNG: Smooth Suggestions Toggle
            const updateSuggestions = (list) => {
                if (!list.length) {
                    suggestions.classList.remove('visible');
                    setTimeout(() => suggestions.style.display = 'none', 300);
                    return;
                }

                suggestions.innerHTML = list.map((s, i) => `
                <div class="dw-fs-suggestion" data-idx="${i}" data-name="${s.text}" style="animation: fadeInUp 0.2s ease ${i * 0.03}s both">
                    <div style="font-weight:500">${s.text}</div>
                    <div style="font-size:10px;color:#999;margin-top:2px">${s.tab.name}</div>
                </div>
            `).join('');

                $$('.dw-fs-suggestion', suggestions).forEach((div, i) => {
                    addListener(div, 'click', () => {
                        if (state.results.length && div.dataset.idx < state.results.length) {
                            state.currentIndex = parseInt(div.dataset.idx);
                            UI.scrollTo(state.results[state.currentIndex], false).then(closeWidget);
                        } else {
                            input.value = div.dataset.name;
                            executeSearch(div.dataset.name);
                        }
                    });
                    addListener(div, 'mouseenter', () => {
                        state.selectedSuggestion = i;
                        $$('.dw-fs-suggestion').forEach((s, j) => s.classList.toggle('active', j === i));
                    });
                });

                suggestions.style.display = 'block';
                setTimeout(() => suggestions.classList.add('visible'), 10);
            };

            const executeSearch = (term, next = false) => {
                if (!term) return;

                results.innerHTML = '<div class="dw-fs-results loading">Suche im aktiven Tab...</div>';

                setTimeout(() => {
                    const found = FieldFinder.search(term);

                    if (found.length) {
                        if (!next) {
                            state.results = found;
                            state.currentIndex = 0;
                        } else {
                            state.currentIndex = (state.currentIndex + 1) % state.results.length;
                        }

                        const current = state.results[state.currentIndex];
                        const single = state.results.length === 1;

                        UI.scrollTo(current, !single).then(() => {
                            results.innerHTML = `
                            <div style="color:#0066cc;font-weight:bold;margin-bottom:4px">
                                ✅ ${current.config || current.text}
                            </div>
                            <div style="font-size:10px;color:#666;margin-bottom:4px">
                                ${current.tab.name} | Typ: ${current.input.type || current.input.tagName}
                            </div>
                        `;

                            if (!single) {
                                results.innerHTML += `
                                <div style="font-size:11px;color:#0066cc;margin-top:6px;font-weight:bold">
                                    📍 Treffer ${state.currentIndex + 1} von ${state.results.length}<br>
                                    <span style="font-size:10px;color:#666">Tab/Enter = Nächster | Shift+Tab = Zurück | ESC = Schließen</span>
                                </div>
                            `;
                                updateSuggestions(state.results);
                                setTimeout(() => input.focus(), 100);
                            } else {
                                suggestions.classList.remove('visible');
                                setTimeout(() => {
                                    suggestions.style.display = 'none';
                                    closeWidget();
                                }, CONFIG.timing.close);
                            }

                            results.className = 'dw-fs-results success';
                        });
                    } else {
                        const tab = TabManager.findActive();
                        results.innerHTML = `
                        <div style="color:#cc0000">❌ Kein Feld in "${tab?.name || 'diesem Tab'}" gefunden</div>
                        <div style="font-size:10px;color:#999;margin-top:4px">Suchbegriff: "${term}"</div>
                    `;
                        results.className = 'dw-fs-results error';
                        suggestions.classList.remove('visible');
                        setTimeout(() => suggestions.style.display = 'none', 300);
                    }
                }, CONFIG.timing.tabWait);
            };

            // Event Handlers
            addListener(input, 'input', (e) => {
                const term = e.target.value.trim();
                // ÄNDERUNG: Smooth Clear Button Toggle
                if (term) {
                    clear.classList.add('visible');
                } else {
                    clear.classList.remove('visible');
                }

                state.results = [];
                state.currentIndex = 0;
                state.selectedSuggestion = -1;

                if (term) {
                    const preview = FieldFinder.search(term);
                    updateSuggestions(preview);
                } else {
                    suggestions.classList.remove('visible');
                    setTimeout(() => suggestions.style.display = 'none', 300);
                }

                results.textContent = '';
            });

            addListener(input, 'keydown', (e) => {
                const items = $$('.dw-fs-suggestion', suggestions);

                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (state.selectedSuggestion >= 0 && items[state.selectedSuggestion]) {
                        items[state.selectedSuggestion].click();
                    } else if (state.results.length > 1) {
                        executeSearch(input.value.trim(), true);
                    } else {
                        executeSearch(input.value.trim());
                    }
                }
                else if (e.key === 'Tab') {
                    e.preventDefault();
                    if (suggestions.classList.contains('visible') && items.length) {
                        state.selectedSuggestion = e.shiftKey ?
                            (state.selectedSuggestion <= 0 ? items.length - 1 : state.selectedSuggestion - 1) :
                            (state.selectedSuggestion >= items.length - 1 ? 0 : state.selectedSuggestion + 1);
                        items.forEach((it, i) => it.classList.toggle('active', i === state.selectedSuggestion));
                        input.value = items[state.selectedSuggestion].dataset.name;
                    } else if (state.results.length > 1) {
                        state.currentIndex = e.shiftKey ?
                            (state.currentIndex - 1 + state.results.length) % state.results.length :
                            (state.currentIndex + 1) % state.results.length;

                        UI.scrollTo(state.results[state.currentIndex], true).then(() => {
                            results.innerHTML = `
                            <div style="color:#0066cc;font-weight:bold">✅ ${state.results[state.currentIndex].text}</div>
                            <div style="font-size:11px;color:#0066cc;margin-top:6px;font-weight:bold">
                                📍 Treffer ${state.currentIndex + 1} von ${state.results.length}
                            </div>
                        `;
                            setTimeout(() => input.focus(), 100);
                        });
                    }
                }
                else if (e.key === 'ArrowDown' && items.length) {
                    e.preventDefault();
                    state.selectedSuggestion = Math.min(state.selectedSuggestion + 1, items.length - 1);
                    items.forEach((it, i) => it.classList.toggle('active', i === state.selectedSuggestion));
                }
                else if (e.key === 'ArrowUp' && items.length) {
                    e.preventDefault();
                    state.selectedSuggestion = Math.max(state.selectedSuggestion - 1, -1);
                    items.forEach((it, i) => it.classList.toggle('active', i === state.selectedSuggestion));
                }
                else if (e.key === 'Escape') {
                    closeWidget();
                }
            });

            addListener(clear, 'click', () => {
                input.value = '';
                clear.classList.remove('visible');
                suggestions.classList.remove('visible');
                setTimeout(() => suggestions.style.display = 'none', 300);
                results.textContent = '';
                input.focus();
            });

            addListener(close, 'click', closeWidget);
            addListener(overlay, 'click', (e) => e.target === overlay && closeWidget());

            setTimeout(() => input.focus(), 111);
        }
    };

    // ===== INIT =====
    const init = () => {
        UI.createStyles();
        UI.createIndicator();

        addListener(document, 'keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === CONFIG.shortcut.key) {
                e.preventDefault();
                if (!$('.dw-fs-overlay')) UI.createWidget();
            }
        });

        console.log('✅ DocuWare Field Search | Strg+Shift+D');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

