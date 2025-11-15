// NEU - High-Performance Emoji-Replacer für große DocuWare-Listen
(function () {
    if (window.emojiReplacerActive) return;
    window.emojiReplacerActive = true;

    const emojiToFontAwesome = {
        '👤': 'fa-user', '👥': 'fa-users', '📧': 'fa-envelope',
        '📞': 'fa-phone', '📱': 'fa-mobile-alt', '🏠': 'fa-home',
        '🏡': 'fa-home', '🏢': 'fa-building', '📁': 'fa-folder',
        '📄': 'fa-file', '📝': 'fa-file-alt', '✉️': 'fa-envelope',
        '✅': 'fa-check-circle', '❌': 'fa-times-circle', '⚠️': 'fa-exclamation-triangle',
        '🔍': 'fa-search', '⚙️': 'fa-cog', '📊': 'fa-chart-bar',
        '📈': 'fa-chart-line', '💾': 'fa-save', '🖨️': 'fa-print',
        '📋': 'fa-clipboard', '📅': 'fa-calendar', '🔒': 'fa-lock',
        '🔓': 'fa-unlock', '🧑‍🔧': 'fa-wrench', '🚽': 'fa-toilet',
        '🛠️': 'fa-tools', '👨🏻‍💼': 'fa-user-tie'
    };

    // --- NEU: Regex für alle Emojis ---
    const emojiPattern = new RegExp(Object.keys(emojiToFontAwesome).join('|'), 'g');

    function loadFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    function injectStyles() {
        if (!document.getElementById('emoji-replacer-style')) {
            const style = document.createElement('style');
            style.id = 'emoji-replacer-style';
            style.textContent = `
                .emoji-icon { color: #555555; margin-right: 2px; margin-left: 4px;}
                .emoji-replaced { display: inline-flex; align-items: center; }
            `;
            document.head.appendChild(style);
        }
    }

    // --- NEU: Emoji Ersetzung für einen Textknoten ---
    function replaceEmojisInTextNode(node) {
        const text = node.textContent;
        if (!text.match(emojiPattern)) return;

        const parent = node.parentNode;
        if (!parent || parent.classList.contains('emoji-replaced')) return;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        text.replace(emojiPattern, (match, offset) => {
            if (offset > lastIndex) fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
            const icon = document.createElement('i');
            icon.className = `fas ${emojiToFontAwesome[match]} emoji-icon`;
            fragment.appendChild(icon);
            lastIndex = offset + match.length;
            return match;
        });

        if (lastIndex < text.length) fragment.appendChild(document.createTextNode(text.slice(lastIndex)));

        const wrapper = document.createElement('span');
        wrapper.className = 'emoji-replaced';
        wrapper.appendChild(fragment);
        parent.replaceChild(wrapper, node);
    }

    // --- NEU: Batch-Verarbeitung für viele Knoten ---
    function replaceEmojisBatch(nodes) {
        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                replaceEmojisInTextNode(node);
            } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('emoji-replaced')) {
                // Nur direkte Textkinder prüfen, keine tiefe Rekursion bei großen Listen
                for (const child of node.childNodes) {
                    if (child.nodeType === Node.TEXT_NODE) replaceEmojisInTextNode(child);
                }
            }
        }
    }

    function initEmojiReplacer() {
        loadFontAwesome();
        injectStyles();

        // --- Erstscan: nur Textknoten für große Listen ---
        const textNodes = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: node => {
                return node.textContent.match(emojiPattern) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        let node;
        while (node = walker.nextNode()) textNodes.push(node);
        replaceEmojisBatch(textNodes);

        // --- MutationObserver: Batch-Verarbeitung ---
        const observer = new MutationObserver(mutations => {
            const addedTextNodes = [];
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) addedTextNodes.push(node);
                        else if (node.nodeType === Node.ELEMENT_NODE) {
                            node.childNodes.forEach(c => {
                                if (c.nodeType === Node.TEXT_NODE) addedTextNodes.push(c);
                            });
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    addedTextNodes.push(mutation.target);
                }
            }
            if (addedTextNodes.length > 0) {
                // Verarbeitet maximal 50 Knoten auf einmal, UI bleibt flüssig
                const batchSize = 50;
                for (let i = 0; i < addedTextNodes.length; i += batchSize) {
                    const batch = addedTextNodes.slice(i, i + batchSize);
                    requestAnimationFrame(() => replaceEmojisBatch(batch));
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmojiReplacer);
    } else {
        initEmojiReplacer();
    }
})();

