(function() {

    // ÄNDERUNG nur Felder wo Label mit "Objekt" beginnt
    function feldIstObjekt(inputField) {
        const tr = inputField.closest('tr');
        if (!tr) return false;
        const label = tr.querySelector('.dw-fieldLabel span');
        if (!label) return false;
        return /^objekt\b/i.test(label.textContent.trim());
    }

    // bestehende Kürzung
// ÄNDERUNG Groß S erzwingen
function kuerzeStrassenname(text) {
    if (!text || typeof text !== 'string') return text;
    let result = text.trim();

    // Bindestrich Variante
    result = result.replace(/-straße\b/gi, '-Str.');
    result = result.replace(/-strasse\b/gi, '-Str.');

    // Leerzeichen Variante
    result = result.replace(/\sstraße\b/gi, ' Str.');
    result = result.replace(/\sstrasse\b/gi, ' Str.');

    // Standard Variante
    result = result.replace(/straße\b/gi, 'Str.');
    result = result.replace(/strasse\b/gi, 'Str.');

    return result;
}


    function attachHandler(inputField) {
        if (inputField.dataset.strassenAbkuerzungAttached) return;
        if (!feldIstObjekt(inputField)) return;

        inputField.addEventListener('blur', function() {
            const newVal = kuerzeStrassenname(this.value);
            if (this.value !== newVal) {
                this.value = newVal;
                this.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        inputField.dataset.strassenAbkuerzungAttached = 'true';
    }

    function scan() {
        document.querySelectorAll('input.dw-textField').forEach(attachHandler);
    }

    // NEU hält bei Knockout rebuilds
    const obs = new MutationObserver(scan);
    obs.observe(document.body, { subtree:true, childList:true });

    scan();
})();
