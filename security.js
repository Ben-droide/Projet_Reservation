// security.js - Gestion de l'authentification et de la sécurité

const STORAGE_KEY_PWD = 'reservaPro_adminHash';
const STORAGE_KEY_SUPER_PWD = 'reservaPro_superHash';
const DEFAULT_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // admin123
const DEFAULT_SUPER_HASH = "4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2"; // superadmin123

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
        if(isAdmin) { alert("Session expirée par sécurité (15min d'inactivité)."); handleLogin(); }
    }, 15 * 60 * 1000); // 15 minutes
}
function stopSessionTimer() { clearTimeout(sessionTimeout); }
function resetSessionTimer() { if(isAdmin) startSessionTimer(); }
['click', 'keydown'].forEach(evt => document.addEventListener(evt, resetSessionTimer, { passive: true }));

async function handleLogin() {
    if (!isAdmin) {
        const p = prompt("Admin Password :");
        if (p && await hashPassword(p) === getAdminHash()) {
            isAdmin = true;
            document.body.classList.add('is-admin');
            document.getElementById('btn-admin').innerHTML = "Logout";
            switchTab('admin-panel');
            startSessionTimer();
            if(typeof addLog === 'function') addLog('Connexion', 'Succès');
        } else { 
            alert("Refusé"); 
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
    const currentP = prompt("Entrez le mot de passe actuel :");
    if (!currentP) return;
    
    if (await hashPassword(currentP) !== getAdminHash()) {
        alert("Mot de passe actuel incorrect.");
        return;
    }

    const newP = prompt("Entrez le nouveau mot de passe (min. 8 caractères) :");
    if (!newP) return;

    if (newP.length < 8) {
        alert("Sécurité : Le mot de passe doit contenir au moins 8 caractères.");
        return;
    }
    
    localStorage.setItem(STORAGE_KEY_PWD, await hashPassword(newP));
    if(typeof addLog === 'function') addLog('Sécurité', 'Mot de passe modifié');
    alert("Mot de passe modifié avec succès !");
}

async function changeSuperPassword() {
    const currentP = prompt("🔒 SuperAdmin : Entrez le mot de passe actuel :");
    if (!currentP) return;
    
    if (await hashPassword(currentP) !== getSuperAdminHash()) {
        alert("Mot de passe SuperAdmin incorrect.");
        if(typeof addLog === 'function') addLog('Sécurité', 'Échec changement PWD SuperAdmin');
        return;
    }

    const newP = prompt("Nouveau mot de passe SuperAdmin (min. 12 caractères) :");
    if (!newP) return;

    if (newP.length < 12) {
        alert("Sécurité : Le mot de passe SuperAdmin doit être très fort (min. 12 caractères).");
        return;
    }
    
    localStorage.setItem(STORAGE_KEY_SUPER_PWD, await hashPassword(newP));
    if(typeof addLog === 'function') addLog('Sécurité', 'Mot de passe SuperAdmin modifié');
    alert("Mot de passe SuperAdmin mis à jour !");
}

async function clearLogs() {
    if(!confirm("⚠️ Action Critique : Effacer tout l'historique d'activité ?")) return;
    
    const p = prompt("🔒 Sécurité SuperAdmin : Entrez le mot de passe :");
    if (p && await hashPassword(p) === getSuperAdminHash()) {
        localStorage.removeItem('reservaPro_logs');
        if(typeof displayLogs === 'function') displayLogs();
        if(typeof addLog === 'function') addLog('Système', 'Logs purgés par SuperAdmin');
        alert("Historique nettoyé avec succès.");
    } else {
        alert("Mot de passe SuperAdmin incorrect.");
        if(typeof addLog === 'function') addLog('Sécurité', 'Échec purge logs (Pwd incorrect)');
    }
}