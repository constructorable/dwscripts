(function() {
    // Erweiterte Funktion zum Button duplizieren
    function duplicateButton() {
        // Original Button finden
        var originalButton = document.querySelector('button[data-trackerevent="store"]');
        if (!originalButton) {
            console.log('Original Button nicht gefunden');
            return false;
        }

        // Prüfen ob bereits dupliziert
        if (document.querySelector('#duplicated-btn')) {
            console.log('Button bereits vorhanden');
            return true;
        }

        // Ziel-Element finden (Status_Posteingang ODER Bemerkungen)
        var allRows = document.querySelectorAll('tr');
        var targetRow = null;
        var foundFieldType = '';
        
        for (var i = 0; i < allRows.length; i++) {
            var span = allRows[i].querySelector('.dw-fieldLabel span');
            if (span) {
                var text = span.textContent.trim();
                if (text.indexOf('Status_Posteingang') !== -1) {
                    targetRow = allRows[i];
                    foundFieldType = 'Status_Posteingang';
                    break;
                } else if (text.indexOf('Bemerkungen') !== -1) {
                    targetRow = allRows[i];
                    foundFieldType = 'Bemerkungen';
                    break;
                }
            }
        }
        
        if (!targetRow) {
            console.log('Weder Status_Posteingang noch Bemerkungen gefunden');
            return false;
        }
        
        console.log('Feld gefunden:', foundFieldType);
        
        // Button klonen
        var clonedButton = originalButton.cloneNode(true);
        clonedButton.id = 'duplicated-btn';
        clonedButton.onclick = function() { 
            originalButton.click(); 
        };
        
        // Button um 111px nach rechts verschieben
        clonedButton.style.marginLeft = '169px';
        
        // Container erstellen mit linksbündiger Ausrichtung
        var newRow = document.createElement('tr');
        var labelText = foundFieldType === 'Status_Posteingang' ? '.' : '.';
        
        newRow.innerHTML = '<td colspan="2" style="text-align:left;padding:10px;background:#f5f5f5;border-top:1px solid #ddd;">' +
                          '<small style="color:#666;margin-right:10px;">' + labelText + ':</small>' +
                          '</td>';
        newRow.querySelector('td').appendChild(clonedButton);
        
        // Einfügen
        targetRow.parentNode.insertBefore(newRow, targetRow.nextSibling);
        
        console.log('Button erfolgreich dupliziert unter:', foundFieldType);
        return true;
    }

    // Einfache Überwachung
    function startWatching() {
        // Sofort versuchen
        duplicateButton();
        
        // Dann alle 2 Sekunden prüfen
        setInterval(function() {
            duplicateButton();
        }, 2000);
    }

    // Starten wenn Seite geladen
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startWatching);
    } else {
        startWatching();
    }
})();