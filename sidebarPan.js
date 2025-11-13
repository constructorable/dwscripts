// TEMPORÄRER CODE: Splitter-Buttons für Schnellauswahl (1200px, 1500px, 1900px)
// Erstellt drei Buttons zur schnellen Positionierung des Splitters

(function() {
    const ID = 'dw-splitter-buttons';
    
    // Cleanup vorheriger Instanz
    if (document.getElementById(ID)) {
        document.getElementById(ID).remove();
    }
    
    // CSS injizieren
    const style = document.createElement('style');
    style.id = `${ID}-style`;
    style.textContent = `
        #${ID} {
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            background: #fff;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: system-ui, -apple-system, sans-serif;
        }
        #${ID} .title {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            text-align: center;
        }
        #${ID} .button-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        #${ID} button {
            padding: 8px 16px;
            border: 1px solid #3b82f6;
            background: #fff;
            color: #3b82f6;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s;
            min-width: 100px;
        }
        #${ID} button:hover {
            background: #eff6ff;
            transform: translateY(-1px);
        }
        #${ID} button.active {
            background: #3b82f6;
            color: #fff;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        #${ID} .close-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 20px;
            height: 20px;
            border: none;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            padding: 0;
            min-width: auto;
        }
        #${ID} .close-btn:hover {
            color: #374151;
            background: transparent;
            transform: none;
        }
    `;
    document.head.appendChild(style);
    
    // Button-Container erstellen
    const container = document.createElement('div');
    container.id = ID;
    container.innerHTML = `
        <button class="close-btn" title="Schließen">×</button>
        <div class="title">Splitter-Position</div>
        <div class="button-group">
            <button data-position="1200">1200 px</button>
            <button data-position="1500">1500 px</button>
            <button data-position="1900">1900 px</button>
        </div>
    `;
    document.body.appendChild(container);
    
    // Funktion zum Verschieben des Splitters
    function moveSplitter(targetLeft) {
        const splitterContainer = document.querySelector('.masterArea.splitter');
        if (!splitterContainer) {
            console.log('❌ Splitter-Container nicht gefunden');
            return false;
        }
        
        const splitterBar = splitterContainer.querySelector('.splitter-bar.splitter-bar-vertical');
        if (!splitterBar) {
            console.log('❌ Splitter-Bar nicht gefunden');
            return false;
        }
        
        const leftPane = splitterContainer.querySelector('.left-splitter-pane');
        const rightPane = splitterContainer.querySelector('.splitter-pane:not(.left-splitter-pane)');
        
        if (!leftPane || !rightPane) {
            console.log('❌ Splitter-Panes nicht gefunden');
            return false;
        }
        
        const containerWidth = splitterContainer.offsetWidth;
        const splitterWidth = splitterBar.offsetWidth || 10;
        const newRightLeft = targetLeft + splitterWidth;
        const newRightWidth = containerWidth - newRightLeft;
        
        console.log(`📍 Verschiebe zu: ${targetLeft}px`);
        
        // Setze neue Größen
        leftPane.style.width = `${targetLeft}px`;
        rightPane.style.width = `${newRightWidth}px`;
        rightPane.style.left = `${newRightLeft}px`;
        splitterBar.style.left = `${targetLeft}px`;
        
        // Trigger Events
        if (typeof $ !== 'undefined') {
            $(leftPane).trigger('resize');
            $(rightPane).trigger('resize');
            $(splitterContainer).trigger('resize');
            $(window).trigger('resize');
            
            setTimeout(() => {
                $('[data-dw-resizable]').each(function() {
                    $(this).trigger('resize');
                });
            }, 100);
            
            if (typeof ko !== 'undefined') {
                ko.tasks.schedule(() => {
                    $(window).trigger('resize');
                });
            }
        }
        
        window.dispatchEvent(new Event('resize'));
        console.log('✅ Splitter verschoben');
        return true;
    }
    
    // Button-Event-Listener
    const buttons = container.querySelectorAll('button[data-position]');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const position = parseInt(this.getAttribute('data-position'));
            if (moveSplitter(position)) {
                // Active-State setzen
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Close-Button
    container.querySelector('.close-btn').addEventListener('click', function() {
        container.remove();
        document.getElementById(`${ID}-style`).remove();
        console.log('🗑️ Splitter-Buttons entfernt');
    });
    
    console.log('✅ Splitter-Buttons erstellt');
})();