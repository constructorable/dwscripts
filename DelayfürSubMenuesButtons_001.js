// ÄNDERUNG - Submenü öffnet nur, wenn Maus 1 Sekunde auf Button bleibt
(function($) {
    const DELAY = 100;
    let hoverTimer = null;
    let hoveredElement = null;
    
    // Originale _open Methode sichern
    const originalOpen = $.ui.menu.prototype._open;
    
    // _open Methode überschreiben
    $.ui.menu.prototype._open = function(submenu) {
        const self = this;
        const args = arguments;
        const menuItem = submenu.closest('li.ui-menu-item');
        
        // Timer zurücksetzen
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }
        
        hoveredElement = menuItem[0];
        
        // 1 Sekunde warten UND prüfen ob Maus noch drauf ist
        hoverTimer = setTimeout(function() {
            // Nur öffnen wenn Maus noch über Element ist
            if (hoveredElement === menuItem[0] && $(menuItem).is(':hover')) {
                originalOpen.apply(self, args);
            }
            hoverTimer = null;
        }, DELAY);
    };
    
    // Originale _close Methode
    const originalClose = $.ui.menu.prototype._close;
    
    $.ui.menu.prototype._close = function(startMenu) {
        // Timer abbrechen bei mouseleave
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        hoveredElement = null;
        
        originalClose.apply(this, arguments);
    };
    
})(jQuery);