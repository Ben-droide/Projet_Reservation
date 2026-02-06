# ✂️ ReservaPro v10.2 — Solution 100% Locale & Autonome

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

### ☁️ Portfolio Cloud & Scalabilité
* **Cloudinary Media API** : Hébergement des photos de réalisations sur un serveur cloud dédié (`dkfbcedvr`).
* **Architecture Multi-Salons** : Gestion de plusieurs établissements via une seule base de code et des paramètres d'URL dynamiques (ex: `?salon=evry`).
* **Upload en temps réel** : L'administrateur peut uploader ses photos directement depuis son poste de travail.
* **Lightbox HD** : Visualisation des réalisations en haute définition au clic.

### 🔐 Sécurité
* **Authentification Admin** : Accès au back-office protégé par hachage cryptographique **SHA-256** (Web Crypto API).
* **Gestion des Accès** : Possibilité de modifier le mot de passe administrateur directement depuis l'interface.
* **Backup & Restauration** : Export et Import complet des données (JSON) pour sécuriser ou transférer son activité.
* **Navigation Fluide** : Redirection automatique entre le panneau d'administration et le formulaire lors de l'édition d'un rendez-vous.
* **Contrôle Horaire** : Définition des heures d'ouverture et blocage automatique des réservations hors créneaux.

---

## 🛠️ Configuration Technique

### Structure du projet
* `index.html` : L'interface principale et la logique applicative.
* `manifest.json` : Configuration de l'application mobile installable.
* `sw.js` : Service Worker pour la gestion du cache.

---

## 📦 Installation & Déploiement

1. **Déploiement** : Hébergez le projet sur **GitHub Pages**.
2. **Installation Mobile** : Ouvrez l'URL sur Chrome (Android) ou Safari (iOS) et sélectionnez "Ajouter à l'écran d'accueil".
3. **Administration** : 
    * Cliquez sur **Login**.
    * Mot de passe par défaut : `admin123`.
    * *Note : Vous pouvez changer ce mot de passe dans l'onglet Admin (icône clé).*

---

## 👨‍💻 Stack Technique
* **Frontend** : JavaScript Vanilla (ES6+), HTML5, CSS3 (Grid/Flex).
* **Stockage** : LocalStorage API (NoSQL like).

---
© 2026 ReservaPro - Développé par Benoit Renaux.