(function(){
    const scripts = [
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/CopyPasteButton.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/Schaltflaechen.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/AutocompleteIBANuOEMN.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/Button_Best%C3%A4tigen_001.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/Textareabigger.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/sternsuche.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/tabNamenk%C3%BCrzen.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/BK_Buttonablegen5.js',
        // NEU - Drei neue Scripts hinzugefügt
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/Delayf%C3%BCrSubMenuesButtons_001.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/EmojieToSymbol.js',
        'https://raw.githubusercontent.com/constructorable/dwscripts/refs/heads/main/zu%20Indexfeld%20springen_02.js'
    ];

    const specialDelayScripts = {
        'BK_Buttonablegen5': 1000
    };

    const scriptNames = {
        'CopyPasteButton': '1_Copy Paste Buttons',
        'Schaltflächen': '2_Schaltflächen',
        'AutocompleteIBANuOEMN': '3_Autocomplete IBAN',
        'Button_Bestätigen_001': '4_Button Bestätigen',
        'Textareabigger': '5_Textarea vergrößern',
        'sternsuche': '6_Sternsuche',
        'tabNamenkürzen': '7_Tab-Namen kürzen',
        // NEU - Anzeigenamen für neue Scripts
        'DelayfürSubMenuesButtons_001': '8_Delay für Submenüs',
        'EmojieToSymbol': '9_Emojie zu Symbol',
        'zu Indexfeld springen_02': '10_Zu Indexfeld springen'
    };

    // Font Awesome laden falls nicht vorhanden
    if(!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }

    // LocalStorage Funktionen
    function getSettings() {
        try {
            return JSON.parse(localStorage.getItem('dwScriptSettings') || '{}');
        } catch(e) { return {}; }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem('dwScriptSettings', JSON.stringify(settings));
        } catch(e) {}
    }

    // Sequenzielles Script-Laden mit Delay
    async function loadScriptSequentially(url, fileName, index, total) {
        const statusEl = document.getElementById(`status-${index}`);
        const iconEl = document.getElementById(`icon-${index}`);
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        statusEl.textContent = 'Lade...';
        statusEl.style.background = '#dbeafe';
        statusEl.style.color = '#1d4ed8';
        
        try {
            console.log(`🔄 Lade Script ${index + 1}/${total}: ${fileName}`);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const code = await response.text();
            
            // Altes Script entfernen falls vorhanden
            const existingScript = document.querySelector(`script[data-dw-script="${fileName}"]`);
            if(existingScript) existingScript.remove();
            
            const script = document.createElement('script');
            script.textContent = code;
            script.setAttribute('data-dw-script', fileName);
            document.head.appendChild(script);
            
            // Visuelles Feedback
            iconEl.className = 'fas fa-check-circle';
            iconEl.style.color = '#475569';
            iconEl.style.animation = 'none';
            document.getElementById(`script-${index}`).style.background = '#f0f9ff';
            statusEl.textContent = 'Geladen';
            statusEl.style.background = '#dbeafe';
            statusEl.style.color = '#1e40af';
            
            // In LocalStorage als geladen markieren
            const settings = getSettings();
            if(!settings.loadedScripts) settings.loadedScripts = {};
            settings.loadedScripts[fileName] = true;
            saveSettings(settings);
            
            // Progress aktualisieren
            const loaded = index + 1;
            progressBar.style.width = `${(loaded / total) * 100}%`;
            progressText.innerHTML = `${loaded} von ${total} Scripts geladen`;
            console.log(`✅ Script ${loaded}/${total} erfolgreich geladen: ${fileName}`);
            
            // 100ms Pause vor dem nächsten Script
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return true;
            
        } catch (error) {
            iconEl.className = 'fas fa-exclamation-triangle';
            iconEl.style.color = '#64748b';
            iconEl.style.animation = 'none';
            document.getElementById(`script-${index}`).style.background = '#f9fafb';
            statusEl.textContent = 'Fehler';
            statusEl.style.background = '#f3f4f6';
            statusEl.style.color = '#374151';
            console.error(`❌ Fehler beim Laden von ${fileName}:`, error);
            
            // Auch bei Fehler 100ms warten
            await new Promise(resolve => setTimeout(resolve, 100));
            return false;
        }
    }

    // Prüfen ob Scripts bereits geladen wurden
    if(window.dwScriptsLoaded) {
        // Management Modal anzeigen
        const settings = getSettings();
        const loadedScripts = settings.loadedScripts || {};
        
        const modal = document.createElement('div');
        modal.id = 'dwScriptModal';
        modal.innerHTML = `
            <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(71,85,105,0.75);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;">
                <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);max-width:580px;width:90%;overflow:hidden;">
                    <div style="background:#475569;color:#f8fafc;padding:20px;border-bottom:1px solid #64748b;">
                        <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
                            <i class="fas fa-tools" style="font-size:22px;color:#94a3b8;"></i>
                            <h2 style="margin:0;font-size:18px;font-weight:500;">Script Verwaltung</h2>
                        </div>
                        <p style="margin:8px 0 0 0;opacity:0.9;font-size:14px;text-align:center;">Geladene Scripts neu laden</p>
                    </div>
                    <div style="padding:20px;background:white;">
                        <div style="display:grid;gap:8px;">
                            ${scripts.map((url, index) => {
                                const fileName = url.split('/').pop().replace(/%C3%A4/g,'ä').replace(/%C3%BC/g,'ü').replace('.js','');
                                const displayName = scriptNames[fileName] || fileName;
                                const loaded = loadedScripts[fileName];
                                return `
                                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;">
                                        <div style="display:flex;align-items:center;gap:12px;">
                                            <i class="fas ${loaded ? 'fa-check-circle' : 'fa-circle'}" style="color:${loaded ? '#475569' : '#94a3b8'};font-size:14px;"></i>
                                            <div>
                                                <div style="font-weight:500;color:#334155;font-size:14px;">${displayName}</div>
                                                <div style="font-size:12px;color:#64748b;">${fileName}.js</div>
                                            </div>
                                        </div>
                                        <button onclick="reloadSingleScript('${url}', '${fileName}', this)" style="background:#475569;color:#f8fafc;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;">
                                            <i class="fas fa-redo" style="margin-right:4px;"></i>Neu laden
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div style="background:#f1f5f9;padding:15px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;">
                        <button onclick="resetAllScripts()" style="background:#64748b;color:#f8fafc;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px;">
                            <i class="fas fa-trash" style="margin-right:8px;"></i>Alle zurücksetzen
                        </button>
                        <button onclick="document.getElementById('dwScriptModal').remove();" style="background:#475569;color:#f8fafc;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px;">
                            <i class="fas fa-times" style="margin-right:8px;"></i>Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Globale Funktionen für Management
        window.reloadSingleScript = async function(url, fileName, button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Laden...';
            button.disabled = true;
            
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const code = await response.text();
                
                // Entferne altes Script
                const existingScript = document.querySelector(`script[data-dw-script="${fileName}"]`);
                if(existingScript) existingScript.remove();
                
                const script = document.createElement('script');
                script.textContent = code;
                script.setAttribute('data-dw-script', fileName);
                document.head.appendChild(script);
                
                // Status aktualisieren
                const settings = getSettings();
                if(!settings.loadedScripts) settings.loadedScripts = {};
                settings.loadedScripts[fileName] = true;
                saveSettings(settings);
                
                button.innerHTML = '<i class="fas fa-check"></i> Geladen!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 1000);
                
                console.log(`✅ Script neu geladen: ${fileName}`);
            } catch (error) {
                button.innerHTML = '<i class="fas fa-times"></i> Fehler!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 100);
                console.error(`❌ Fehler beim Neuladen: ${fileName}`, error);
            }
        };

        window.resetAllScripts = function() {
            if(confirm('Möchten Sie wirklich alle Scripts zurücksetzen?')) {
                document.querySelectorAll('script[data-dw-script]').forEach(script => script.remove());
                localStorage.removeItem('dwScriptSettings');
                window.dwScriptsLoaded = false;
                document.getElementById('dwScriptModal').remove();
                console.log('🗑️ Alle Scripts zurückgesetzt');
            }
        };

        return console.log('DW Scripts Management Modal geöffnet');
    }

    // Erstes Laden - Auswahl Modal
    const settings = getSettings();
    const selectedScripts = settings.selectedScripts || scripts.reduce((acc, script) => {
        const fileName = script.split('/').pop().replace(/%C3%A4/g,'ä').replace(/%C3%BC/g,'ü').replace('.js','');
        acc[fileName] = true;
        return acc;
    }, {});

    const modal = document.createElement('div');
    modal.id = 'dwScriptModal';
    modal.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(71,85,105,0.75);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;">
            <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);max-width:580px;width:90%;text-align:center;overflow:hidden;">
                <div style="background:#475569;color:#f8fafc;padding:20px;border-bottom:1px solid #64748b;">
                    <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
                        <i class="fas fa-cogs" style="font-size:22px;color:#94a3b8;"></i>
                        <h2 style="margin:0;font-size:18px;font-weight:500;">DW Scripts Auswahl</h2>
                    </div>
                    <p style="margin:8px 0 0 0;opacity:0.9;font-size:14px;">Wählen Sie die zu ladenden Scripts</p>
                </div>
                <div style="padding:20px;background:white;">
                    <div id="scriptSelection" style="display:grid;gap:8px;margin-bottom:15px;">
                        ${scripts.map((url, index) => {
                            const fileName = url.split('/').pop().replace(/%C3%A4/g,'ä').replace(/%C3%BC/g,'ü').replace('.js','');
                            const displayName = scriptNames[fileName] || fileName;
                            const isChecked = selectedScripts[fileName];
                            return `
                                <label style="display:flex;align-items:center;padding:10px 12px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;">
                                    <input type="checkbox" ${isChecked ? 'checked' : ''} data-filename="${fileName}" style="margin-right:12px;accent-color:#475569;">
                                    <div style="text-align:left;">
                                        <div style="font-weight:500;color:#334155;font-size:14px;">${displayName}</div>
                                        <div style="font-size:12px;color:#64748b;">${fileName}.js</div>
                                    </div>
                                </label>
                            `;
                        }).join('')}
                    </div>
                    <div style="display:flex;gap:8px;margin-bottom:15px;">
                        <button onclick="document.querySelectorAll('#scriptSelection input').forEach(cb => cb.checked = true)" style="flex:1;background:#64748b;color:#f8fafc;border:none;padding:8px;border-radius:4px;cursor:pointer;font-size:13px;">
                            Alle auswählen
                        </button>
                        <button onclick="document.querySelectorAll('#scriptSelection input').forEach(cb => cb.checked = false)" style="flex:1;background:#64748b;color:#f8fafc;border:none;padding:8px;border-radius:4px;cursor:pointer;font-size:13px;">
                            Alle abwählen
                        </button>
                    </div>
                    <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:15px;margin-bottom:15px;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                            <i class="fas fa-chart-line" style="color:#475569;font-size:14px;"></i>
                            <span style="color:#334155;font-size:14px;font-weight:500;">Ladefortschritt</span>
                        </div>
                        <div style="background:#e2e8f0;height:8px;border-radius:4px;overflow:hidden;margin:8px 0;">
                            <div id="progressBar" style="background:#475569;height:100%;width:0%;transition:width 0.5s ease;"></div>
                        </div>
                        <div id="progressText" style="color:#64748b;font-size:12px;text-align:center;">Bereit zum Laden</div>
                    </div>
                    <div id="scriptList" style="text-align:left;border:1px solid #e2e8f0;border-radius:6px;background:#ffffff;max-height:250px;overflow-y:auto;display:none;"></div>
                </div>
                <div style="background:#f1f5f9;padding:15px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;">
                    <button onclick="document.getElementById('dwScriptModal').remove();" style="background:#64748b;color:#f8fafc;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px;">
                        <i class="fas fa-times" style="margin-right:8px;"></i>Abbrechen
                    </button>
                    <button onclick="loadSelectedScripts()" style="background:#475569;color:#f8fafc;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px;">
                        <i class="fas fa-play" style="margin-right:8px;"></i>Scripts laden
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const scriptList = document.getElementById('scriptList');

    window.loadSelectedScripts = async function() {
        const checkboxes = document.querySelectorAll('#scriptSelection input[type="checkbox"]');
        const selectedScripts = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.filename);

        if(selectedScripts.length === 0) {
            alert('Bitte wählen Sie mindestens ein Script aus!');
            return;
        }

        // Einstellungen speichern
        const settings = getSettings();
        settings.selectedScripts = {};
        checkboxes.forEach(cb => {
            settings.selectedScripts[cb.dataset.filename] = cb.checked;
        });
        settings.loadedScripts = {};
        saveSettings(settings);

        // Loading UI anzeigen
        document.getElementById('scriptSelection').style.display = 'none';
        scriptList.style.display = 'block';
        
        const scriptsToLoad = scripts.filter(url => {
            const fileName = url.split('/').pop().replace(/%C3%A4/g,'ä').replace(/%C3%BC/g,'ü').replace('.js','');
            return selectedScripts.includes(fileName);
        });

        console.log(`🚀 Starte sequenzielles Laden von ${scriptsToLoad.length} Scripts...`);

        // Script-Liste erstellen
        scriptsToLoad.forEach((url, index) => {
            const fileName = url.split('/').pop().replace(/%C3%A4/g,'ä').replace(/%C3%BC/g,'ü').replace('.js','');
            const displayName = scriptNames[fileName] || fileName;
            const item = document.createElement('div');
            item.id = `script-${index}`;
            item.innerHTML = `
                <div style="display:flex;align-items:center;padding:12px 15px;border-bottom:1px solid #f1f5f9;">
                    <i id="icon-${index}" class="fas fa-hourglass-half" style="font-size:14px;color:#94a3b8;width:18px;text-align:center;margin-right:12px;"></i>
                    <div style="flex:1;">
                        <div style="font-weight:500;color:#334155;font-size:13px;margin-bottom:2px;">${displayName}</div>
                        <div style="font-size:11px;color:#64748b;">${fileName}.js</div>
                    </div>
                    <div id="status-${index}" style="font-size:11px;color:#64748b;font-weight:500;padding:3px 8px;background:#f1f5f9;border-radius:10px;">Warten...</div>
                </div>
            `;
            scriptList.appendChild(item);
        });

        // Scripts sequenziell laden
        let successCount = 0;
        for(let i = 0; i < scriptsToLoad.length; i++) {
            const url = scriptsToLoad[i];
            const fileName = url.split('/').pop().replace(/%C3%A4/g,'ä').replace(/%C3%BC/g,'ü').replace('.js','');
            
            // Icon auf "loading" setzen
            const iconEl = document.getElementById(`icon-${i}`);
            iconEl.className = 'fas fa-spinner fa-spin';
            iconEl.style.color = '#475569';
            
            const success = await loadScriptSequentially(url, fileName, i, scriptsToLoad.length);
            if(success) successCount++;
        }

        // Abschluss
        window.dwScriptsLoaded = true;
        const progressText = document.getElementById('progressText');
        
        setTimeout(() => {
            progressText.innerHTML = `<i class="fas fa-check-double" style="color:#475569;margin-right:8px;"></i>Alle Scripts geladen! (${successCount}/${scriptsToLoad.length} erfolgreich)`;
            
            setTimeout(() => {
                const modal = document.getElementById('dwScriptModal');
                modal.style.opacity = '0';
                modal.style.transform = 'scale(1)';
                modal.style.transition = 'all 0.2s ease';
                setTimeout(() => modal.remove(), 100);
            }, 1000);
        }, 100);
        
        console.log(`🎉 Sequenzielles Laden abgeschlossen! ${successCount}/${scriptsToLoad.length} Scripts erfolgreich geladen.`);
    };
})();
