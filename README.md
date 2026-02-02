# ✂️ ReservaPro v9.0 — L'Écosystème Digital pour Salons de Coiffure

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

### 🔐 Sécurité
* **Authentification Admin** : Accès au back-office protégé par hachage cryptographique **SHA-256** (Web Crypto API).
* **Confidentialité** : Les fonctions d'édition et la liste des rendez-vous sont invisibles pour les visiteurs.

---

## 🛠️ Configuration Technique

### Structure du projet
* `index.html` : L'interface principale et la logique applicative.
* `manifest.json` : Configuration de l'application mobile installable.
* `sw.js` : Service Worker pour la gestion du cache.

### Variables Cloudinary
* **Cloud Name** : `dkfbcedvr`
* **Upload Preset** : `reservapro_preset` (Mode : Unsigned)

---

## 📦 Installation & Déploiement

1. **Déploiement** : Hébergez le projet sur **GitHub Pages**.
2. **Installation Mobile** : Ouvrez l'URL sur Chrome (Android) ou Safari (iOS) et sélectionnez "Ajouter à l'écran d'accueil".
3. **Administration** : 
    * Cliquez sur **Login**.
    * Mot de passe par défaut : `admin123`.

---

## 👨‍💻 Stack Technique
* **Frontend** : JavaScript Vanilla (ES6+), HTML5, CSS3 (Grid/Flex).
* **APIs** : Cloudinary API, Web Crypto API.
* **PWA** : Service Workers, Web App Manifest.

---
© 2026 ReservaPro - Développé par Benoit Renaux.