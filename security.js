// security.js - Gestion de l'authentification et de la sécurité

const STORAGE_KEY_PWD = 'reservaPro_adminHash';
const STORAGE_KEY_SUPER_PWD = 'reservaPro_superHash';
const DEFAULT_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // admin123
const DEFAULT_SUPER_HASH = "4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2"; // superadmin123
const STORAGE_KEY_HOURS = 'reservaPro_hours';
const STORAGE_KEY_LOGS = 'reservaPro_logs';
const STORAGE_KEY_VACATION = 'reservaPro_vacation';
const STORAGE_KEY_BLACKLIST = 'reservaPro_blacklist';

let isAdmin = false;
let sessionTimeout;

// Sécurité : Échapper les caractères HTML pour éviter les failles XSS
function escapeHtml(text) {
    return text == null ? '' : String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getAdminHash() {
    return localStorage.getItem(STORAGE_KEY_PWD) || DEFAULT_HASH;
}

function getSuperAdminHash() {
    return localStorage.getItem(STORAGE_KEY_SUPER_PWD) || DEFAULT_SUPER_HASH;
}

async function hashPassword(str) {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Gestion de la session (Auto-Logout)
function startSessionTimer() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        if(isAdmin) { customAlert("Session expirée par sécurité (15min d'inactivité).").then(() => handleLogin()); }
    }, 15 * 60 * 1000); // 15 minutes
}
function stopSessionTimer() { clearTimeout(sessionTimeout); }
function resetSessionTimer() { if(isAdmin) startSessionTimer(); }
['click', 'keydown'].forEach(evt => document.addEventListener(evt, resetSessionTimer, { passive: true }));

// Fonction de prompt personnalisée (Remplace window.prompt)
function customPrompt(title, message, isPassword = true) {
    return new Promise((resolve) => {
        const modal = document.getElementById('authModal');
        const titleEl = document.getElementById('authTitle');
        const msgEl = document.getElementById('authMessage');
        const inputEl = document.getElementById('authInput');
        const submitBtn = document.getElementById('authSubmit');
        const cancelBtn = document.getElementById('authCancel');

        titleEl.innerText = `> ${title}`;
        msgEl.innerText = message;
        inputEl.value = '';
        inputEl.type = isPassword ? 'password' : 'text';

        const close = (val) => {
            modal.classList.remove('active');
            inputEl.onkeydown = null;
            submitBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(val);
        };

        modal.classList.add('active');
        inputEl.focus();

        submitBtn.onclick = () => close(inputEl.value);
        cancelBtn.onclick = () => close(null);
        inputEl.onkeydown = (e) => {
            if (e.key === 'Enter') close(inputEl.value);
            if (e.key === 'Escape') close(null);
        };
    });
}

function customAlert(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('alertModal');
        const msgEl = document.getElementById('alertMessage');
        const okBtn = document.getElementById('alertOk');
        msgEl.innerText = message;
        const close = () => {
            modal.classList.remove('active');
            okBtn.onclick = null;
            resolve();
        };
        modal.classList.add('active');
        okBtn.focus();
        okBtn.onclick = close;
    });
}

function customConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const msgEl = document.getElementById('confirmMessage');
        const okBtn = document.getElementById('confirmOk');
        const cancelBtn = document.getElementById('confirmCancel');
        msgEl.innerText = message;
        const close = (val) => {
            modal.classList.remove('active');
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(val);
        };
        modal.classList.add('active');
        okBtn.focus();
        okBtn.onclick = () => close(true);
        cancelBtn.onclick = () => close(false);
    });
}

function playAccessGrantedSound() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
}

function playAccessDeniedSound() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
}

async function handleLogin() {
    if (!isAdmin) {
        const p = await customPrompt("ADMIN_LOGIN", "Veuillez vous identifier :");
        if (p && await hashPassword(p) === getAdminHash()) {
            isAdmin = true;
            document.body.classList.add('is-admin');
            document.getElementById('btn-admin').innerHTML = "Logout";
            switchTab('admin-panel');
            startSessionTimer();
            if(typeof addLog === 'function') addLog('Connexion', 'Succès');
            playAccessGrantedSound();
        } else if (p !== null) { 
            playAccessDeniedSound();
            await customAlert("Refusé"); 
            if(typeof addLog === 'function') addLog('Connexion', 'Échec (Mot de passe incorrect)'); 
        }
    } else {
        isAdmin = false;
        document.body.classList.remove('is-admin');
        document.getElementById('btn-admin').innerHTML = "Login";
        stopSessionTimer();
        switchTab('booking');
        if(typeof addLog === 'function') addLog('Déconnexion', 'Manuelle');
    }
    // Mise à jour de l'UI (fonctions définies dans script.js)
    if(typeof displayPortfolio === 'function') displayPortfolio();
    if(typeof displayAdminRdv === 'function') displayAdminRdv();
    if(typeof displayBlacklist === 'function') displayBlacklist();
    if(typeof renderPricingWidget === 'function') renderPricingWidget();
}

async function changePassword() {
    const currentP = await customPrompt("SECURITY_CHECK", "Entrez le mot de passe actuel :");
    if (!currentP) return;
    
    if (await hashPassword(currentP) !== getAdminHash()) {
        await customAlert("Mot de passe actuel incorrect.");
        return;
    }

    const newP = await customPrompt("NEW_CREDENTIALS", "Nouveau mot de passe (min. 8 caractères) :");
    if (!newP) return;

    if (newP.length < 8) {
        await customAlert("Sécurité : Le mot de passe doit contenir au moins 8 caractères.");
        return;
    }
    
    localStorage.setItem(STORAGE_KEY_PWD, await hashPassword(newP));
    if(typeof addLog === 'function') addLog('Sécurité', 'Mot de passe modifié');
    await customAlert("Mot de passe modifié avec succès !");
}

async function changeSuperPassword() {
    const currentP = await customPrompt("ROOT_ACCESS", "SuperAdmin : Entrez le mot de passe actuel :");
    if (!currentP) return;
    
    if (await hashPassword(currentP) !== getSuperAdminHash()) {
        await customAlert("Mot de passe SuperAdmin incorrect.");
        if(typeof addLog === 'function') addLog('Sécurité', 'Échec changement PWD SuperAdmin');
        return;
    }

    const newP = await customPrompt("NEW_ROOT_PWD", "Nouveau mot de passe SuperAdmin (min. 12 caractères) :");
    if (!newP) return;

    if (newP.length < 12) {
        await customAlert("Sécurité : Le mot de passe SuperAdmin doit être très fort (min. 12 caractères).");
        return;
    }
    
    localStorage.setItem(STORAGE_KEY_SUPER_PWD, await hashPassword(newP));
    if(typeof addLog === 'function') addLog('Sécurité', 'Mot de passe SuperAdmin modifié');
    await customAlert("Mot de passe SuperAdmin mis à jour !");
}

async function clearLogs() {
    if(!await customConfirm("⚠️ Action Critique : Effacer tout l'historique d'activité ?")) return;
    
    const p = await customPrompt("ROOT_VERIFICATION", "Sécurité SuperAdmin : Entrez le mot de passe :");
    if (p && await hashPassword(p) === getSuperAdminHash()) {
        localStorage.removeItem(STORAGE_KEY_LOGS);
        if(typeof displayLogs === 'function') displayLogs();
        if(typeof addLog === 'function') addLog('Système', 'Logs purgés par SuperAdmin');
        await customAlert("Historique nettoyé avec succès.");
    } else {
        await customAlert("Mot de passe SuperAdmin incorrect.");
        if(typeof addLog === 'function') addLog('Sécurité', 'Échec purge logs (Pwd incorrect)');
    }
}

async function checkBookingSecurity(phone, date) {
    // Vérification Mode Vacances
    if (localStorage.getItem(STORAGE_KEY_VACATION) === 'true') {
        await customAlert("Le salon est actuellement fermé pour congés. Impossible de réserver.");
        return false;
    }

    // Vérification Blacklist
    const blacklist = JSON.parse(localStorage.getItem(STORAGE_KEY_BLACKLIST)) || [];
    if (blacklist.includes(phone)) {
        await customAlert("⛔ Réservation impossible. Ce numéro est bloqué. Veuillez contacter l'établissement.");
        return false;
    }

    // Vérification Date Passée
    if (new Date(date) < new Date()) {
        await customAlert("Impossible de réserver une date dans le passé.");
        return false;
    }

    // Sécurité : Anti-Spam (1 minute entre chaque réservation)
    const lastBook = localStorage.getItem('reservaPro_lastBook');
    if (!isAdmin && lastBook && (Date.now() - lastBook) < 60000) {
        await customAlert("Veuillez patienter quelques instants avant de reprendre rendez-vous.");
        return false;
    }

    // Vérification Horaires
    const rdvTime = date.split('T')[1];
    const hours = JSON.parse(localStorage.getItem(STORAGE_KEY_HOURS)) || { open: "09:00", close: "19:00" };
    if (rdvTime < hours.open || rdvTime > hours.close) {
        await customAlert(`Désolé, le salon est ouvert uniquement de ${hours.open} à ${hours.close}.`);
        return false;
    }

    return true;
}

function recordBookingSecurity() {
    localStorage.setItem('reservaPro_lastBook', Date.now());
}