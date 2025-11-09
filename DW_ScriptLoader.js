(function(){
    // ÄNDERUNG: Eindeutige Script-Definitionen mit klaren Namen
    const SCRIPTS = [
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/CopyPasteButton.js', name: 'Copy/Paste Buttons', category: 'UI' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/Schaltflaechen.js', name: 'Schaltflächen Erweiterung', category: 'UI' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/AutocompleteIBANuOEMN.js', name: 'IBAN Autocomplete', category: 'Autocomplete' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/Textareabigger.js', name: 'Textarea Vergrößerung', category: 'UI' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/sternsuche.js', name: 'Sternsuche', category: 'Suche' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/tabNamenk%C3%BCrzen.js', name: 'Tab-Namen Kürzen', category: 'UI' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/BK_Buttonablegen5.js', name: 'BK Button Ablegen', category: 'Workflow' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/Delayf%C3%BCrSubMenuesButtons_001.js', name: 'Submenü Delay', category: 'Performance' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/EmojieToSymbol.js', name: 'Emoji → Symbol', category: 'UI' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/zu%20Indexfeld%20springen_02.js', name: 'Indexfeld Navigation', category: 'Navigation' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/buttonbreiter.js', name: 'Button Verbreiterung', category: 'UI' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/supersuche.js', name: 'Supersuche', category: 'Suche' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/Seitenanzahl.js', name: 'Seitenanzahl Anzeige', category: 'Info' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/speicherbuttonduplizieren.js', name: 'Speicherbutton Duplizieren', category: 'Workflow' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/autovervollst%C3%A4ndigungdokart.js', name: 'Autocomplete Dokumentarten', category: 'Autocomplete' },
        { url: 'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/autocompletestrassennamen.js', name: 'Autocomplete Straßennamen', category: 'Autocomplete' }
    ];

    // ÄNDERUNG: Font Awesome laden
    function loadFontAwesome() {
        if(!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    // NEU: LocalStorage Manager
    const Storage = {
        getSettings() {
            try {
                return JSON.parse(localStorage.getItem('dwScriptSettings') || '{}');
            } catch(e) { 
                return {}; 
            }
        },
        
        saveSettings(settings) {
            try {
                localStorage.setItem('dwScriptSettings', JSON.stringify(settings));
            } catch(e) {
                console.error('Speichern fehlgeschlagen:', e);
            }
        },
        
        updateLoadedScript(scriptId, status) {
            const settings = this.getSettings();
            if(!settings.loadedScripts) settings.loadedScripts = {};
            settings.loadedScripts[scriptId] = status;
            this.saveSettings(settings);
        }
    };

    // NEU: Script Loader mit sequenziellem Laden
    const ScriptLoader = {
        async load(script, index, total) {
            const statusEl = document.getElementById(`status-${index}`);
            const iconEl = document.getElementById(`icon-${index}`);
            
            this.updateUI(statusEl, iconEl, 'loading');
            
            try {
                const response = await fetch(script.url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const code = await response.text();
                this.injectScript(code, script.id);
                
                Storage.updateLoadedScript(script.id, true);
                this.updateUI(statusEl, iconEl, 'success');
                this.updateProgress(index + 1, total);
                
                await new Promise(resolve => setTimeout(resolve, 100));
                return true;
                
            } catch (error) {
                this.updateUI(statusEl, iconEl, 'error');
                console.error(`Fehler beim Laden: ${script.name}`, error);
                await new Promise(resolve => setTimeout(resolve, 100));
                return false;
            }
        },
        
        injectScript(code, scriptId) {
            const existing = document.querySelector(`script[data-dw-script="${scriptId}"]`);
            if(existing) existing.remove();
            
            const script = document.createElement('script');
            script.textContent = code;
            script.setAttribute('data-dw-script', scriptId);
            document.head.appendChild(script);
        },
        
        updateUI(statusEl, iconEl, state) {
            const states = {
                loading: {
                    icon: 'fas fa-spinner fa-spin',
                    iconColor: '#475569',
                    text: 'Lade...',
                    bgColor: '#dbeafe',
                    textColor: '#3553a4'
                },
                success: {
                    icon: 'fas fa-check-circle',
                    iconColor: '#475569',
                    text: 'Geladen',
                    bgColor: '#dbeafe',
                    textColor: '#394e94'
                },
                error: {
                    icon: 'fas fa-exclamation-triangle',
                    iconColor: '#64748b',
                    text: 'Fehler',
                    bgColor: '#f3f4f6',
                    textColor: '#374151'
                }
            };
            
            const config = states[state];
            iconEl.className = config.icon;
            iconEl.style.color = config.iconColor;
            iconEl.style.animation = 'none';
            statusEl.textContent = config.text;
            statusEl.style.background = config.bgColor;
            statusEl.style.color = config.textColor;
        },
        
        updateProgress(loaded, total) {
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            
            progressBar.style.width = `${(loaded / total) * 100}%`;
            progressText.innerHTML = `${loaded} von ${total} Scripts geladen`;
        }
    };

    // NEU: Modal Manager mit Positionierung
    const ModalManager = {
        create(type) {
            const modal = document.createElement('div');
            modal.id = 'dwScriptModal';
            modal.innerHTML = type === 'selection' ? this.getSelectionHTML() : this.getManagementHTML();
            document.body.appendChild(modal);
            return modal;
        },
        
        // ÄNDERUNG: Modal in obere rechte Ecke verschieben
// ÄNDERUNG: Modal in obere rechte Ecke verschieben
// ÄNDERUNG: Modal in obere rechte Ecke verschieben
// ÄNDERUNG: Modal in obere rechte Ecke mit transparentem Hintergrund
moveToCorner() {
    const modal = document.getElementById('dwScriptModal');
    const overlay = modal.firstElementChild;
    const modalBox = overlay.firstElementChild;
    
    // ÄNDERUNG: Overlay transparent und durchklickbar für Arbeit im Hintergrund
    overlay.style.cssText = `
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:transparent;
        z-index:999999;
        display:flex;
        align-items:flex-start;
        justify-content:flex-end;
        font-family:system-ui,sans-serif;
        padding:15px;
        pointer-events:none;
    `;
    
    // ÄNDERUNG: Modal-Box interaktiv mit verstärktem Schatten
    modalBox.style.cssText = `
        ${modalBox.style.cssText}
        max-width:420px;
        max-height:85vh;
        transition:all 0.3s ease;
        pointer-events:auto;
        box-shadow:0 10px 40px -5px rgba(0,0,0,0.35), 0 4px 15px rgba(0,0,0,0.2);
    `;
},

        getSelectionHTML() {
            const settings = Storage.getSettings();
            const selectedScripts = settings.selectedScripts || SCRIPTS.reduce((acc, script) => {
                acc[script.id] = true;
                return acc;
            }, {});
            
            return `
                <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(71,85,105,0.75);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:15px;">
                    <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);max-width:580px;width:100%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
                        <div style="background:#475569;color:#f8fafc;padding:15px;border-bottom:1px solid #64748b;flex-shrink:0;">
                            <div style="display:flex;align-items:center;justify-content:center;gap:10px;">
                                <i class="fas fa-cogs" style="font-size:20px;color:#94a3b8;"></i>
                                <h2 style="margin:0;font-size:17px;font-weight:500;">DW Scripts Auswahl</h2>
                            </div>
                            <p style="margin:6px 0 0 0;opacity:0.9;font-size:13px;text-align:center;">Wählen Sie die zu ladenden Scripts</p>
                        </div>
                        <div style="padding:15px;background:white;overflow-y:auto;flex:1;">
                            <div id="scriptSelection" style="display:grid;gap:6px;margin-bottom:12px;">
                                ${this.getScriptCheckboxes(selectedScripts)}
                            </div>
                            <div style="display:flex;gap:6px;margin-bottom:12px;">
                                <button onclick="window.dwSelectAll()" style="flex:1;background:#64748b;color:#f8fafc;border:none;padding:7px;border-radius:4px;cursor:pointer;font-size:12px;">
                                    Alle auswählen
                                </button>
                                <button onclick="window.dwDeselectAll()" style="flex:1;background:#64748b;color:#f8fafc;border:none;padding:7px;border-radius:4px;cursor:pointer;font-size:12px;">
                                    Alle abwählen
                                </button>
                            </div>
                            <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin-bottom:12px;">
                                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                                    <i class="fas fa-chart-line" style="color:#475569;font-size:13px;"></i>
                                    <span style="color:#334155;font-size:13px;font-weight:500;">Ladefortschritt</span>
                                </div>
                                <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden;margin:6px 0;">
                                    <div id="progressBar" style="background:#475569;height:100%;width:0%;transition:width 0.5s ease;"></div>
                                </div>
                                <div id="progressText" style="color:#64748b;font-size:11px;text-align:center;">Bereit zum Laden</div>
                            </div>
                            <div id="scriptList" style="border:1px solid #e2e8f0;border-radius:6px;background:#ffffff;max-height:250px;overflow-y:auto;display:none;"></div>
                        </div>
                        <div style="background:#f1f5f9;padding:12px 15px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;flex-shrink:0;">
                            <button onclick="window.dwCloseModal()" style="background:#64748b;color:#f8fafc;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:13px;">
                                <i class="fas fa-times" style="margin-right:6px;"></i>Abbrechen
                            </button>
                            <button onclick="window.dwLoadScripts()" style="background:#475569;color:#f8fafc;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:13px;">
                                <i class="fas fa-play" style="margin-right:6px;"></i>Scripts laden
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },
        
        getScriptCheckboxes(selectedScripts) {
            return SCRIPTS.map(script => {
                const isChecked = selectedScripts[script.id];
                return `
                    <label style="display:flex;align-items:center;padding:8px 10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:5px;cursor:pointer;">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} data-scriptid="${script.id}" style="margin-right:10px;accent-color:#475569;">
                        <div style="flex:1;">
                            <div style="font-weight:500;color:#334155;font-size:13px;">${script.name}</div>
                            <div style="font-size:10px;color:#64748b;">${script.category}</div>
                        </div>
                    </label>
                `;
            }).join('');
        },
        
        getManagementHTML() {
            const settings = Storage.getSettings();
            const loadedScripts = settings.loadedScripts || {};
            
            return `
                <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(71,85,105,0.75);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:15px;">
                    <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);max-width:580px;width:100%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
                        <div style="background:#475569;color:#f8fafc;padding:15px;border-bottom:1px solid #64748b;flex-shrink:0;">
                            <div style="display:flex;align-items:center;justify-content:center;gap:10px;">
                                <i class="fas fa-tools" style="font-size:20px;color:#94a3b8;"></i>
                                <h2 style="margin:0;font-size:17px;font-weight:500;">Script Verwaltung</h2>
                            </div>
                            <p style="margin:6px 0 0 0;opacity:0.9;font-size:13px;text-align:center;">Geladene Scripts neu laden</p>
                        </div>
                        <div style="padding:15px;background:white;overflow-y:auto;flex:1;">
                            <div style="display:grid;gap:6px;">
                                ${this.getManagementItems(loadedScripts)}
                            </div>
                        </div>
                        <div style="background:#f1f5f9;padding:12px 15px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;flex-shrink:0;">
                            <button onclick="window.dwResetAll()" style="background:#64748b;color:#f8fafc;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:13px;">
                                <i class="fas fa-trash" style="margin-right:6px;"></i>Alle zurücksetzen
                            </button>
                            <button onclick="window.dwCloseModal()" style="background:#475569;color:#f8fafc;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:13px;">
                                <i class="fas fa-times" style="margin-right:6px;"></i>Schließen
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },
        
        getManagementItems(loadedScripts) {
            return SCRIPTS.map(script => {
                const loaded = loadedScripts[script.id];
                return `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:5px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <i class="fas ${loaded ? 'fa-check-circle' : 'fa-circle'}" style="color:${loaded ? '#475569' : '#94a3b8'};font-size:13px;"></i>
                            <div>
                                <div style="font-weight:500;color:#334155;font-size:13px;">${script.name}</div>
                                <div style="font-size:10px;color:#64748b;">${script.category}</div>
                            </div>
                        </div>
                        <button onclick="window.dwReloadScript('${script.id}', this)" style="background:#475569;color:#f8fafc;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:11px;white-space:nowrap;">
                            <i class="fas fa-redo" style="margin-right:3px;"></i>Neu laden
                        </button>
                    </div>
                `;
            }).join('');
        }
    };

    // NEU: Globale Funktionen für Event-Handler
    window.dwSelectAll = () => document.querySelectorAll('#scriptSelection input').forEach(cb => cb.checked = true);
    window.dwDeselectAll = () => document.querySelectorAll('#scriptSelection input').forEach(cb => cb.checked = false);
    window.dwCloseModal = () => document.getElementById('dwScriptModal')?.remove();
    
    window.dwLoadScripts = async function() {
        const checkboxes = document.querySelectorAll('#scriptSelection input[type="checkbox"]');
        const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.scriptid);

        if(selectedIds.length === 0) {
            alert('Bitte wählen Sie mindestens ein Script aus!');
            return;
        }

        // ÄNDERUNG: Auswahl speichern
        const settings = Storage.getSettings();
        settings.selectedScripts = {};
        checkboxes.forEach(cb => settings.selectedScripts[cb.dataset.scriptid] = cb.checked);
        settings.loadedScripts = {};
        Storage.saveSettings(settings);

        // ÄNDERUNG: Modal nach oben rechts verschieben
        ModalManager.moveToCorner();
        document.getElementById('scriptSelection').style.display = 'none';
        document.getElementById('scriptList').style.display = 'block';
        
        const scriptsToLoad = SCRIPTS.filter(s => selectedIds.includes(s.id));
        const scriptList = document.getElementById('scriptList');
        
        // Script-Liste vorbereiten
        scriptsToLoad.forEach((script, index) => {
            const item = document.createElement('div');
            item.id = `script-${index}`;
            item.innerHTML = `
                <div style="display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid #f1f5f9;">
                    <i id="icon-${index}" class="fas fa-hourglass-half" style="font-size:13px;color:#94a3b8;width:16px;text-align:center;margin-right:10px;"></i>
                    <div style="flex:1;">
                        <div style="font-weight:500;color:#334155;font-size:12px;">${script.name}</div>
                        <div style="font-size:10px;color:#64748b;">${script.category}</div>
                    </div>
                    <div id="status-${index}" style="font-size:10px;color:#64748b;font-weight:500;padding:3px 7px;background:#f1f5f9;border-radius:10px;">Warten...</div>
                </div>
            `;
            scriptList.appendChild(item);
        });

        // Sequenzielles Laden
        let successCount = 0;
        for(let i = 0; i < scriptsToLoad.length; i++) {
            const success = await ScriptLoader.load(scriptsToLoad[i], i, scriptsToLoad.length);
            if(success) successCount++;
        }

        // Abschluss
        window.dwScriptsLoaded = true;
        const progressText = document.getElementById('progressText');
        progressText.innerHTML = `<i class="fas fa-check-double" style="color:#475569;margin-right:8px;"></i>Fertig! (${successCount}/${scriptsToLoad.length})`;
        
        setTimeout(() => {
            const modal = document.getElementById('dwScriptModal');
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }, 1500);
    };
    
    window.dwReloadScript = async function(scriptId, button) {
        const script = SCRIPTS.find(s => s.id === scriptId);
        if(!script) return;
        
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Laden...';
        button.disabled = true;
        
        try {
            const response = await fetch(script.url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const code = await response.text();
            
            ScriptLoader.injectScript(code, script.id);
            Storage.updateLoadedScript(script.id, true);
            
            button.innerHTML = '<i class="fas fa-check"></i> Geladen!';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1000);
            
        } catch (error) {
            button.innerHTML = '<i class="fas fa-times"></i> Fehler!';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1500);
            console.error(`Fehler beim Neuladen:`, error);
        }
    };
    
    window.dwResetAll = function() {
        if(confirm('Möchten Sie wirklich alle Scripts zurücksetzen?')) {
            document.querySelectorAll('script[data-dw-script]').forEach(s => s.remove());
            localStorage.removeItem('dwScriptSettings');
            window.dwScriptsLoaded = false;
            window.dwCloseModal();
        }
    };

    // NEU: Script-IDs aus URLs generieren
    SCRIPTS.forEach(script => {
        const fileName = script.url.split('/').pop()
            .replace(/%C3%A4/g,'ä')
            .replace(/%C3%BC/g,'ü')
            .replace(/%C3%9F/g,'ß')
            .replace('.js','');
        script.id = fileName;
    });

    // Initialisierung
    loadFontAwesome();
    
    if(window.dwScriptsLoaded) {
        ModalManager.create('management');
    } else {
        ModalManager.create('selection');
    }
})();

