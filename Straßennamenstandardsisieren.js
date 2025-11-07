(function () {
    // NEU: Straßenkatalog (beliebig erweiterbar)
    const STRASSEN_KATALOG = [
        'Adam-Klein-Str.',
        'Amalienstr. 38',
        'Ammonstr.',
        'Anne-Frank-Str. 43',
        'Arnulfstr. 4',
        'Äußere Großweidenmühlstr. 10',
        'Badstr. 52',
        'Bahnhofstr. 79',
        'Bogenstr. 42',
        'Emilienstr. 1',
        'Flugplatzstr. 80',
        'Frauentorgraben 3',
        'Friedrichstr. 9',
        'Fürther Str.',
        'Gibitzenhofstr. 61',
        'Grenzstr. 13',
        'Grünerstr. 2',
        'Hallstr. 6',
        'Hans-Vogel-Str. 20',
        'Hauptstr.',
        'Hertastr. 21',
        'Hirschenstr.',
        'Hornschuchpromenade 25',
        'Im Unteren Grund 1-1e',
        'Innerer Kleinreuther Weg 5-7',
        'Ipsheimer Str. 12',
        'Johann-Geismann-Str.',
        'Johannisstr. 108',
        'Katharinengasse 24',
        'Kirchenweg 43',
        'Kneippallee',
        'Königswarterstr. 20',
        'Krugstr. 27',
        'Kurgartenstr. 19',
        'Landgrabenstr. 14',
        'Lilienstr. 57',
        'Lorenzer Str.',
        'Mondstr. 8',
        'Nelkenstr.',
        'Neubleiche 8',
        'Neutormauer 2',
        'Obere Turnstr. 9',
        'Peterstr. 71',
        'Pfefferloh 3',
        'Prinzregentenufer 5',
        'Rankestr. 60',
        'Regensburger Str.',
        'Reitmorstr. 52',
        'Saalfelder Str.',
        'Sauerbruchstr. 10',
        'Schlotfegergasse 6',
        'Schumannstr. 13',
        'Schwabacher Str.',
        'Sigmund-Nathan-Str. 4+4a',
        'Sigmundstr. 139',
        'Spittlertorgraben 29',
        'Spitzwegstr. 27',
        'Sprottauer Str. 10',
        'Stephanstr.',
        'Thurn-und-Taxis-Str. 18',
        'Vacher Str. 471',
        'Volbehrstr.',
        'Willy-Brandt-Platz 10',
        'Wodanstr. 34',
        'Zollhof 8'
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

    // ÄNDERUNG: Straßenname ohne Hausnummer extrahieren
    function extrahiereStrassenname(text) {
        return text.replace(/\s+\d+.*$/, '').trim();
    }

    // NEU: Prüfen ob Katalogeintrag Hausnummer enthält
    function hatHausnummer(text) {
        return /\s+\d+/.test(text);
    }

    // ÄNDERUNG: Besten Match aus Katalog finden
    function findBestMatch(input, userHausnummer) {
        if (!input || input.length < 3) return null;

        let bestMatch = null;
        let bestDistance = Infinity;
        const threshold = Math.ceil(input.length * 0.3); // 30% Fehlertoleranz

        const inputOhneNr = extrahiereStrassenname(input);

        for (const strasse of STRASSEN_KATALOG) {
            const strasseOhneNr = extrahiereStrassenname(strasse);
            const distance = levenshteinDistance(inputOhneNr, strasseOhneNr);

            if (distance < bestDistance && distance <= threshold) {
                bestDistance = distance;
                bestMatch = strasse;
            }
        }

        // ÄNDERUNG: Wenn Match gefunden und keine Hausnummer im Katalog, User-Hausnummer anhängen
        if (bestMatch) {
            if (!hatHausnummer(bestMatch) && userHausnummer) {
                return `${bestMatch} ${userHausnummer}`;
            }
            return bestMatch; // Katalog-Eintrag komplett mit Hausnummer
        }

        return null;
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

    // ÄNDERUNG: Verarbeitung mit Hausnummer-Logik
    function verarbeiteEingabe(inputField) {
        let value = inputField.value;
        if (!value) return;

        // 1. Straßenname kürzen
        value = kuerzeStrassenname(value);

        // 2. Hausnummer vom User extrahieren
        const userHausnummer = extraiereHausnummer(value);

        // 3. Fuzzy-Matching gegen Katalog
        const bestMatch = findBestMatch(value, userHausnummer);

        if (bestMatch && bestMatch !== value) {
            value = bestMatch;
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





