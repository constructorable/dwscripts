(function () {
    // NEU: Straßenkatalog (beliebig erweiterbar)
    const STRASSEN_KATALOG = [
        'Adam-Klein-Str.',
        'Amalienstr.',
        'Ammonstr.',
        'Anne-Frank-Str.',
        'Arnulfstr.',
        'Äußere Großweidenmühlstr.',
        'Badstr.',
        'Bahnhofstr.',
        'Bogenstr.',
        'Emilienstr.',
        'Flugplatzstr.',
        'Frauentorgraben',
        'Friedrichstr.',
        'Fürther Str.',
        'Gibitzenhofstr.',
        'Grenzstr.',
        'Grünerstr.',
        'Hallstr.',
        'Hans-Vogel-Str.',
        'Hauptstr.',
        'Hertastr.',
        'Hirschenstr.',
        'Hornschuchpromenade',
        'Im Unteren Grund',
        'Innerer Kleinreuther Weg',
        'Ipsheimer Str.',
        'Johann-Geismann-Str.',
        'Johannisstr.',
        'Katharinengasse',
        'Kirchenweg',
        'Kneippallee',
        'Königswarterstr.',
        'Krugstr.',
        'Kurgartenstr.',
        'Landgrabenstr.',
        'Lilienstr.',
        'Lorenzer Str.',
        'Mondstr.',
        'Nelkenstr.',
        'Neubleiche',
        'Neutormauer',
        'Obere Turnstr.',
        'Peterstr.',
        'Pfefferloh',
        'Prinzregentenufer',
        'Rankestr.',
        'Regensburger Str.',
        'Reitmorstr.',
        'Saalfelder Str.',
        'Sauerbruchstr.',
        'Schlotfegergasse',
        'Schumannstr.',
        'Schwabacher Str.',
        'Sigmund-Nathan-Str.',
        'Sigmundstr.',
        'Sonstige',
        'Spittlertorgraben ',
        'Spitzwegstr.',
        'Sprottauer Str.',
        'Stephanstr.',
        'Thurn-und-Taxis-Str.',
        'Vacher Str.',
        'Volbehrstr.',
        'Volkacher Str.',
        'Willy-Brandt-Platz',
        'Wodanstr.',
        'Zollhof'

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
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
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

    function feldIstObjekt(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        return /^objekt\b/i.test(label.textContent.trim());
    }

    function kuerzeStrassenname(text) {
        if (!text || typeof text !== 'string') return text;
        let result = text.trim();

        result = result.replace(/\sstraße\b/gi, ' Str.');
        result = result.replace(/\sstrasse\b/gi, ' Str.');
        result = result.replace(/-straße\b/gi, '-Str.');
        result = result.replace(/-strasse\b/gi, '-Str.');
        result = result.replace(/straße\b/gi, 'str.');
        result = result.replace(/strasse\b/gi, 'str.');

        return result;
    }

    // ÄNDERUNG: Direkte Korrektur ohne Popup
    function verarbeiteEingabe(inputField) {
        let value = inputField.value;
        if (!value) return;

        // 1. Straßenname kürzen
        value = kuerzeStrassenname(value);

        // 2. Fuzzy-Matching gegen Katalog
        const hausnummer = extraiereHausnummer(value);
        const strasseOhneNr = value.replace(/\s+\d+.*$/, '').trim();
        const bestMatch = findBestMatch(strasseOhneNr);

        if (bestMatch && bestMatch !== strasseOhneNr) {
            // ÄNDERUNG: Direkt korrigieren
            value = hausnummer ? `${bestMatch} ${hausnummer}` : bestMatch;
        }

        // Wert setzen wenn geändert
        if (value !== inputField.value) {
            inputField.value = value;
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function attachHandler(inputField) {
        if (inputField.dataset.strassenAbkuerzungAttached) return;
        if (!feldIstObjekt(inputField)) return;

        inputField.addEventListener('blur', function () {
            verarbeiteEingabe(this);
        });

        inputField.dataset.strassenAbkuerzungAttached = 'true';
    }

    function scan() {
        document.querySelectorAll('input.dw-textField').forEach(attachHandler);
    }

    const obs = new MutationObserver(scan);
    obs.observe(document.body, { subtree: true, childList: true });
    scan();
})();



