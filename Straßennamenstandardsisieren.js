(function() {
    // NEU: Straßenkatalog (beliebig erweiterbar)
    const STRASSEN_KATALOG = [
        'Adam-Klein-Str.',
        'Amalienstr.',
        'Ammonstr.',
        'Anne-Frank-Str.',
        'Arnulfstr.',
        'Äußere Großweidenmühlstr.'
    ];

    // NEU: Levenshtein-Distanz für Fuzzy Matching
    function levenshteinDistance(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase() ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // Löschung
                    matrix[i][j - 1] + 1,      // Einfügung
                    matrix[i - 1][j - 1] + cost // Ersetzung
                );
            }
        }

        return matrix[len1][len2];
    }

    // NEU: Besten Match aus Katalog finden
    function findBestMatch(input) {
        if (!input || input.length < 3) return null;

        let bestMatch = null;
        let bestDistance = Infinity;
        const threshold = Math.ceil(input.length * 0.3); // 30% Fehlertoleranz

        for (const strasse of STRASSEN_KATALOG) {
            const distance = levenshteinDistance(input, strasse);
            
            // Auch ohne Hausnummer vergleichen
            const inputOhneNr = input.replace(/\s+\d+.*$/, '').trim();
            const distanceOhneNr = levenshteinDistance(inputOhneNr, strasse);
            
            const minDistance = Math.min(distance, distanceOhneNr);
            
            if (minDistance < bestDistance && minDistance <= threshold) {
                bestDistance = minDistance;
                bestMatch = strasse;
            }
        }

        return bestMatch;
    }

    // NEU: Hausnummer extrahieren
    function extraiereHausnummer(text) {
        const match = text.match(/\s+(\d+.*?)$/);
        return match ? match[1] : '';
    }

    // NEU: Korrektur-Popup anzeigen
    function zeigeKorrekturPopup(inputField, original, korrektur) {
        const popup = document.createElement('div');
        popup.innerHTML = `
            <div style="margin-bottom: 8px;">
                <strong>Korrektur vorgeschlagen:</strong>
            </div>
            <div style="margin-bottom: 5px;">
                Alt: <span style="color: #d32f2f;">${original}</span>
            </div>
            <div style="margin-bottom: 10px;">
                Neu: <span style="color: #388e3c;">${korrektur}</span>
            </div>
            <button class="akzeptieren" style="background: #4b7199; color: white; border: none; padding: 5px 12px; border-radius: 3px; cursor: pointer; margin-right: 5px;">Akzeptieren</button>
            <button class="ablehnen" style="background: #888; color: white; border: none; padding: 5px 12px; border-radius: 3px; cursor: pointer;">Ablehnen</button>
        `;
        
        popup.style.position = 'fixed';
        popup.style.left = `${inputField.getBoundingClientRect().left}px`;
        popup.style.top = `${inputField.getBoundingClientRect().bottom + window.scrollY + 5}px`;
        popup.style.backgroundColor = '#fff';
        popup.style.border = '2px solid #4b7199';
        popup.style.padding = '15px';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        popup.style.zIndex = '999999';
        popup.style.fontFamily = 'Arial, sans-serif';
        popup.style.fontSize = '13px';
        popup.style.minWidth = '300px';

        document.body.appendChild(popup);

        const btnAkzeptieren = popup.querySelector('.akzeptieren');
        const btnAblehnen = popup.querySelector('.ablehnen');

        btnAkzeptieren.addEventListener('click', () => {
            inputField.value = korrektur;
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            document.body.removeChild(popup);
        });

        btnAblehnen.addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        // Auto-close nach 10 Sekunden
        setTimeout(() => {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        }, 10000);
    }

    // ÄNDERUNG: Prüft ob Feld "Objekt" ist
    function feldIstObjekt(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        return /^objekt\b/i.test(label.textContent.trim());
    }

    // ÄNDERUNG: Intelligente Groß-/Kleinschreibung
    function kuerzeStrassenname(text) {
        if (!text || typeof text !== 'string') return text;
        let result = text.trim();
        
        // 1. Leerzeichen-Variante: " straße" → " Str." (eigenständiges Wort = Großes S)
        result = result.replace(/\sstraße\b/gi, ' Str.');
        result = result.replace(/\sstrasse\b/gi, ' Str.');
        
        // 2. Bindestrich-Variante: "-straße" → "-Str." (eigenständiges Wort = Großes S)
        result = result.replace(/-straße\b/gi, '-Str.');
        result = result.replace(/-strasse\b/gi, '-Str.');
        
        // 3. Direkt angehängt (ohne Leerzeichen/Bindestrich): "straße" → "str." (Kleines s)
        result = result.replace(/straße\b/gi, 'str.');
        result = result.replace(/strasse\b/gi, 'str.');
        
        return result;
    }

    // ÄNDERUNG: Hauptverarbeitungs-Funktion mit Fuzzy-Matching
    function verarbeiteEingabe(inputField) {
        let value = inputField.value;
        if (!value) return;

        // 1. Straßenname kürzen
        value = kuerzeStrassenname(value);

        // 2. NEU: Fuzzy-Matching gegen Katalog
        const hausnummer = extraiereHausnummer(value);
        const strasseOhneNr = value.replace(/\s+\d+.*$/, '').trim();
        const bestMatch = findBestMatch(strasseOhneNr);

        if (bestMatch && bestMatch !== strasseOhneNr) {
            const korrektur = hausnummer ? `${bestMatch} ${hausnummer}` : bestMatch;
            zeigeKorrekturPopup(inputField, value, korrektur);
        } else if (value !== inputField.value) {
            // Nur Kürzung ohne Fuzzy-Match
            inputField.value = value;
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // Event-Handler attachieren
    function attachHandler(inputField) {
        if (inputField.dataset.strassenAbkuerzungAttached) return;
        if (!feldIstObjekt(inputField)) return;

        inputField.addEventListener('blur', function() {
            verarbeiteEingabe(this);
        });

        inputField.dataset.strassenAbkuerzungAttached = 'true';
    }

    // DOM scannen
    function scan() {
        document.querySelectorAll('input.dw-textField').forEach(attachHandler);
    }

    // MutationObserver für dynamische Änderungen
    const obs = new MutationObserver(scan);
    obs.observe(document.body, { subtree: true, childList: true });
    scan();
})();
