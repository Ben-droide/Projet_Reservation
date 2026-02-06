// Stockage Local uniquement
const STORAGE_KEY_IMG = 'reservaPro_portfolio';
const STORAGE_KEY_RDV = 'reservaPro_rdv';
const STORAGE_KEY_PRICES = 'reservaPro_prices';

const DEFAULT_PRICES = {
    "Coupe Homme": 20,
    "Barbe": 15,
    "Coupe + Barbe": 30,
    "Coupe Enfant": 15
};
let prices = JSON.parse(localStorage.getItem(STORAGE_KEY_PRICES)) || DEFAULT_PRICES;

// Optimisation : Debounce pour la recherche (évite de recalculer à chaque lettre tapée)
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function switchTab(t) {
    document.querySelectorAll('.container').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-section').classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
}

// --- GESTION DES RDV (LOCAL) ---
async function handleBooking(e) {
    e.preventDefault();
    const idInput = document.getElementById('rdvId');
    const isEdit = idInput.value !== '';
    const name = document.getElementById('rdvName').value;
    const phone = document.getElementById('rdvPhone').value;
    const proId = document.getElementById('rdvPro').value;
    const service = document.getElementById('rdvService').value;
    const date = document.getElementById('rdvDate').value;
    const comment = document.getElementById('rdvComment').value;
    const tags = Array.from(document.querySelectorAll('input[name="rdvTags"]:checked')).map(cb => cb.value);

    // Vérifications de sécurité centralisées
    if (!await checkBookingSecurity(phone, date)) return;

    let rdvs = JSON.parse(localStorage.getItem(STORAGE_KEY_RDV)) || [];

    // --- LOGIQUE AUTO-TAGS (Fidélité) ---
    // On compte l'historique de ce numéro (en excluant le RDV actuel si on est en train de le modifier)
    const historyCount = rdvs.filter(r => r.phone === phone && (isEdit ? r.id !== parseInt(idInput.value) : true)).length;

    if (historyCount === 0) {
        // 1er RDV : Tag "Nouveau" automatique
        if (!tags.includes('Nouveau')) tags.push('Nouveau');
        // Nettoyage : ne peut pas être VIP
        const idxVip = tags.indexOf('VIP');
        if (idxVip > -1) tags.splice(idxVip, 1);
    } else if (historyCount >= 2) {
        // 3ème RDV ou plus : Tag "VIP" automatique
        if (!tags.includes('VIP')) tags.push('VIP');
        // Nettoyage : ne peut plus être Nouveau
        const idxNew = tags.indexOf('Nouveau');
        if (idxNew > -1) tags.splice(idxNew, 1);
    } else {
        // 2ème RDV : On retire le tag "Nouveau" automatiquement
        const idxNew = tags.indexOf('Nouveau');
        if (idxNew > -1) tags.splice(idxNew, 1);
    }

    if (isEdit) {
        const id = parseInt(idInput.value);
        const index = rdvs.findIndex(r => r.id === id);
        if (index !== -1) {
            rdvs[index] = { id, name, phone, proId, service, date, comment, tags };
            await customAlert("Rendez-vous modifié avec succès !");
            addLog('Modification RDV', `${name} (${date})`);
        }
    } else {
        const newRdv = { id: Date.now(), name, phone, proId, service, date, comment, tags };
        rdvs.push(newRdv);
        playNotificationSound();
        await customAlert(`Rendez-vous confirmé pour ${name} !\n(Note: Ceci est une démo locale)`);
        addLog('Nouveau RDV', `${name} (${date})`);
    }

    localStorage.setItem(STORAGE_KEY_RDV, JSON.stringify(rdvs));
    recordBookingSecurity(); // Enregistrement du timestamp pour l'anti-spam
    cancelEdit(); // Réinitialise le formulaire et le mode édition
    displayAdminRdv(); // Mise à jour immédiate si admin connecté
    checkTodayRdv();

    // Animation du badge si c'est un nouveau RDV pour aujourd'hui
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    if (!isEdit && date.split('T')[0] === todayStr) {
        const badge = document.getElementById('adminBadge');
        badge.classList.remove('bounce');
        void badge.offsetWidth; // Force le redessin pour relancer l'animation
        badge.classList.add('bounce');
    }
}

function playNotificationSound() {
    // Création d'un synthétiseur audio (Web Audio API)
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Effet "Futuriste" : Montée rapide de fréquence (Sweep)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, ctx.currentTime); // Volume bas pour ne pas agresser
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close(); // Nettoyage mémoire
}

function addLog(action, details = '') {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS)) || [];
    logs.unshift({ date: new Date().toISOString(), action, details });
    if (logs.length > 50) logs.pop(); // Garder les 50 derniers
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    displayLogs();
}

function displayLogs() {
    if (userRole !== 'admin') return; // Seul l'admin voit les logs
    const container = document.getElementById('adminLogs');
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS)) || [];
    
    if (logs.length === 0) {
        container.innerHTML = '<div class="log-item" style="text-align:center; border:none;">Aucune activité récente.</div>';
        return;
    }

    container.innerHTML = logs.map(log => {
        const d = new Date(log.date).toLocaleString('fr-FR');
        return `<div class="log-item"><span class="log-date">${d}</span> <strong>${escapeHtml(log.action)}</strong> ${escapeHtml(log.details)}</div>`;
    }).join('');
}

function displayBlacklist() {
    if (userRole === 'client') return; // Pro et Admin peuvent voir la blacklist
    const container = document.getElementById('blacklistContainer');
    const blacklist = JSON.parse(localStorage.getItem(STORAGE_KEY_BLACKLIST)) || [];
    
    if (blacklist.length === 0) {
        container.innerHTML = '<div style="color:#8b949e; font-size:0.8rem; text-align:center;">Aucun numéro banni.</div>';
        return;
    }

    container.innerHTML = blacklist.map(phone => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:5px; border-bottom:1px solid var(--hacker-border); font-size:0.85rem;">
            <span>${escapeHtml(phone)}</span>
            <button onclick="removeFromBlacklist('${escapeHtml(phone)}')" class="btn-del" style="position:static; width:20px; height:20px; font-size:10px;">×</button>
        </div>
    `).join('');
}

async function manualAddToBlacklist() {
    const input = document.getElementById('blacklistInput');
    if(input.value) {
        await addToBlacklist(input.value);
        input.value = '';
    }
}

async function addToBlacklist(phone) {
    if(!phone) return;
    if(!await customConfirm(`Bannir le numéro ${phone} ?`)) return;
    
    let blacklist = JSON.parse(localStorage.getItem(STORAGE_KEY_BLACKLIST)) || [];
    if(!blacklist.includes(phone)) {
        blacklist.push(phone);
        localStorage.setItem(STORAGE_KEY_BLACKLIST, JSON.stringify(blacklist));
        addLog('Sécurité', `Numéro banni : ${phone}`);
        await customAlert(`Le numéro ${phone} a été ajouté à la liste noire.`);
        displayBlacklist();
    } else { await customAlert("Ce numéro est déjà banni."); }
}

async function removeFromBlacklist(phone) {
    if(!await customConfirm(`Débloquer le numéro ${phone} ?`)) return;
    let blacklist = JSON.parse(localStorage.getItem(STORAGE_KEY_BLACKLIST)) || [];
    blacklist = blacklist.filter(p => p !== phone);
    localStorage.setItem(STORAGE_KEY_BLACKLIST, JSON.stringify(blacklist));
    addLog('Sécurité', `Numéro débloqué : ${phone}`);
    displayBlacklist();
}

function renderPricingWidget() {
    const container = document.getElementById('pricingInputs');
    if(!container) return;
    if(userRole !== 'admin') {
        container.innerHTML = '<div style="text-align:center; color:#8b949e; padding:10px; font-style:italic;">Configuration des tarifs réservée à l\'administrateur.</div>';
        return;
    }
    container.innerHTML = Object.entries(prices).map(([service, price]) => `
        <div class="pricing-item">
            <label style="font-size:0.9rem; color:#c9d1d9;">${service}</label>
            <input type="number" data-service="${service}" value="${price}" class="hacker-input price-input" style="width:70px; text-align:right;">
        </div>
    `).join('');
}

async function savePrices() {
    if(userRole !== 'admin') return customAlert("Action réservée à l'administrateur.");
    const inputs = document.querySelectorAll('.price-input');
    inputs.forEach(input => { prices[input.dataset.service] = parseFloat(input.value) || 0; });
    localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(prices));
    addLog('Configuration', 'Tarifs mis à jour');
    await customAlert("Tarifs mis à jour avec succès !");
    displayAdminRdv(); // Recalcul du CA
}

function renderRevenueChart() {
    const container = document.getElementById('revenueChart');
    if (!container || userRole !== 'admin') { if(container) container.innerHTML = ''; return; }

    const rdvs = JSON.parse(localStorage.getItem(STORAGE_KEY_RDV)) || [];
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();
    const data = [];

    // Génération des 7 derniers jours
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const dailyTotal = rdvs
            .filter(r => r.date.split('T')[0] === dateStr)
            .reduce((sum, r) => sum + (prices[r.service] || 0), 0);
        
        data.push({ label: days[d.getDay()], value: dailyTotal });
    }

    const maxVal = Math.max(...data.map(d => d.value), 10); // Éviter division par zéro

    container.innerHTML = data.map(item => {
        const height = (item.value / maxVal) * 100;
        return `
            <div class="chart-bar-wrapper">
                <div class="chart-value">${item.value}€</div>
                <div class="chart-bar" style="height: ${height}%"></div>
                <div class="chart-label">${item.label}</div>
            </div>
        `;
    }).join('');
}

async function handleProPhotoUpload(id, input) {
    // Sécurité : Vérifier que c'est bien le pro connecté qui modifie son profil
    const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
    if (userRole !== 'pro' || currentId !== id) {
        await customAlert("Vous ne pouvez modifier que votre propre photo de profil.");
        return;
    }
    const file = input.files[0];
    if (!file) return;
    try {
        // Compression avatar (150px suffisent pour une icône)
        const base64Img = await compressImage(file, 150, 0.7);
        let pros = JSON.parse(localStorage.getItem('reservaPro_team')) || [];
        const index = pros.findIndex(p => p.id === id);
        if (index !== -1) {
            pros[index].photo = base64Img;
            localStorage.setItem('reservaPro_team', JSON.stringify(pros));
            addLog('Gestion Équipe', `Photo mise à jour : ${pros[index].name}`);
            renderTeamManagement();
        }
    } catch (err) { await customAlert("Erreur upload : " + err.message); }
}

function renderTeamManagement() {
    // Admin et Pros peuvent voir ce panneau
    if (userRole !== 'admin' && userRole !== 'pro') {
        const existing = document.getElementById('teamCard');
        if (existing) existing.remove();
        return;
    }

    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;

    let card = document.getElementById('teamCard');
    if (!card) {
        card = document.createElement('div');
        card.id = 'teamCard';
        card.className = 'dashboard-card';
        grid.appendChild(card);
    }

    const prosList = JSON.parse(localStorage.getItem('reservaPro_team')) || [];
    const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;

    let html = `<h3><i class="fa-solid fa-users-gear"></i> Équipe</h3><div style="margin-bottom:20px; max-height:200px; overflow-y:auto; padding-right:5px;">`;

    if (prosList.length === 0) {
        html += `<div style="color:#8b949e; font-style:italic; font-size:0.8rem;">Aucun compte pro configuré.</div>`;
    } else {
        html += prosList.map(p => {
            const isMe = (userRole === 'pro' && p.id === currentId);
            const photoHtml = p.photo 
                ? `<img src="${p.photo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; border:1px solid var(--hacker-accent);">` 
                : `<div style="width:100%; height:100%; border-radius:50%; background:#21262d; display:flex; align-items:center; justify-content:center; border:1px solid var(--hacker-border);"><i class="fa-solid fa-camera" style="color:#8b949e; font-size:0.7rem;"></i></div>`;
            
            const avatarBlock = isMe 
                ? `<div style="position:relative; width:32px; height:32px; cursor:pointer;" onclick="document.getElementById('upload-pro-${p.id}').click()" title="Modifier ma photo">${photoHtml}</div><input type="file" id="upload-pro-${p.id}" hidden accept="image/*" onchange="handleProPhotoUpload(${p.id}, this)">`
                : `<div style="position:relative; width:32px; height:32px; opacity:0.8;">${photoHtml}</div>`;

            return `
            <div class="team-item">
                <div style="display:flex; align-items:center; gap:10px;">
                    ${avatarBlock}
                    <span style="color:var(--hacker-text); font-weight:bold;">${p.name} ${isMe ? '<span style="font-size:0.7rem; color:var(--hacker-accent);">(Moi)</span>' : ''}</span>
                </div>
                ${userRole === 'admin' ? `<button onclick="deleteProfessional(${p.id})" class="btn-del" style="position:static; width:24px; height:24px;" title="Supprimer le compte">×</button>` : ''}
            </div>`;
        }).join('');
    }
    html += `</div><button onclick="createProfessional()" class="btn-hacker" style="width:100%;"><i class="fa-solid fa-user-plus"></i> Ajouter un Pro</button>`;
    card.innerHTML = html;
}

function populateProSelect() {
    const select = document.getElementById('rdvPro');
    if (!select) return;
    const pros = JSON.parse(localStorage.getItem('reservaPro_team')) || [];
    
    // Garder l'option par défaut
    const defaultOption = select.firstElementChild;
    select.innerHTML = '';
    select.appendChild(defaultOption);

    pros.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
    });
}

function displayAdminRdv() {
    if (userRole === 'client') return;
    const list = document.getElementById('adminRdvList');
    const statsContainer = document.getElementById('adminStats');
    const searchTerm = document.getElementById('rdvSearch').value.toLowerCase();
    const vipOnly = document.getElementById('vipFilter').checked;
    let rdvs = JSON.parse(localStorage.getItem(STORAGE_KEY_RDV)) || [];
    const prosList = JSON.parse(localStorage.getItem('reservaPro_team')) || [];

    // FILTRE PRO : Si je suis un Pro, je ne vois que MES rendez-vous
    if (userRole === 'pro') {
        const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
        if (currentId) rdvs = rdvs.filter(r => r.proId == currentId);
    }
    
    // Calcul CA du jour
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    const dailyRevenue = rdvs
        .filter(r => r.date.split('T')[0] === todayStr)
        .reduce((sum, r) => sum + (prices[r.service] || 0), 0);

    // Calcul des statistiques (sur la totalité des RDV)
    const stats = rdvs.reduce((acc, r) => {
        const s = r.service || 'Autre';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    displayLogs(); // Mise à jour des logs en même temps
    displayBlacklist();
    renderRevenueChart(); // Mise à jour du graphique
    renderTeamManagement(); // Mise à jour de l'équipe
    updateDashboardUI(); // Mise à jour de l'interface selon le rôle
    
    const maxVal = Math.max(...Object.values(stats), 1);
    
    // Affichage conditionnel du CA (Admin seulement)
    let statsHtml = '';
    if (userRole === 'admin') {
        statsHtml += `<div class="stat-box" style="border-color:var(--hacker-accent);"><span class="stat-number" style="color:var(--hacker-accent);">${dailyRevenue}€</span><span class="stat-label">CA DU JOUR</span></div>`;
    }

    statsHtml += (Object.entries(stats).map(([k, v]) => {
        const percent = (v / maxVal) * 100;
        return `<div class="stat-box" style="align-items: stretch; text-align: left;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                <span class="stat-label" style="margin:0;">${k}</span>
                <span class="stat-number" style="font-size:1.2rem;">${v}</span>
            </div>
            <div class="stat-bar-container"><div class="stat-bar" style="width:${percent}%"></div></div>
        </div>`; 
    }).join(''));

    statsContainer.innerHTML = statsHtml;

    if (searchTerm) {
        rdvs = rdvs.filter(r => r.name.toLowerCase().includes(searchTerm));
    }

    if (vipOnly) {
        rdvs = rdvs.filter(r => (r.tags || []).includes('VIP'));
    }

    if (rdvs.length === 0) {
        list.innerHTML = '<div class="empty-msg">Aucun rendez-vous trouvé.</div>';
        return;
    }

    // Tri chronologique
    rdvs.sort((a,b) => new Date(a.date) - new Date(b.date));

    // Groupement par date
    const groups = { today: [], future: [], past: [] };

    rdvs.forEach(rdv => {
        const rdvDateStr = rdv.date.split('T')[0];
        if (rdvDateStr === todayStr) groups.today.push(rdv);
        else if (rdvDateStr > todayStr) groups.future.push(rdv);
        else groups.past.push(rdv);
    });

    // Fonction d'affichage unitaire
    const renderRdv = (rdv) => {
        const dateFmt = new Date(rdv.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const smsBody = encodeURIComponent(`Bonjour ${rdv.name}, petit rappel pour votre rendez-vous le ${dateFmt}. À bientôt !`);
        const tagsHtml = (rdv.tags || []).map(t => `<span class="tag tag-${t}">${t}</span>`).join('');
        const vipIcon = (rdv.tags || []).includes('VIP') ? '👑 ' : '';
        
        // Affichage du nom du Pro (utile pour l'Admin)
        const assignedPro = prosList.find(p => p.id == rdv.proId);
        const proLabel = userRole === 'admin' ? `<span style="font-size:0.75rem; background:#21262d; padding:2px 6px; border-radius:4px; margin-left:5px; color:#8b949e;"><i class="fa-solid fa-user-tie"></i> ${assignedPro ? assignedPro.name : 'Non assigné'}</span>` : '';

        return `
        <div class="rdv-item">
            <div class="rdv-info">
                <h4>${vipIcon}${escapeHtml(rdv.name)} ${tagsHtml} ${proLabel} <span style="font-size:0.85rem; font-weight:normal; color:var(--primary);">(${escapeHtml(rdv.service)})</span></h4>
                <p><i class="fa-regular fa-clock"></i> ${dateFmt}</p>
                <p><i class="fa-solid fa-phone"></i> ${escapeHtml(rdv.phone)} <button onclick="addToBlacklist('${escapeHtml(rdv.phone)}')" class="btn-del" style="position:static; width:20px; height:20px; font-size:10px; background:var(--dark);" title="Bannir">🚫</button></p>
                ${rdv.comment ? `<p style="font-style:italic; margin-top:5px; font-size:0.85rem; color:var(--text-main);">"${escapeHtml(rdv.comment)}"</p>` : ''}
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <a href="sms:${escapeHtml(rdv.phone)}?body=${smsBody}" style="background:#4cc9f0; color:white; width:25px; height:25px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none;" title="SMS Rappel" aria-label="Envoyer SMS"><i class="fa-solid fa-comment-sms" style="font-size:12px;"></i></a>
                <a href="tel:${escapeHtml(rdv.phone)}" style="background:var(--success); color:white; width:25px; height:25px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none;" title="Appeler" aria-label="Appeler"><i class="fa-solid fa-phone" style="font-size:12px;"></i></a>
                <button class="btn-del" style="position:static; background:var(--primary);" onclick="editRdv(${rdv.id})" title="Modifier" aria-label="Modifier"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-del" style="position:static;" onclick="deleteRdv(${rdv.id})" title="Supprimer" aria-label="Supprimer">×</button>
            </div>
        </div>`;
    };

    // Construction de l'affichage final
    let html = '';
    if (groups.today.length) html += `<div class="rdv-group-today"><h4 style="color:var(--primary); margin:10px 0; border-bottom:1px solid var(--border); padding-bottom:5px;">Aujourd'hui</h4>` + groups.today.map(renderRdv).join('') + `</div>`;
    if (groups.future.length) html += `<div class="rdv-group-future"><h4 style="color:var(--text-main); margin:20px 0 10px; border-bottom:1px solid var(--border); padding-bottom:5px;">À venir</h4>` + groups.future.map(renderRdv).join('') + `</div>`;
    if (groups.past.length) html += `<div class="rdv-group-past"><h4 style="color:var(--text-sub); margin:20px 0 10px; border-bottom:1px solid var(--border); padding-bottom:5px;">Passés</h4>` + groups.past.map(renderRdv).join('') + `</div>`;
    
    list.innerHTML = html;
}

function updateDashboardUI() {
    // Liste des widgets réservés au Gérant (Admin)
    const adminCards = ['cardStats', 'cardRevenue', 'cardConfig', 'cardBlacklist', 'cardPricing', 'cardLogs'];
    const superBtns = document.querySelectorAll('.super-admin-btn');
    const proBtns = document.querySelectorAll('.pro-only-btn');
    const title = document.getElementById('dashboardTitle');

    if (userRole === 'pro') {
        // Mode Pro : On cache les widgets complexes et les boutons système
        adminCards.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = 'none';
        });
        superBtns.forEach(btn => btn.style.display = 'none');
        proBtns.forEach(btn => btn.style.display = 'inline-block');

        // Message de bienvenue personnalisé
        const pros = JSON.parse(localStorage.getItem('reservaPro_team')) || [];
        const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
        const pro = pros.find(p => p.id === currentId);
        if (pro && title) {
            // Chargement du thème sauvegardé
            const savedTheme = localStorage.getItem('reservaPro_theme_' + pro.id) || '';
            if(savedTheme) {
                document.body.classList.add(savedTheme);
                updateMetaThemeColor();
            }

            const isLunch = localStorage.getItem('reservaPro_lunch_' + pro.id) === 'true';
            const quotes = [
                "Passe une excellente journée !",
                "Ton talent fait la différence.",
                "Prêt(e) à sublimer tes clients ?",
                "Chaque coupe est une œuvre d'art.",
                "Le succès est au bout des ciseaux.",
                "Sourire, c'est déjà accueillir.",
                "Fais ce que tu aimes, aime ce que tu fais."
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const imgHtml = pro.photo ? `<img src="${pro.photo}" style="width:45px; height:45px; border-radius:50%; margin-right:12px; object-fit:cover; border:2px solid var(--primary);">` : '';
            title.innerHTML = `<div style="display:flex; align-items:center;">
                <div style="display:flex; align-items:center;">${imgHtml}<div><div>Bonjour ${pro.name} <i class="fa-solid fa-hand-sparkles"></i></div><div style="font-size:0.85rem; color:var(--text-sub); font-style:italic; font-weight:normal; margin-top:2px;">"${randomQuote}"</div></div></div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; margin-left:20px; padding-left:20px; border-left:2px solid var(--border);">
                    <div id="liveClock" style="font-size:1.4rem; color:var(--primary); font-weight:600; line-height:1;">--:--</div>
                    <div id="workTimeLeft" style="font-size:0.75rem; color:var(--text-sub); margin-top:4px; font-weight:bold;">--h restantes</div>
                    <div style="width: 80px; height: 4px; background: var(--border); border-radius: 2px; margin-top: 6px; overflow: hidden;">
                        <div id="workProgressBar" style="height: 100%; background: var(--primary); width: 0%; transition: width 1s linear;"></div>
                    </div>
                    <button onclick="toggleLunch()" style="background:none; border:none; font-size:0.65rem; color:${isLunch ? 'var(--primary)' : 'var(--text-sub)'}; cursor:pointer; margin-top:5px; font-weight:${isLunch ? 'bold' : 'normal'}; opacity:${isLunch ? '1' : '0.7'};" title="Déduire 1h de pause">
                        <i class="fa-solid fa-utensils"></i> Pause -1h ${isLunch ? '✓' : ''}
                    </button>
                </div>
                <div style="margin-left:20px;">
                    <select onchange="changeProTheme(this.value)" style="padding:5px; border-radius:4px; border:1px solid var(--border); background:var(--bg-card); color:var(--text-main); font-family:inherit; font-size:0.8rem; cursor:pointer;">
                        <option value="" ${savedTheme===''?'selected':''}>🌿 Nature</option>
                        <option value="theme-girly" ${savedTheme==='theme-girly'?'selected':''}>🌸 Girly</option>
                        <option value="theme-cyberpunk" ${savedTheme==='theme-cyberpunk'?'selected':''}>🤖 Cyberpunk</option>
                        <option value="theme-gothic" ${savedTheme==='theme-gothic'?'selected':''}>🦇 Gothique</option>
                    </select>
                </div>
            </div>`;
            title.style.fontFamily = "'Playfair Display', serif";
        }
    } else {
        // Mode Admin : On affiche tout
        adminCards.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = 'block';
        });
        superBtns.forEach(btn => btn.style.display = 'inline-block');
        proBtns.forEach(btn => btn.style.display = 'none'); // Admin n'a pas de profil "Pro"

        // Restauration titre Admin
        if (title) {
            title.innerHTML = '> ADMIN_CONSOLE';
            title.style.fontFamily = "'Courier New', monospace";
        }
    }
}

function changeProTheme(themeClass) {
    const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
    if(!currentId) return;
    
    document.body.classList.remove('theme-girly', 'theme-cyberpunk', 'theme-gothic');
    if(themeClass) document.body.classList.add(themeClass);
    
    localStorage.setItem('reservaPro_theme_' + currentId, themeClass);
    updateMetaThemeColor();
}

let natureInterval;

function startNatureEffects() {
    const container = document.getElementById('nature-effects-container');
    if (!container || natureInterval) return; // Déjà actif ou conteneur introuvable

    // Création initiale de quelques feuilles pour ne pas attendre
    for(let i=0; i<5; i++) createLeaf(container);

    natureInterval = setInterval(() => createLeaf(container), 2500); // Une nouvelle feuille toutes les 2.5s (subtil)
}

function createLeaf(container) {
    const leaf = document.createElement('i');
    leaf.classList.add('fa-solid', 'fa-leaf', 'falling-leaf');
    
    const startLeft = Math.random() * 100; // Position horizontale aléatoire
    const duration = Math.random() * 10 + 15; // Chute lente (15-25s)
    const size = Math.random() * 10 + 10; // Taille variable (10-20px)
    
    leaf.style.left = startLeft + '%';
    leaf.style.animation = `fall-sway ${duration}s linear forwards`;
    leaf.style.fontSize = size + 'px';
    leaf.style.opacity = Math.random() * 0.4 + 0.2; // Transparence variable
    leaf.style.color = Math.random() > 0.5 ? 'var(--primary)' : '#8d6e63'; // Vert ou Marron automne
    
    container.appendChild(leaf);
    
    // Nettoyage après l'animation
    setTimeout(() => { if(leaf.parentNode) leaf.remove(); }, duration * 1000);
}

function stopNatureEffects() {
    if (natureInterval) {
        clearInterval(natureInterval);
        natureInterval = null;
    }
    const container = document.getElementById('nature-effects-container');
    if (container) container.innerHTML = '';
}

function updateMetaThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        const color = getComputedStyle(document.body).getPropertyValue('--primary').trim();
        meta.setAttribute('content', color);
    }
    // Gestion des effets selon le thème
    const isCustomTheme = document.body.classList.contains('theme-girly') || document.body.classList.contains('theme-cyberpunk') || document.body.classList.contains('theme-gothic');
    if (isCustomTheme) stopNatureEffects();
    else startNatureEffects();
}

function openProProfile() {
    const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
    if (!currentId) return;

    const pros = JSON.parse(localStorage.getItem('reservaPro_team')) || [];
    const pro = pros.find(p => p.id === currentId);
    if (!pro) return;

    // Remplissage des données
    document.getElementById('instaName').innerText = pro.name;
    document.getElementById('instaRealName').innerText = pro.name; // Ou un champ "Nom complet" si ajouté
    document.getElementById('instaAvatar').src = pro.photo || 'https://via.placeholder.com/150?text=PRO';
    
    const desc = pro.description || "Bienvenue sur mon profil !";
    document.getElementById('instaDesc').innerText = desc;
    
    const email = pro.email || "";
    const emailLink = document.getElementById('instaEmailLink');
    if (email) {
        emailLink.innerText = email;
        emailLink.href = "mailto:" + email;
        emailLink.style.display = "block";
    } else {
        emailLink.style.display = "none";
    }

    // Stats fictives pour l'exemple (pourraient être réelles)
    const rdvs = JSON.parse(localStorage.getItem(STORAGE_KEY_RDV)) || [];
    const myRdvs = rdvs.filter(r => r.proId == currentId).length;
    document.querySelector('.insta-stats span:nth-child(1) strong').innerText = myRdvs; // "Publications" -> RDV
    document.querySelector('.insta-stats span:nth-child(2) strong').innerText = Math.floor(myRdvs * 1.5); // "Abonnés" -> Clients

    // Remplissage Portfolio (Images globales pour l'instant)
    const imgs = JSON.parse(localStorage.getItem(STORAGE_KEY_IMG)) || [];
    const grid = document.getElementById('instaGrid');
    grid.innerHTML = imgs.map(url => `<div class="portfolio-item"><img src="${url}" loading="lazy"></div>`).join('');

    switchTab('pro-profile');
}

function toggleEditProfile() {
    const displayDiv = document.getElementById('instaBioDisplay');
    const editDiv = document.getElementById('instaBioEdit');
    
    if (editDiv.style.display === 'none') {
        // Mode Édition
        const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
        const pros = JSON.parse(localStorage.getItem('reservaPro_team')) || [];
        const pro = pros.find(p => p.id === currentId);

        document.getElementById('editInstaName').value = pro.name;
        document.getElementById('editInstaEmail').value = pro.email || "";
        document.getElementById('editInstaDesc').value = pro.description || "";

        displayDiv.style.display = 'none';
        editDiv.style.display = 'block';
    } else {
        // Annuler
        displayDiv.style.display = 'block';
        editDiv.style.display = 'none';
    }
}

async function saveProProfile() {
    const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
    if (!currentId) return;

    let pros = JSON.parse(localStorage.getItem('reservaPro_team')) || [];
    const index = pros.findIndex(p => p.id === currentId);
    if (index === -1) return;

    pros[index].name = document.getElementById('editInstaName').value;
    pros[index].email = document.getElementById('editInstaEmail').value;
    pros[index].description = document.getElementById('editInstaDesc').value;

    localStorage.setItem('reservaPro_team', JSON.stringify(pros));
    await customAlert("Profil mis à jour !");
    toggleEditProfile(); // Revenir en mode affichage
    openProProfile(); // Rafraîchir l'affichage
}

async function handleInstaPhotoUpload(input) {
    const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
    if (!currentId) return;
    await handleProPhotoUpload(currentId, input); // Réutilise la fonction existante
    openProProfile(); // Rafraîchir l'image
}

function toggleLunch() {
    const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
    if(!currentId) return;
    const key = 'reservaPro_lunch_' + currentId;
    const current = localStorage.getItem(key) === 'true';
    localStorage.setItem(key, !current);
    updateDashboardUI();
}

function editRdv(id) {
    const rdvs = JSON.parse(localStorage.getItem(STORAGE_KEY_RDV)) || [];
    const rdv = rdvs.find(r => r.id === id);
    if (!rdv) return;

    switchTab('booking');

    // Remplissage du formulaire
    document.getElementById('rdvId').value = rdv.id;
    document.getElementById('rdvName').value = rdv.name;
    document.getElementById('rdvPhone').value = rdv.phone;
    document.getElementById('rdvPro').value = rdv.proId || '';
    document.getElementById('rdvService').value = rdv.service;
    document.getElementById('rdvDate').value = rdv.date;
    document.getElementById('rdvComment').value = rdv.comment || '';
    
    // Reset et chargement des tags
    document.querySelectorAll('input[name="rdvTags"]').forEach(cb => cb.checked = false);
    if (rdv.tags) {
        rdv.tags.forEach(tag => {
            const cb = document.querySelector(`input[name="rdvTags"][value="${tag}"]`);
            if (cb) cb.checked = true;
        });
    }

    // Changement d'état de l'interface
    document.getElementById('btnSubmit').innerText = "Modifier le rendez-vous";
    document.getElementById('btnCancelEdit').style.display = 'block';
    document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    const wasEditing = document.getElementById('rdvId').value !== '';
    document.getElementById('bookingForm').reset();
    document.getElementById('rdvId').value = '';
    document.getElementById('btnSubmit').innerText = "Confirmer la réservation";
    document.getElementById('btnCancelEdit').style.display = 'none';
    document.querySelectorAll('input[name="rdvTags"]').forEach(cb => cb.checked = false);

    if (wasEditing && userRole !== 'client') {
        switchTab('admin-panel');
    }
}

async function deleteRdv(id) {
    if (!await customConfirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) return;
    let rdvs = JSON.parse(localStorage.getItem(STORAGE_KEY_RDV)) || [];
    rdvs = rdvs.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY_RDV, JSON.stringify(rdvs));
    addLog('Suppression RDV', `ID: ${id}`);
    displayAdminRdv();
    checkTodayRdv();
}

function checkTodayRdv() {
    const rdvs = JSON.parse(localStorage.getItem(STORAGE_KEY_RDV)) || [];
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    
    const todayRdvs = rdvs.filter(r => r.date.split('T')[0] === todayStr);
    const count = todayRdvs.length;
    const badge = document.getElementById('adminBadge');
    
    if (count > 0) {
        badge.style.display = 'inline-block';
        badge.innerText = count;
        
        // Si tous les RDV du jour sont passés -> Vert, sinon -> Rouge
        const allPassed = todayRdvs.every(r => new Date(r.date) < now);
        badge.style.background = allPassed ? 'var(--success)' : 'var(--danger)';
    } else {
        badge.style.display = 'none';
    }
}

async function toggleVacationMode() {
    if(userRole !== 'admin') return customAlert("Action réservée à l'administrateur.");
    const current = localStorage.getItem(STORAGE_KEY_VACATION) === 'true';
    if(!await customConfirm(`Voulez-vous ${current ? 'désactiver' : 'activer'} le mode vacances ?`)) return;
    
    localStorage.setItem(STORAGE_KEY_VACATION, !current);
    updateVacationUI();
    addLog('Configuration', `Vacances: ${!current ? 'ON' : 'OFF'}`);
}

function updateVacationUI() {
    const isVacation = localStorage.getItem(STORAGE_KEY_VACATION) === 'true';
    
    // Admin UI
    const btn = document.getElementById('btnVacation');
    if(btn) {
        btn.innerText = isVacation ? 'ACTIVE' : 'INACTIVE';
        btn.className = isVacation ? 'btn-hacker btn-hacker-danger' : 'btn-hacker';
        if(!isVacation) btn.style.background = '#21262d';
    }

    // Client UI
    const form = document.getElementById('bookingForm');
    const container = document.querySelector('#booking-section .card');
    let msg = document.getElementById('vacationMessage');

    if(isVacation) {
        if(form) form.style.display = 'none';
        if(!msg) {
            msg = document.createElement('div');
            msg.id = 'vacationMessage';
            msg.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-sub);"><i class="fa-solid fa-umbrella-beach" style="font-size:3rem; color:var(--primary); margin-bottom:15px;"></i><h3>Salon en vacances</h3><p>Les réservations sont momentanément suspendues.<br>À très vite !</p></div>`;
            container.appendChild(msg);
        } else { msg.style.display = 'block'; }
    } else {
        if(form) form.style.display = 'block';
        if(msg) msg.style.display = 'none';
    }
}

async function saveHours() {
    if(userRole !== 'admin') return customAlert("Action réservée à l'administrateur.");
    const open = document.getElementById('adminOpenTime').value;
    const close = document.getElementById('adminCloseTime').value;
    if(!open || !close) return await customAlert("Veuillez remplir les deux horaires.");
    
    localStorage.setItem(STORAGE_KEY_HOURS, JSON.stringify({ open, close }));
    addLog('Configuration', `Horaires : ${open} - ${close}`);
    await customAlert("Horaires mis à jour !");
    loadHours();
}

function loadHours() {
    const hours = JSON.parse(localStorage.getItem(STORAGE_KEY_HOURS)) || { open: "09:00", close: "19:00" };
    
    // Admin inputs
    const adminOpen = document.getElementById('adminOpenTime');
    const adminClose = document.getElementById('adminCloseTime');
    if(adminOpen && adminClose) {
        adminOpen.value = hours.open;
        adminClose.value = hours.close;
        if(userRole !== 'admin') { adminOpen.disabled = true; adminClose.disabled = true; }
    }

    // Contact display
    const display = document.getElementById('displayHours');
    if(display) {
        display.innerHTML = `<h4 style="margin:0 0 5px 0;">🕒 Horaires d'ouverture</h4><p style="margin:0;">Lundi - Samedi : ${hours.open} - ${hours.close}</p>`;
    }
}

function exportData() {
    if(userRole !== 'admin') return customAlert("Action réservée à l'administrateur.");
    const data = {
        rdvs: JSON.parse(localStorage.getItem(STORAGE_KEY_RDV)) || [],
        portfolio: JSON.parse(localStorage.getItem(STORAGE_KEY_IMG)) || [],
        hours: JSON.parse(localStorage.getItem(STORAGE_KEY_HOURS)) || { open: "09:00", close: "19:00" },
        logs: JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS)) || [],
        vacation: localStorage.getItem(STORAGE_KEY_VACATION),
        blacklist: JSON.parse(localStorage.getItem(STORAGE_KEY_BLACKLIST)) || [],
        team: JSON.parse(localStorage.getItem(STORAGE_KEY_PROS)) || [],
        prices: JSON.parse(localStorage.getItem(STORAGE_KEY_PRICES)) || DEFAULT_PRICES
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservaPro_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Système', 'Backup téléchargé');
}

async function importData(input) {
    if(userRole !== 'admin') return customAlert("Action réservée à l'administrateur.");
    const file = input.files[0];
    if (!file) return;

    if (!await customConfirm("⚠️ Attention : L'importation va ÉCRASER toutes les données actuelles (RDV et Portfolio). Voulez-vous continuer ?")) {
        input.value = ''; // Reset pour permettre de ré-essayer
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.rdvs || !data.portfolio) throw new Error("Format de fichier invalide (clés manquantes)");

            localStorage.setItem(STORAGE_KEY_RDV, JSON.stringify(data.rdvs));
            localStorage.setItem(STORAGE_KEY_IMG, JSON.stringify(data.portfolio));
            if(data.hours) localStorage.setItem(STORAGE_KEY_HOURS, JSON.stringify(data.hours));
            if(data.logs) localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(data.logs));
            if(data.vacation) localStorage.setItem(STORAGE_KEY_VACATION, data.vacation);
            if(data.blacklist) localStorage.setItem(STORAGE_KEY_BLACKLIST, JSON.stringify(data.blacklist));
            if(data.team) localStorage.setItem(STORAGE_KEY_PROS, JSON.stringify(data.team));
            if(data.prices) {
                localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(data.prices));
                prices = data.prices;
            }
            
            customAlert("Données restaurées avec succès !");
            addLog('Système', 'Restauration effectuée');
            displayAdminRdv();
            displayPortfolio();
            checkTodayRdv();
            updateVacationUI();
            displayBlacklist();
            renderPricingWidget();
            renderTeamManagement();
        } catch (err) { customAlert("Erreur d'importation : " + err.message); }
        input.value = '';
    };
    reader.readAsText(file);
}

// --- PORTFOLIO LOCAL (Base64) ---
document.getElementById('imageInput').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const btnLabel = document.querySelector('.upload-label');
    btnLabel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Traitement...';

    try {
        // Compression de l'image pour ne pas saturer le LocalStorage
        const base64Img = await compressImage(file, 800, 0.7);
        
        const imgs = JSON.parse(localStorage.getItem(STORAGE_KEY_IMG)) || [];
        imgs.push(base64Img);
        localStorage.setItem(STORAGE_KEY_IMG, JSON.stringify(imgs));
        
        addLog('Portfolio', 'Nouvelle photo ajoutée');
        displayPortfolio();
    } catch (err) { await customAlert("Erreur lors de l'ajout de l'image."); console.error(err); }
    finally { btnLabel.innerHTML = '<i class="fa-solid fa-plus"></i> Ajouter une photo'; }
});

// Fonction utilitaire pour compresser l'image avant stockage
function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const ratio = Math.min(maxWidth / img.width, 1);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

function openLightbox(url) {
    const lb = document.getElementById('lightbox');
    lb.innerHTML = `<img src="${url}" alt="Zoom">`;
    lb.classList.add('active');
}

function displayPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    const imgs = JSON.parse(localStorage.getItem(STORAGE_KEY_IMG)) || [];
    
    if (imgs.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Aucune photo pour le moment.</p>';
        return;
    }

    grid.innerHTML = imgs.map((url, i) => `
        <div class="portfolio-item" onclick="openLightbox('${url.replace(/'/g, "\\'")}')">
            <img src="${url}" loading="lazy" alt="Réalisation">
            ${userRole !== 'client' ? `<button class="btn-del" onclick="event.stopPropagation(); deleteImg(${i})" aria-label="Supprimer l'image">×</button>` : ''}
        </div>`
    ).join('');
}

function deleteImg(i) {
    let imgs = JSON.parse(localStorage.getItem(STORAGE_KEY_IMG)) || [];
    imgs.splice(i, 1);
    localStorage.setItem(STORAGE_KEY_IMG, JSON.stringify(imgs));
    addLog('Portfolio', 'Photo supprimée');
    displayPortfolio();
}

document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('themeToggle').innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

function startClock() {
    setInterval(() => {
        const clock = document.getElementById('liveClock');
        if (clock) {
            const now = new Date();
            clock.innerText = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }

        // Calcul temps restant (Pro Dashboard)
        const workLabel = document.getElementById('workTimeLeft');
        if (workLabel) {
            const hours = JSON.parse(localStorage.getItem(STORAGE_KEY_HOURS)) || { open: "09:00", close: "19:00" };
            const [closeH, closeM] = hours.close.split(':').map(Number);
            const [openH, openM] = hours.open.split(':').map(Number);
            
            const now = new Date();
            const closeDate = new Date();
            closeDate.setHours(closeH, closeM, 0, 0);
            const openDate = new Date();
            openDate.setHours(openH, openM, 0, 0);

            let diff = closeDate - now;
            if (now < openDate) diff = closeDate - openDate; // Si avant l'ouverture, affiche la durée totale

            // Gestion Pause Déjeuner (-1h)
            const currentId = typeof getCurrentProId === 'function' ? getCurrentProId() : null;
            if (typeof userRole !== 'undefined' && userRole === 'pro' && currentId && localStorage.getItem('reservaPro_lunch_' + currentId) === 'true') {
                diff -= 3600000; // Retrait d'une heure (ms)
            }

            if (diff <= 0) {
                workLabel.innerText = "Terminé 🎉";
                workLabel.style.color = "var(--success)";
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                workLabel.innerText = `Reste : ${h}h ${m}m`;
            }

            // Barre de progression
            const progressBar = document.getElementById('workProgressBar');
            if (progressBar) {
                const total = closeDate - openDate;
                const elapsed = now - openDate;
                let pct = 0;
                if (now >= closeDate) pct = 100;
                else if (now > openDate) pct = (elapsed / total) * 100;
                
                progressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
                progressBar.style.background = pct >= 100 ? 'var(--success)' : 'var(--primary)';
            }
        }
    }, 1000);
}

window.onload = () => {
    startClock();
    startNatureEffects(); // Démarrage par défaut (Thème Nature)
    displayPortfolio();
    // On ne charge pas les RDV au démarrage pour sécurité, seulement après login admin

    // Empêcher la sélection de dates passées dans le calendrier
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('rdvDate').min = now.toISOString().slice(0, 16);
    checkTodayRdv();
    loadHours();
    populateProSelect(); // Charger la liste des pros dans le formulaire
    updateVacationUI();

    // Attachement optimisé de l'événement de recherche
    document.getElementById('rdvSearch').addEventListener('input', debounce(() => displayAdminRdv(), 300));
    document.getElementById('vipFilter').addEventListener('change', displayAdminRdv);

    // Back to Top Logic
    const btnBackToTop = document.getElementById('btnBackToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) btnBackToTop.classList.add('show');
        else btnBackToTop.classList.remove('show');
    });
    btnBackToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Splash Screen
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
    }, 2000);

    // Gestion du nettoyage après impression
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('print-day-only');
    });
};

function printDayPlanning() {
    // Réinitialiser les filtres pour imprimer l'intégralité du planning du jour
    document.getElementById('rdvSearch').value = '';
    document.getElementById('vipFilter').checked = false;
    displayAdminRdv();

    // Mise à jour de la date dans l'en-tête d'impression
    const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const headerDate = document.getElementById('printHeaderDate');
    if(headerDate) headerDate.innerText = `Planning du ${dateStr}`;

    document.body.classList.add('print-day-only');
    window.print();
}

// Service Worker Registration (à la fin pour la perf)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}