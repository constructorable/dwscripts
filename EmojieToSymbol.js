// ÄNDERUNG - Aggressivere Emoji-Erkennung für dynamische Ergebnislisten
(function() {
    if (window.emojiReplacerActive) return;
    window.emojiReplacerActive = true;
    
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    if (!document.getElementById('emoji-replacer-style')) {
        const style = document.createElement('style');
        style.id = 'emoji-replacer-style';
        style.textContent = `
            .emoji-icon {
                color: #555555;
                margin-right: 4px;
            }
        `;
        document.head.appendChild(style);
    }
    
    const emojiToFontAwesome = {
        '👤': 'fa-user',
        '👥': 'fa-users',
        '📧': 'fa-envelope',
        '📞': 'fa-phone',
        '📱': 'fa-mobile-alt',
        '🏠': 'fa-home',
        '🏡': 'fa-home',
        '🏢': 'fa-building',
        '📁': 'fa-folder',
        '📄': 'fa-file',
        '📝': 'fa-file-alt',
        '✉️': 'fa-envelope',
        '✅': 'fa-check-circle',
        '❌': 'fa-times-circle',
        '⚠️': 'fa-exclamation-triangle',
        '🔍': 'fa-search',
        '⚙️': 'fa-cog',
        '📊': 'fa-chart-bar',
        '📈': 'fa-chart-line',
        '💾': 'fa-save',
        '🖨️': 'fa-print',
        '📋': 'fa-clipboard',
        '📅': 'fa-calendar',
        '🔒': 'fa-lock',
        '🔓': 'fa-unlock',
        '🧑‍🔧': 'fa-wrench',
        '🚽': 'fa-toilet',
        '🛠️': 'fa-tools',
        '👨🏻‍💼': 'fa-user-tie'
    };
    
    function replaceEmojisInNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent;
            let hasEmoji = false;
            
            for (const emoji of Object.keys(emojiToFontAwesome)) {
                if (text.includes(emoji)) {
                    hasEmoji = true;
                    break;
                }
            }
            
            if (hasEmoji) {
                const parent = node.parentNode;
                if (!parent || parent.classList.contains('emoji-replaced')) return;
                
                const fragment = document.createDocumentFragment();
                let remaining = text;
                
                while (remaining.length > 0) {
                    let foundEmoji = null;
                    let emojiLength = 0;
                    
                    for (const [emoji, iconClass] of Object.entries(emojiToFontAwesome)) {
                        if (remaining.startsWith(emoji)) {
                            foundEmoji = iconClass;
                            emojiLength = emoji.length;
                            break;
                        }
                    }
                    
                    if (foundEmoji) {
                        const icon = document.createElement('i');
                        icon.className = `fas ${foundEmoji} emoji-icon`;
                        fragment.appendChild(icon);
                        remaining = remaining.substring(emojiLength);
                    } else {
                        fragment.appendChild(document.createTextNode(remaining[0]));
                        remaining = remaining.substring(1);
                    }
                }
                
                const wrapper = document.createElement('span');
                wrapper.className = 'emoji-replaced';
                wrapper.appendChild(fragment);
                parent.replaceChild(wrapper, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && 
                   node.tagName !== 'SCRIPT' && 
                   node.tagName !== 'STYLE' &&
                   !node.classList.contains('emoji-replaced')) {
            Array.from(node.childNodes).forEach(child => replaceEmojisInNode(child));
        }
    }
    
    function scanAndReplace() {
        replaceEmojisInNode(document.body);
    }
    
    function initReplacer() {
        scanAndReplace();
        
        // MutationObserver mit erweiterten Optionen
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        replaceEmojisInNode(node);
                    });
                } else if (mutation.type === 'characterData') {
                    replaceEmojisInNode(mutation.target);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        // Zusätzlich: Periodisches Scannen alle 2000ms
        setInterval(scanAndReplace, 2000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initReplacer, 2000);
        });
    } else {
        setTimeout(initReplacer, 2000);
    }
})();