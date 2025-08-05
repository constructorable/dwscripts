function formatInputOnBlur(inputElement) {
    let text = inputElement.value.trim();
    if (text && !text.includes("*") && !text.includes("AND")) {
        text = text.replace(/\s+/g, " ");
        const words = text.split(" ").filter(word => word.length > 0);
        const formattedText = words.map(word => `*${word}*`).join(" AND ");
        inputElement.value = formattedText;
        inputElement.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    }
}

function triggerSearchButton() {
    const searchButton = document.querySelector('.rightToolbarButtons button[role="button"] .ui-button-text');
    if (searchButton && searchButton.textContent.trim() === 'Suche') {
        const buttonElement = searchButton.closest('button');
        if (buttonElement) {
            buttonElement.click();
        }
    }
}

function handleSearchFieldEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        // Erst maskieren, dann suchen
        formatInputOnBlur(event.target);
        triggerSearchButton();
    }
}

function isSearchField(inputElement) {
    const tableRow = inputElement.closest('tr');
    if (!tableRow) return false;
    
    const labelElement = tableRow.querySelector('.dw-fieldLabel span');
    if (!labelElement) return false;
    
    const labelText = labelElement.textContent || labelElement.innerText || '';
    return labelText.toLowerCase().includes('suche');
}

function attachSearchFieldListeners(inputElement) {
    if (isSearchField(inputElement)) {
        inputElement.addEventListener("blur", () => formatInputOnBlur(inputElement));
        inputElement.addEventListener("keydown", handleSearchFieldEnter);
    }
}

const searchFieldObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                const inputs = node.querySelectorAll(".dw-textField");
                inputs.forEach((input) => {
                    attachSearchFieldListeners(input);
                });
            }
        });
    });
});

// Initialisierung für bereits vorhandene Elemente
document.querySelectorAll(".dw-textField").forEach((input) => {
    attachSearchFieldListeners(input);
});

// Observer starten
searchFieldObserver.observe(document.body, { childList: true, subtree: true });

console.log("Suchfeld-Funktionen aktiv: Formatierung und Enter-Suche für Felder mit 'Suche' im Label.");