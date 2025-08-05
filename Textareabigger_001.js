(function() {
    'use strict';

    const CONFIG = {

        textareaSelector: 'textarea.dw-memoField',

        minHeight: 80,

        maxHeight: 500,

        heightPadding: 10,

        resizeDelay: 100,

        checkInterval: 1000
    };

    const autoResizeStyles = `
        <style id="textarea-auto-resize-styles">
            .dw-memoField.auto-resized {
                resize: vertical !important;
                overflow-y: hidden !important;
                transition: height 0.2s ease !important;
                min-height: ${CONFIG.minHeight}px !important;
                max-height: ${CONFIG.maxHeight}px !important;
            }

            .dw-memoField.auto-resized + .scroll-tools {
                display: none !important;
            }

            .right-inner-addons:has(.dw-memoField.auto-resized) {
                overflow: visible !important;
            }

            .table-fields-content:has(.dw-memoField.auto-resized) {
                overflow: visible !important;
            }
        </style>
    `;

    function calculateRequiredHeight(textarea) {

        const originalHeight = textarea.style.height;
        const originalOverflow = textarea.style.overflow;

        textarea.style.height = 'auto';
        textarea.style.overflow = 'hidden';

        const scrollHeight = textarea.scrollHeight;

        textarea.style.height = originalHeight;
        textarea.style.overflow = originalOverflow;

        return scrollHeight;
    }

    function autoResizeTextarea(textarea) {
        if (!textarea || textarea.classList.contains('auto-resized')) {
            return;
        }

        textarea.classList.add('auto-resized');

        function adjustHeight() {
            const requiredHeight = calculateRequiredHeight(textarea);
            const newHeight = Math.max(
                CONFIG.minHeight,
                Math.min(CONFIG.maxHeight, requiredHeight + CONFIG.heightPadding)
            );

            textarea.style.height = newHeight + 'px';

            const scrollTools = textarea.parentElement.querySelector('.scroll-tools');
            if (scrollTools && newHeight < CONFIG.maxHeight) {
                scrollTools.style.display = 'none';
            }
        }

        adjustHeight();

        let resizeTimeout;

        function delayedResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(adjustHeight, CONFIG.resizeDelay);
        }

        textarea.addEventListener('input', delayedResize);
        textarea.addEventListener('keyup', delayedResize);
        textarea.addEventListener('keydown', delayedResize);
        textarea.addEventListener('paste', () => {
            setTimeout(adjustHeight, 10);
        });

        textarea.addEventListener('focus', adjustHeight);

        if (window.ko && window.ko.dataFor) {
            try {
                const koData = ko.dataFor(textarea);
                if (koData && koData.value && ko.isObservable(koData.value)) {
                    koData.value.subscribe(function(newValue) {
                        setTimeout(adjustHeight, 50);
                    });
                }
            } catch (e) {
                console.log('Knockout.js Binding nicht verfügbar für Textarea');
            }
        }

        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'value' || mutation.attributeName === 'data-bind')) {
                        delayedResize();
                    }
                });
            });

            observer.observe(textarea, {
                attributes: true,
                attributeFilter: ['value', 'data-bind']
            });

            textarea._autoResizeObserver = observer;
        }

        console.log('Auto-Resize für Textarea aktiviert:', textarea);
    }

    function processExistingTextareas() {
        const textareas = document.querySelectorAll(CONFIG.textareaSelector);
        let processedCount = 0;

        textareas.forEach(function(textarea) {
            if (!textarea.classList.contains('auto-resized')) {
                autoResizeTextarea(textarea);
                processedCount++;
            }
        });

        if (processedCount > 0) {
            console.log(`${processedCount} Textareas für Auto-Resize konfiguriert`);
        }

        return processedCount;
    }

    function cleanup() {
        const textareas = document.querySelectorAll(CONFIG.textareaSelector + '.auto-resized');

        textareas.forEach(function(textarea) {

            if (textarea._autoResizeObserver) {
                textarea._autoResizeObserver.disconnect();
                delete textarea._autoResizeObserver;
            }

            textarea.classList.remove('auto-resized');
            textarea.style.height = '';
            textarea.style.overflow = '';
            textarea.style.transition = '';

            const scrollTools = textarea.parentElement.querySelector('.scroll-tools');
            if (scrollTools) {
                scrollTools.style.display = '';
            }
        });

        const existingStyles = document.getElementById('textarea-auto-resize-styles');
        if (existingStyles) {
            existingStyles.remove();
        }

        console.log('Auto-Resize-Funktionalität bereinigt');
    }

    function addStyles() {
        if (!document.getElementById('textarea-auto-resize-styles')) {
            document.head.insertAdjacentHTML('beforeend', autoResizeStyles);
        }
    }

    function setupEventListeners() {

        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let hasNewTextareas = false;

                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { 

                                if ((node.matches && node.matches(CONFIG.textareaSelector)) ||
                                    (node.querySelector && node.querySelector(CONFIG.textareaSelector))) {
                                    hasNewTextareas = true;
                                }
                            }
                        });
                    }
                });

                if (hasNewTextareas) {
                    setTimeout(processExistingTextareas, 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        window.addEventListener('resize', function() {
            const textareas = document.querySelectorAll(CONFIG.textareaSelector + '.auto-resized');
            textareas.forEach(function(textarea) {
                setTimeout(() => {
                    const requiredHeight = calculateRequiredHeight(textarea);
                    const newHeight = Math.max(
                        CONFIG.minHeight,
                        Math.min(CONFIG.maxHeight, requiredHeight + CONFIG.heightPadding)
                    );
                    textarea.style.height = newHeight + 'px';
                }, 100);
            });
        });

        window.addEventListener('hashchange', function() {
            setTimeout(function() {
                addStyles();
                processExistingTextareas();
            }, 500);
        });

        window.addEventListener('popstate', function() {
            setTimeout(function() {
                addStyles();
                processExistingTextareas();
            }, 500);
        });
    }

    function startContinuousCheck() {
        setInterval(processExistingTextareas, CONFIG.checkInterval);
    }

    function init() {
        console.log('Initialisiere Textarea Auto-Resize für DocuWare...');

        addStyles();

        setupEventListeners();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                processExistingTextareas();
                startContinuousCheck();
            });
        } else {
            processExistingTextareas();
            startContinuousCheck();
        }

        setTimeout(processExistingTextareas, 1000);
        setTimeout(processExistingTextareas, 3000);
    }

    window.TextareaAutoResize = {
        process: processExistingTextareas,
        cleanup: cleanup,
        reinit: function() {
            cleanup();
            addStyles();
            processExistingTextareas();
        },
        config: CONFIG
    };

    init();
})();