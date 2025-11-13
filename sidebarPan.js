// TEMPORÄRER CODE: Splitter-Buttons integriert in Splitter-Bar (900px, 1200px, 1400px)
// Erstellt drei Buttons direkt in der Splitter-Bar zur schnellen Positionierung

(function() {
    const ID = 'dw-splitter-buttons';
    
    // Cleanup vorheriger Instanz
    const existingButtons = document.getElementById(ID);
    if (existingButtons) {
        existingButtons.remove();
    }
    const existingStyle = document.getElementById(`${ID}-style`);
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // CSS injizieren
    const style = document.createElement('style');
    style.id = `${ID}-style`;
    style.textContent = `
        #${ID} {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 10;
            pointer-events: auto;
        }
        #${ID} button {
            padding: 1px 2px;
            border: 1px solid #2e4975ff;
            background: #fff;
            color: #31476bff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s;
            min-width: 70px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            white-space: nowrap;
        }
        #${ID} button:hover {
            background: #eff6ff;
            transform: scale(1.05);
            box-shadow: 0 3px 8px rgba(59, 130, 246, 0.3);
        }
        #${ID} button.active {
            background: #36588fff;
            color: #fff;
            box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
            border-color: #2a437aff;
        }
        .splitter-bar.splitter-bar-vertical {
            position: relative;
        }
    `;
    document.head.appendChild(style);
    
    // Finde die Splitter-Bar
    const splitterBar = document.querySelector('.splitter-bar.splitter-bar-vertical');
    
    if (!splitterBar) {
        console.log('❌ Splitter-Bar nicht gefunden');
        return;
    }
    
    // Button-Container erstellen
    const container = document.createElement('div');
    container.id = ID;
    container.innerHTML = `
        <button data-position="900" title="Linke Seite: 900px">.</button>
        <button data-position="1200" title="Linke Seite: 1200px">.</button>
        <button data-position="1400" title="Linke Seite: 1400px">.</button>
    `;
    splitterBar.appendChild(container);
    
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
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const position = parseInt(this.getAttribute('data-position'));
            if (moveSplitter(position)) {
                // Active-State setzen
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    console.log('✅ Splitter-Buttons in Splitter-Bar integriert (900px, 1200px, 1400px)');
})();

