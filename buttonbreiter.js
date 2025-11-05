// Variante 1 - Über data-trackerevent
document.querySelector('[data-trackerevent="Nav_NextPage"]').style.width = '20px';

// Variante 2 - Mit Mindestbreite
document.querySelector('[data-trackerevent="Nav_NextPage"]').style.minWidth = '20px';

// Variante 3 - Als CSS-Regel
const style = document.createElement('style');
style.textContent = '.dw-top-bar-btn.icon-auto { min-width: 20px !important; width: 20px !important; }';
document.head.appendChild(style);

// Variante 4 - Mehrere Properties
const btn = document.querySelector('[data-trackerevent="Nav_NextPage"]');
Object.assign(btn.style, {
    width: '20px',
    minWidth: '20px'
});