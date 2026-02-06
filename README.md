# ✂️ ReservaPro v12.5 — Nature & Themes Edition

**ReservaPro** est une application web métier (PWA) conçue pour offrir aux coiffeurs et barbiers une solution de gestion robuste, 100% gratuite et totalement indépendante des abonnements tiers.

---

## 🌟 Pourquoi ReservaPro ?
Contrairement aux solutions classiques (Calendly, Planity), **ReservaPro** a été développée pour maximiser la rentabilité des indépendants en éliminant les frais mensuels tout en offrant des fonctionnalités premium.

## 🚀 Fonctionnalités Clés

### 📅 Réservation Intelligente (Modèle Gratuit)
* **Workflow "Zero Cost"** : Remplacement des outils payants par un système de formulaires dynamiques.
* **Notifications Directes** : Réception des demandes de rendez-vous directement par Mail ou SMS.
* **Confirmation Client** : Expérience utilisateur fluide avec feedback visuel immédiat après envoi.

### 📱 Expérience Mobile Native (PWA)
* **Installation Écran d'Accueil** : Grâce au manifeste PWA, l'application s'installe sur smartphone sans passer par l'App Store ou Google Play.
* **Offline Ready** : Utilisation d'un Service Worker pour permettre la consultation du portfolio même avec une connexion instable.
* **Design Mobile-First** : Interface ultra-rapide et optimisée pour une utilisation à une main.

### 🖼️ Portfolio Local & Performance
* **Stockage 100% Local** : Les photos sont compressées et stockées directement dans le navigateur (LocalStorage) via encodage Base64. Aucune dépendance cloud ni serveur externe.
* **Compression Intelligente** : Algorithme intégré pour optimiser le poids des images à la volée avant stockage.
* **Gestion Autonome** : Ajout et suppression de photos instantanés depuis l'interface admin.
* **Lightbox HD** : Visualisation des réalisations en mode immersion.

### 🎨 Personnalisation & Thèmes
* **Thèmes Dynamiques** : Choix d'ambiance pour les professionnels (Nature 🌿, Girly 🌸, Cyberpunk 🤖, Gothique 🦇).
* **Immersion Sonore** : Effets sonores de connexion adaptés au thème choisi.
* **Effets Visuels** : Animation de feuilles tombantes pour le thème Nature.
* **Profil Pro** : Page de profil publique style "Réseau Social" pour chaque coiffeur (Bio, Stats, Portfolio).

### 🔐 Sécurité
* **Authentification Admin** : Accès au back-office protégé par hachage cryptographique **SHA-256** (Web Crypto API).
* **Gestion des Accès** : Possibilité de modifier le mot de passe administrateur directement depuis l'interface.
* **Gestion d'Équipe** : Le Gérant peut créer des accès individuels pour chaque professionnel (Nom + Mot de passe).
* **Auto-Logout** : Déconnexion automatique après 15 minutes d'inactivité pour protéger l'accès.
* **SuperAdmin** : Protection renforcée pour la suppression des logs (Mot de passe dédié).
* **Protection XSS** : Politique de sécurité de contenu (CSP) stricte pour bloquer les scripts malveillants.
* **Anti-Spam** : Limitation de la fréquence des réservations pour éviter les abus.
* **Backup & Restauration** : Export et Import complet des données (JSON) pour sécuriser ou transférer son activité.
* **Journal d'Activité** : Historique des actions (connexions, modifications, suppressions) visible uniquement par l'admin.
* **Navigation Fluide** : Redirection automatique entre le panneau d'administration et le formulaire lors de l'édition d'un rendez-vous.
* **Contrôle Horaire** : Définition des heures d'ouverture et blocage automatique des réservations hors créneaux.
* **Mode Vacances** : Interrupteur global pour suspendre temporairement la prise de rendez-vous (message personnalisé pour les clients).
* **Badge Intelligent** : L'indicateur de rendez-vous passe au vert lorsque tous les clients de la journée ont été honorés.
* **Animation Live** : Effet de rebond sur le badge de notification lors de l'arrivée d'un rendez-vous urgent (jour même).
* **Rappel SMS** : Bouton d'action rapide pour ouvrir l'application SMS avec un message de rappel pré-rempli (Nom + Date).
* **Horloge Live** : Affichage de l'heure et du temps de travail restant en temps réel avec barre de progression.
* **Pause Déjeuner** : Bouton rapide pour déduire 1h du compteur journalier.
* **Blacklist** : Possibilité de bannir des numéros de téléphone pour empêcher les réservations indésirables.
* **Suivi CA** : Calcul automatique et affichage du chiffre d'affaires estimé de la journée dans le tableau de bord.
* **Graphique Hebdomadaire** : Visualisation interactive des revenus sur les 7 derniers jours.
* **Impression Planning** : Mise en page spécifique avec en-tête personnalisé (Logo + Date) pour imprimer la liste du jour.
* **Tarifs Dynamiques** : Configuration des prix des prestations directement depuis l'interface d'administration.
* **Tags Clients** : Catégorisation visuelle des clients (VIP, Nouveau, Retardataire) visible uniquement par l'admin.
* **Interface Authentification** : Mire de connexion sécurisée et stylisée (Modal) remplaçant les alertes navigateur.
* **Feedback Sonore Login** : Effets sonores "Access Granted" et "Access Denied" lors de la connexion administrateur.

---

## 🛠️ Configuration Technique

### Structure du projet
* `index.html` : Structure HTML de l'application.
* `style.css` : Feuilles de style et thème visuel.
* `script.js` : Logique métier et gestion des événements.
* `manifest.json` : Configuration de l'application mobile installable.
* `sw.js` : Service Worker pour la gestion du cache.

---

## 📦 Installation & Déploiement

1. **Déploiement** : Hébergez le projet sur **GitHub Pages**.
2. **Installation Mobile** : Ouvrez l'URL sur Chrome (Android) ou Safari (iOS) et sélectionnez "Ajouter à l'écran d'accueil".
3. **Administration** : 
    * Cliquez sur **Login**.
    * **Gérant** : Identifiant `admin` / Mot de passe `superadmin123`.
    * **Équipe** : Utilisez le Nom et le Mot de passe définis par le Gérant.
    * *Note : Le mot de passe Gérant est modifiable via le bouton ROOT.*

---

## 👨‍💻 Stack Technique
* **Frontend** : JavaScript Vanilla (ES6+), HTML5, CSS3 (Grid/Flex).
* **Stockage** : LocalStorage API (NoSQL like).

---
© 2026 ReservaPro - Développé par Benoit Renaux.