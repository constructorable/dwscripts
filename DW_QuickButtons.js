(function () {
    'use strict';
    const SCRIPT_ID = 'docuware-enhancement-script';

    // Reset bei erneuter Ausführung
    if (window[SCRIPT_ID]) {
        console.log('🔄 DocuWare Enhancement wird zurückgesetzt...');
        document.querySelectorAll('.dw-field-wrapper').forEach(w => {
            const f = w.querySelector('input, textarea, span');
            if (f) {
                w.parentNode.insertBefore(f, w);
                f.style.paddingLeft = '';
                f.style.paddingRight = '';
                f.classList.remove('keyword-value-span');
            }
            w.remove();
        });
        document.querySelectorAll('.keyword-row.dw-field-wrapper').forEach(r => {
            r.classList.remove('dw-field-wrapper');
            r.style.cssText = '';
            const b = r.querySelector('.dw-field-buttons');
            if (b) b.remove();
            const s = r.querySelector('.keyword-value-span');
            if (s) {
                s.classList.remove('keyword-value-span');
                s.style.paddingLeft = '';
                s.style.paddingRight = '';
            }
        });
        const g = document.querySelector('.dw-cell-copy-btn');
        if (g) g.remove();
        document.querySelectorAll('.dw-cell-enhanced').forEach(c => c.classList.remove('dw-cell-enhanced'));
        const e = document.querySelector('style[data-dw-enhancement]');
        if (e) e.remove();
        if (window[SCRIPT_ID].observer) window[SCRIPT_ID].observer.disconnect();
        if (window[SCRIPT_ID].listeners) window[SCRIPT_ID].listeners.forEach(({ element, event, handler }) => element.removeEventListener(event, handler));
        delete window[SCRIPT_ID];
        console.log('✅ DocuWare Enhancement komplett zurückgesetzt');
    }

    window[SCRIPT_ID] = { observer: null, listeners: [] };
    console.log('🚀 DocuWare Enhancement wird neu initialisiert...');

    // Font Awesome laden
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(l);
    }

    // CSS Styles - Buttons innerhalb der Inputfelder positioniert
    const s = document.createElement('style');
    s.setAttribute('data-dw-enhancement', 'true');
    s.textContent = `.dw-field-buttons{position:absolute;left:30px!important;top:2px!important;bottom:2px!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:2px!important;z-index:1000;background:rgba(137, 250, 106, 0);border-radius:4px;padding:1px 3px!important;width:auto!important;height:auto!important;min-height:16px!important;max-height:calc(100% - 4px)!important}.dw-field-wrapper .dw-dateField+.dw-field-buttons,.dw-field-wrapper .is-dateEntry+.dw-field-buttons,.dw-field-wrapper .hasCalendarsPicker+.dw-field-buttons{left:30px!important}.keyword-row.dw-field-wrapper{position:relative!important;display:table-row!important;width:100%!important}.keyword-row .dw-field-buttons{position:absolute!important;left:15px!important;top:50%!important;transform:translateY(-50%)!important;bottom:auto!important;display:flex!important;background:rgba(255,255,255,0.9)!important;border-radius:3px!important;padding:2px!important}.keyword-value-span{position:relative!important;padding-left:65px!important;display:inline-block!important;min-width:200px!important}.dw-cell-copy-btn{position:fixed!important;width:18px!important;height:18px!important;border:1px solid rgb(255,255,255)!important;background:rgba(255,255,255,0.95)!important;border-radius:3px!important;cursor:pointer!important;display:none!important;align-items:center!important;justify-content:center!important;font-size:11px!important;color:rgb(81,81,81)!important;z-index:9999!important;transition:all 0.15s ease!important;margin:0!important;padding:0!important;pointer-events:auto!important;opacity:0.7}.dw-cell-copy-btn:hover{background:#d4edda!important;color:rgb(62,62,62)!important;border-color:rgb(255,255,255)!important;transform:scale(1.3)!important;box-shadow:0 3px 12px rgba(0,0,0,0.25)!important;opacity:.7}.dw-cell-copy-btn.show{display:flex!important}.dw-cell-copy-btn.success{background:#d4edda!important;color:rgb(64,64,64)!important;border-color:rgb(255,255,255)!important;opacity:.7}.dw-cell-copy-btn.error{background:#f8d7da!important;color:#721c24!important;border-color:rgb(255,255,255)!important;opacity:.7}.dw-field-btn{width:16px!important;height:16px!important;min-width:16px!important;min-height:16px!important;max-width:16px!important;max-height:16px!important;border:1px solid rgb(255,255,255)!important;background:#ffffff!important;border-radius:2px!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:9px!important;color:#6c757d!important;transition:all 0.15s ease!important;flex-shrink:0!important;margin:0!important;padding:0!important;position:relative!important;float:none!important;opacity:0.3}.dw-field-btn:hover{border-color:rgb(255,255,255)!important;transform:scale(1.3)!important;z-index:1001!important;opacity:.7}.dw-field-btn.copy-btn:hover{background:#d4edda!important;color:rgba(91,91,91,0.8)!important;border-color:rgb(255,255,255)!important;opacity:.7}.dw-field-btn.paste-btn:hover{background:#cce5ff!important;color:rgba(110,110,110,0.83)!important;border-color:rgb(255,255,255)!important;opacity:.7}.dw-field-btn.clear-btn:hover{background:#f5c6cb!important;color:rgba(113,113,113,0.71)!important;border-color:rgb(255,255,255)!important;opacity:.7}.dw-field-wrapper{position:relative!important;display:inline-block!important;width:100%!important}.dw-field-wrapper .dw-textField,.dw-field-wrapper .dw-numericField,.dw-field-wrapper .dw-memoField{padding-left:65px!important}.dw-field-wrapper .dw-dateField,.dw-field-wrapper .is-dateEntry,.dw-field-wrapper .hasCalendarsPicker{padding-left:65px!important}.dw-field-wrapper textarea.dw-memoField+.dw-field-buttons{top:5px!important;bottom:auto!important;left:30px!important}`;
    document.head.appendChild(s);

    // Variablen
    let clipboardStorage = '', currentCellButton = null, currentHoveredCell = null, buttonVisible = false;
    const supportedFieldTypes = { textField: '.dw-textField', numericField: '.dw-numericField', memoField: '.dw-memoField', dateField: '.dw-dateField', dateEntry: '.is-dateEntry', calendarPicker: '.hasCalendarsPicker', keywordSpan: 'span[data-bind*="text: value"]' };

    // Hilfsfunktionen
    const addTrackedEventListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        window[SCRIPT_ID].listeners.push({ element, event, handler });
    };

    const isSupportedField = (element) => {
        for (const fieldType in supportedFieldTypes) {
            const selector = supportedFieldTypes[fieldType];
            if (selector.startsWith('.')) {
                const className = selector.replace('.', '');
                if (element.classList && element.classList.contains(className)) return true;
            }
        }
        return (element.tagName === 'SPAN' && element.getAttribute('data-bind') && element.getAttribute('data-bind').includes('text: value')) || element.closest('.keywords-container');
    };

    const isKeywordSpan = (element) => element.tagName === 'SPAN' && element.getAttribute('data-bind') && element.getAttribute('data-bind').includes('text: value');

    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                return copyToClipboardFallback(text);
            }
        } catch (err) {
            return copyToClipboardFallback(text);
        }
    };

    const copyToClipboardFallback = (text) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            Object.assign(textArea.style, { position: 'fixed', left: '-9999px', top: '-9999px', opacity: '0', pointerEvents: 'none', zIndex: '-1' });
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (err) {
            return false;
        }
    };

    const readFromClipboard = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                return await navigator.clipboard.readText();
            } else {
                return clipboardStorage;
            }
        } catch (err) {
            return clipboardStorage;
        }
    };

    const getElementText = (element) => {
        let text = element.textContent || element.innerText || element.value || '';
        return text.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/^\s+|\s+$/g, '');
    };

    const createGlobalCellCopyButton = () => {
        if (document.querySelector('.dw-cell-copy-btn')) return document.querySelector('.dw-cell-copy-btn');
        const copyButton = document.createElement('button');
        Object.assign(copyButton, { className: 'dw-cell-copy-btn', innerHTML: '<i class="fas fa-copy"></i>', title: 'Zellwert in Zwischenablage kopieren', type: 'button', tabIndex: -1 });
        document.body.appendChild(copyButton);
        addTrackedEventListener(copyButton, 'mouseenter', () => buttonVisible = true);
        return copyButton;
    };

    const positionCellButton = (cell, button) => {
        const rect = cell.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        // Zurück zu rechtsbündiger Positionierung für Zellen-Copy-Button
        button.style.left = (rect.right - 25 + scrollLeft) + 'px'; // Rechtsbündig wie vorher
        button.style.top = (rect.top + (rect.height / 2) - 9 + scrollTop) + 'px';
        button.style.opacity = 0.6;
        button.classList.add('show');
        buttonVisible = true;
    };

    const hideCellButton = () => {
        if (currentCellButton && buttonVisible) {
            currentCellButton.classList.remove('show', 'success', 'error');
            currentCellButton = null;
            currentHoveredCell = null;
            buttonVisible = false;
        }
    };

    const isMouseOverRelevantArea = (mouseX, mouseY) => {
        if (!currentHoveredCell || !currentCellButton) return false;
        const cellRect = currentHoveredCell.getBoundingClientRect();
        const buttonRect = currentCellButton.getBoundingClientRect();
        const cellArea = { left: cellRect.left - 5, right: cellRect.right + 5, top: cellRect.top - 5, bottom: cellRect.bottom + 5 };
        const buttonArea = { left: buttonRect.left - 5, right: buttonRect.right + 5, top: buttonRect.top - 5, bottom: buttonRect.bottom + 5 };
        const overCell = mouseX >= cellArea.left && mouseX <= cellArea.right && mouseY >= cellArea.top && mouseY <= cellArea.bottom;
        const overButton = mouseX >= buttonArea.left && mouseX <= buttonArea.right && mouseY >= buttonArea.top && mouseY <= buttonArea.bottom;
        return overCell || overButton;
    };

    const setupGlobalMouseTracking = () => {
        addTrackedEventListener(document, 'mousemove', (e) => {
            if (buttonVisible && !isMouseOverRelevantArea(e.clientX, e.clientY)) {
                setTimeout(() => {
                    if (buttonVisible && !isMouseOverRelevantArea(e.clientX, e.clientY)) hideCellButton();
                }, 300);
            }
        });
    };

    const enhanceResultListCells = () => {
        const cells = document.querySelectorAll('.slick-cell:not(.dw-cell-enhanced)');
        const copyButton = createGlobalCellCopyButton();
        cells.forEach(cell => {
            const cellText = getElementText(cell);
            const hasIcon = cell.querySelector('.ui-icon, .dw-icon');
            if (cellText.trim() && cellText.length > 0 && !hasIcon) {
                cell.classList.add('dw-cell-enhanced');
                let hoverTimeout;
                const mouseEnterHandler = (e) => {
                    hoverTimeout = setTimeout(() => {
                        currentHoveredCell = cell;
                        currentCellButton = copyButton;
                        positionCellButton(cell, copyButton);
                        copyButton.onclick = async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const cellText = getElementText(cell);
                            if (cellText.trim()) {
                                const success = await copyToClipboard(cellText);
                                clipboardStorage = cellText;
                                if (success) {
                                    copyButton.classList.add('success');
                                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                                    setTimeout(() => {
                                        copyButton.classList.remove('success');
                                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                                    }, 800);
                                } else {
                                    copyButton.classList.add('error');
                                    copyButton.innerHTML = '<i class="fas fa-exclamation"></i>';
                                    setTimeout(() => {
                                        copyButton.classList.remove('error');
                                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                                    }, 800);
                                }
                            }
                        };
                    }, 222);
                };
                const mouseLeaveHandler = (e) => {
                    if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                        hoverTimeout = null;
                    }
                };
                addTrackedEventListener(cell, 'mouseenter', mouseEnterHandler);
                addTrackedEventListener(cell, 'mouseleave', mouseLeaveHandler);
            }
        });
    };

    const isDateField = (inputField) => inputField.classList.contains('dw-dateField') || inputField.classList.contains('is-dateEntry') || inputField.classList.contains('hasCalendarsPicker');

    const createButtonContainer = (element) => {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'dw-field-buttons';
        const isKeyword = isKeywordSpan(element);

        // Buttons werden innerhalb der Inputfelder positioniert
        let leftPosition = isKeyword ? '15px' : '30px';
        buttonContainer.style.cssText = `position:absolute!important;left:${leftPosition}!important;top:${isKeyword ? '50%' : '2px'}!important;${isKeyword ? 'transform:translateY(-50%)!important;' : 'bottom:2px!important;'}display:flex!important;flex-direction:row!important;align-items:center!important;gap:2px!important;z-index:1000!important;background:rgba(137, 250, 106, 0)!important;border-radius:4px!important;padding:1px 3px!important;`;

        const copyButton = document.createElement('button');
        Object.assign(copyButton, { className: 'dw-field-btn copy-btn', innerHTML: '<i class="fas fa-copy"></i>', title: 'In Zwischenablage kopieren', type: 'button', tabIndex: -1 });
        copyButton.style.cssText = `width:16px!important;height:16px!important;border:1px solid rgb(255,255,255)!important;background:#ffffff!important;border-radius:2px!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:9px!important;margin:0!important;padding:0!important;flex-shrink:0!important;margin-top:-5px!important;`;

        const copyClickHandler = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const elementValue = getElementText(element);
            if (elementValue) {
                const success = await copyToClipboard(elementValue);
                clipboardStorage = elementValue;
                if (success) {
                    Object.assign(copyButton.style, { background: '#d4edda', borderColor: '#c3e6cb' });
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        Object.assign(copyButton.style, { background: '#ffffff', borderColor: '#dee2e6' });
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 500);
                } else {
                    Object.assign(copyButton.style, { background: '#fc0', borderColor: '#f5c6cb' });
                    setTimeout(() => Object.assign(copyButton.style, { background: '#ffffff', borderColor: '#dee2e6' }), 500);
                }
            }
        };

        addTrackedEventListener(copyButton, 'click', copyClickHandler);
        buttonContainer.appendChild(copyButton);

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const pasteButton = document.createElement('button');
            Object.assign(pasteButton, { className: 'dw-field-btn paste-btn', innerHTML: '<i class="fas fa-paste"></i>', title: 'Aus Zwischenablage einfügen', type: 'button', tabIndex: -1 });
            pasteButton.style.cssText = copyButton.style.cssText;

            const clearButton = document.createElement('button');
            Object.assign(clearButton, { className: 'dw-field-btn clear-btn', innerHTML: '<i class="fas fa-times"></i>', title: 'Feld leeren', type: 'button', tabIndex: -1 });
            clearButton.style.cssText = copyButton.style.cssText;

            const pasteClickHandler = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const clipboardText = await readFromClipboard();
                if (clipboardText && clipboardText.trim()) {
                    element.value = clipboardText;
                    element.focus();
                    ['input', 'change', 'blur'].forEach(eventType => element.dispatchEvent(new Event(eventType, { bubbles: true })));
                    if (isDateField(element)) element.dispatchEvent(new Event('datechange', { bubbles: true }));
                    Object.assign(pasteButton.style, { background: '#cce5ff', borderColor: '#b3d7ff' });
                    setTimeout(() => Object.assign(pasteButton.style, { background: '#ffffff', borderColor: '#dee2e6' }), 300);
                }
            };

            const clearClickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                element.value = '';
                element.focus();
                ['input', 'change', 'blur'].forEach(eventType => element.dispatchEvent(new Event(eventType, { bubbles: true })));
                if (isDateField(element)) element.dispatchEvent(new Event('datechange', { bubbles: true }));
                Object.assign(clearButton.style, { background: '#f5c6cb', borderColor: '#f1aeb5' });
                setTimeout(() => Object.assign(clearButton.style, { background: '#ffffff', borderColor: '#dee2e6' }), 300);
            };

            addTrackedEventListener(pasteButton, 'click', pasteClickHandler);
            addTrackedEventListener(clearButton, 'click', clearClickHandler);
            buttonContainer.appendChild(pasteButton);
            buttonContainer.appendChild(clearButton);
        }
        return buttonContainer;
    };

    const enhanceElement = (element) => {
        if (element.closest('.dw-field-wrapper') || !isSupportedField(element)) return;
        const isKeyword = isKeywordSpan(element);
        if (isKeyword) {
            const keywordRow = element.closest('tr.keyword-row');
            if (keywordRow && !keywordRow.classList.contains('dw-field-wrapper')) {
                keywordRow.classList.add('dw-field-wrapper');
                keywordRow.style.cssText = `position:relative!important;display:table-row!important;width:100%!important;`;
                element.classList.add('keyword-value-span');
                element.style.paddingLeft = '65px';
                keywordRow.appendChild(createButtonContainer(element));
            }
        } else {
            const wrapper = document.createElement('div');
            wrapper.className = 'dw-field-wrapper';
            wrapper.style.cssText = `position:relative!important;display:inline-block!important;width:100%!important;`;
            const parent = element.parentNode;
            parent.insertBefore(wrapper, element);
            wrapper.appendChild(element);
            element.style.paddingLeft = '65px';
            wrapper.appendChild(createButtonContainer(element));
        }
    };

    const enhanceAllElements = () => {
        const inputSelectors = ['.dw-textField', '.dw-numericField', '.dw-memoField', '.dw-dateField', '.is-dateEntry', '.hasCalendarsPicker'];
        inputSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(field => {
                if (field.type !== 'hidden' && !field.readOnly && !field.disabled && field.offsetWidth > 0 && field.offsetHeight > 0) {
                    enhanceElement(field);
                }
            });
        });
        document.querySelectorAll('span[data-bind*="text: value"]').forEach(span => {
            const spanText = getElementText(span);
            if (spanText.trim() && spanText.length > 0) enhanceElement(span);
        });
        enhanceResultListCells();
    };

    // Observer für dynamische Inhalte
    const fieldObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    const inputSelectors = ['.dw-textField', '.dw-numericField', '.dw-memoField', '.dw-dateField', '.is-dateEntry', '.hasCalendarsPicker'];
                    inputSelectors.forEach(selector => {
                        const newInputs = node.querySelectorAll ? node.querySelectorAll(selector) : [];
                        newInputs.forEach(input => {
                            if (!input.readOnly && !input.disabled && input.offsetWidth > 0 && input.offsetHeight > 0) {
                                setTimeout(() => enhanceElement(input), 200);
                            }
                        });
                    });
                    const newKeywordSpans = node.querySelectorAll ? node.querySelectorAll('span[data-bind*="text: value"]') : [];
                    newKeywordSpans.forEach(span => {
                        const spanText = getElementText(span);
                        if (spanText.trim() && spanText.length > 0) setTimeout(() => enhanceElement(span), 200);
                    });
                    const newCells = node.querySelectorAll ? node.querySelectorAll('.slick-cell:not(.dw-cell-enhanced)') : [];
                    if (newCells.length > 0) setTimeout(() => enhanceResultListCells(), 200);
                    if (isSupportedField(node)) setTimeout(() => enhanceElement(node), 200);
                    if (node.classList && node.classList.contains('slick-cell')) setTimeout(() => enhanceResultListCells(), 200);
                }
            });
        });
    });

    fieldObserver.observe(document.body, { childList: true, subtree: true });
    window[SCRIPT_ID].observer = fieldObserver;

    // Event Listeners
    addTrackedEventListener(window, 'scroll', () => {
        if (buttonVisible && currentHoveredCell && currentCellButton) {
            positionCellButton(currentHoveredCell, currentCellButton);
        }
    });

    setupGlobalMouseTracking();

    // Initialisierung
    if (document.readyState === 'loading') {
        addTrackedEventListener(document, 'DOMContentLoaded', enhanceAllElements);
    } else {
        enhanceAllElements();
    }

    setTimeout(enhanceAllElements, 1000);
    setTimeout(enhanceAllElements, 3000);

    console.log('✅ DocuWare Enhancement: Buttons innerhalb der Inputfelder positioniert');
    console.log('🔧 Unterstützte Feldtypen:', Object.keys(supportedFieldTypes));
    console.log('🔄 Script kann durch erneute Ausführung zurückgesetzt werden');
})();