// security.js - Gestion de l'authentification et de la sécurité

const STORAGE_KEY_PWD = 'reservaPro_adminHash';
const STORAGE_KEY_SUPER_PWD = 'reservaPro_superHash';
const DEFAULT_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // admin123
const DEFAULT_SUPER_HASH = "e34f92a20532a873cb3184398070b4b82a8fa29cf48572c203dc5f0fa6158231"; // superadmin123
const STORAGE_KEY_HOURS = 'reservaPro_hours';
const STORAGE_KEY_LOGS = 'reservaPro_logs';
const STORAGE_KEY_VACATION = 'reservaPro_vacation';
const STORAGE_KEY_BLACKLIST = 'reservaPro_blacklist';
const STORAGE_KEY_PROS = 'reservaPro_team';
const STORAGE_KEY_ADMIN_USER = 'reservaPro_adminUser';
const DEFAULT_ADMIN_USER = 'admin';

let userRole = 'client'; // 'client', 'pro', 'admin'
let currentProId = null;
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

function getAdminUser() {
    return localStorage.getItem(STORAGE_KEY_ADMIN_USER) || DEFAULT_ADMIN_USER;
}

async function hashPassword(str) {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getProfessionals() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PROS)) || [];
}

function getCurrentProId() {
    return currentProId;
}

// Gestion de la session (Auto-Logout)
function startSessionTimer() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        if(userRole !== 'client') { customAlert("Session expirée par sécurité (15min d'inactivité).").then(() => handleLogin()); }
    }, 15 * 60 * 1000); // 15 minutes
}
function stopSessionTimer() { clearTimeout(sessionTimeout); }
function resetSessionTimer() { if(userRole !== 'client') startSessionTimer(); }
['click', 'keydown'].forEach(evt => document.addEventListener(evt, resetSessionTimer, { passive: true }));

// Fonction de prompt personnalisée (Remplace window.prompt)
function customPrompt(title, message, isPassword = true, isLogin = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('authModal');
        const titleEl = document.getElementById('authTitle');
        const msgEl = document.getElementById('authMessage');
        const inputEl = document.getElementById('authInput');
        const userEl = document.getElementById('authUser');
        const submitBtn = document.getElementById('authSubmit');
        const cancelBtn = document.getElementById('authCancel');

        titleEl.innerText = `> ${title}`;
        msgEl.innerText = message;
        inputEl.value = '';
        inputEl.type = isPassword ? 'password' : 'text';
        userEl.value = '';

        if (isLogin) {
            userEl.style.display = 'block';
            setTimeout(() => userEl.focus(), 50);
        } else {
            userEl.style.display = 'none';
            setTimeout(() => inputEl.focus(), 50);
        }

        const close = (val) => {
            modal.classList.remove('active');
            inputEl.onkeydown = null;
            userEl.onkeydown = null;
            submitBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(val);
        };

        const submit = () => {
            if (isLogin) close({ user: userEl.value, pass: inputEl.value });
            else close(inputEl.value);
        };

        modal.classList.add('active');

        submitBtn.onclick = submit;
        cancelBtn.onclick = () => close(null);
        
        inputEl.onkeydown = (e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') close(null);
        };

        userEl.onkeydown = (e) => {
            if (e.key === 'Enter') inputEl.focus();
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
    if (userRole === 'client') {
        const creds = await customPrompt("LOGIN", "Identifiant & Mot de passe :", true, true);
        if (!creds || !creds.pass) return;

        const hash = await hashPassword(creds.pass);
        const user = creds.user ? creds.user.trim() : '';
        let success = false;
        
        // Vérification Gérant (Admin) - Insensible à la casse pour l'identifiant
        if (user.toLowerCase() === getAdminUser().toLowerCase() && hash === getSuperAdminHash()) {
            userRole = 'admin';
            currentProId = 'admin';
            document.body.classList.add('is-admin', 'role-admin');
            document.getElementById('btn-admin').innerHTML = "Déconnexion (Gérant)";
            success = true;
        } else {
            // Vérification des comptes Pros
            const pros = getProfessionals();
            // Recherche insensible à la casse pour le nom d'utilisateur
            const foundPro = pros.find(pro => pro.name.toLowerCase() === user.toLowerCase() && pro.hash === hash);
            
            if (foundPro) {
                userRole = 'pro';
                currentProId = foundPro.id;
                document.body.classList.add('is-admin', 'role-pro');
                const imgTag = foundPro.photo ? `<img src="${foundPro.photo}" style="width:20px; height:20px; border-radius:50%; vertical-align:middle; margin-right:6px; border:1px solid rgba(255,255,255,0.5);">` : '';
                document.getElementById('btn-admin').innerHTML = `${imgTag}Déconnexion (${foundPro.name})`;
                success = true;

                if (foundPro.mustChangePassword) {
                    await customAlert("🔒 Sécurité : Première connexion.\nVous devez changer votre mot de passe.");
                    const changed = await changePassword();
                    if (!changed) {
                        userRole = 'client';
                        currentProId = null;
                        document.body.classList.remove('is-admin', 'role-admin', 'role-pro');
                        document.getElementById('btn-admin').innerHTML = "Login";
                        await customAlert("Connexion refusée : Mot de passe non modifié.");
                        return;
                    }
                }
            }
            
            // Mécanisme de secours : Si l'utilisateur tente les identifiants par défaut mais qu'un mot de passe personnalisé bloque l'accès
            if (!success && user.toLowerCase() === DEFAULT_ADMIN_USER && hash === DEFAULT_SUPER_HASH) {
                if (getSuperAdminHash() !== DEFAULT_SUPER_HASH) {
                    if (await customConfirm("Un mot de passe personnalisé est actif.\nVoulez-vous le réinitialiser pour utiliser 'superadmin123' ?")) {
                        localStorage.removeItem(STORAGE_KEY_SUPER_PWD);
                        localStorage.removeItem(STORAGE_KEY_ADMIN_USER);
                        await customAlert("Réinitialisation effectuée. Veuillez réessayer.");
                        return;
                    }
                }
            }
        }

        if (success) {
            switchTab('admin-panel');
            startSessionTimer();
            if(typeof addLog === 'function') addLog('Connexion', `Succès (${userRole})`);
            playAccessGrantedSound();
            if(typeof renderTeamManagement === 'function') renderTeamManagement();
        } else {
            playAccessDeniedSound();
            await customAlert("Identifiant incorrect.");
            if(typeof addLog === 'function') addLog('Connexion', 'Échec');
        }
    } else {
        userRole = 'client';
        currentProId = null;
        document.body.classList.remove('is-admin', 'role-admin', 'role-pro');
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
    if (!currentP) return false;
    
    const currentHash = await hashPassword(currentP);

    if (userRole === 'admin') {
        if (currentHash !== getAdminHash()) {
            await customAlert("Mot de passe actuel incorrect.");
            return false;
        }
    } else if (userRole === 'pro') {
        const pros = getProfessionals();
        const pro = pros.find(p => p.id === currentProId);
        if (!pro || pro.hash !== currentHash) {
            await customAlert("Mot de passe actuel incorrect.");
            return false;
        }
    }

    const newP = await customPrompt("NEW_CREDENTIALS", "Nouveau mot de passe (min. 8 caractères) :");
    if (!newP) return false;

    if (newP.length < 8) {
        await customAlert("Sécurité : Le mot de passe doit contenir au moins 8 caractères.");
        return false;
    }
    
    const newHash = await hashPassword(newP);

    if (userRole === 'admin') {
        localStorage.setItem(STORAGE_KEY_PWD, newHash);
        if(typeof addLog === 'function') addLog('Sécurité', 'Mot de passe Admin modifié');
    } else if (userRole === 'pro') {
        const pros = getProfessionals();
        const index = pros.findIndex(p => p.id === currentProId);
        if (index !== -1) {
            pros[index].hash = newHash;
            pros[index].mustChangePassword = false;
            localStorage.setItem(STORAGE_KEY_PROS, JSON.stringify(pros));
            if(typeof addLog === 'function') addLog('Sécurité', `Mot de passe modifié pour ${pros[index].name}`);
        }
    }
    
    await customAlert("Mot de passe modifié avec succès !");
    return true;
}

async function createProfessional() {
    if (userRole !== 'admin' && userRole !== 'pro') return customAlert("Action réservée à l'équipe.");
    
    const name = await customPrompt("NOUVEAU PRO", "Nom du professionnel :", false); // false = input texte
    if (!name) return;

    const pwd = await customPrompt("SECURITE", `Mot de passe pour ${name} :`, true);
    if (!pwd) return;

    if (pwd.length < 4) return customAlert("Mot de passe trop court.");

    const hash = await hashPassword(pwd);
    const pros = getProfessionals();
    
    // Vérification doublon nom
    if (pros.some(p => p.name === name)) return customAlert("Ce nom existe déjà.");

    pros.push({ id: Date.now(), name, hash, mustChangePassword: true });
    localStorage.setItem(STORAGE_KEY_PROS, JSON.stringify(pros));
    
    if(typeof addLog === 'function') addLog('Gestion Équipe', `Création compte : ${name}`);
    await customAlert(`Compte créé pour ${name} !`);
    if(typeof renderTeamManagement === 'function') renderTeamManagement();
}

async function deleteProfessional(id) {
    if (userRole !== 'admin') return customAlert("Action réservée au Gérant.");
    if (!await customConfirm("Supprimer ce compte professionnel ?")) return;

    let pros = getProfessionals();
    const pro = pros.find(p => p.id === id);
    pros = pros.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PROS, JSON.stringify(pros));
    
    if(typeof addLog === 'function') addLog('Gestion Équipe', `Suppression compte : ${pro ? pro.name : id}`);
    if(typeof renderTeamManagement === 'function') renderTeamManagement();
}

async function changeSuperPassword() {
    if (userRole !== 'admin') {
        await customAlert("Accès refusé. Réservé à l'Administrateur.");
        return;
    }
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
    if (userRole === 'client' && lastBook && (Date.now() - lastBook) < 60000) {
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