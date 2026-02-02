# ✂️ ReservaPro v7.0 — Plateforme de Réservation & Portfolio Cloud

**ReservaPro** est une solution web "tout-en-un" conçue pour les professionnels de la coiffure et de l'esthétique. Elle combine une prise de rendez-vous synchronisée en temps réel et une galerie de réalisations administrable via le cloud.

---

## 🚀 Fonctionnalités Clés

### 📅 Gestion des Réservations
* **Intégration Calendly** : Synchronisation bidirectionnelle avec Google Calendar et Outlook via votre lien personnel (`benoitrenaux1999/30min`).
* **Verrouillage en Temps Réel** : Les créneaux réservés sont instantanément bloqués pour éviter les doublons.
* **Multi-Services** : Gestion centralisée de tous vos types de soins (Coupe, Barbe, Soin) avec durées variables.

### ☁️ Portfolio Cloud & Persistance
* **Stockage Cloudinary** : Les images sont hébergées sur des serveurs cloud dédiés (`dkfbcedvr`), garantissant une visibilité universelle.
* **Optimisation Automatique** : Compression et redimensionnement des photos pour un chargement fluide sur mobile.
* **Liste Permanente** : Intégration des liens directs dans le code pour que tous les clients voient vos réalisations sans exception.

### 🔐 Sécurité & Confidentialité
* **Authentification Admin** : Accès aux fonctions d'édition protégé par un hachage cryptographique **SHA-256** (Web Crypto API).
* **Confidentialité** : Les outils de gestion (ajout/suppression) sont masqués pour les visiteurs.

### 🌗 Expérience Utilisateur
* **Mode Sombre (Dark Mode)** : Interface moderne et adaptative.
* **Design Mobile-First** : Application entièrement responsive pour une utilisation sur smartphone.
* **Contact & Accès** : Carte Google Maps interactive et liens vers Instagram / TikTok.

---

## 🛠️ Configuration Technique

### 1. Configuration Cloudinary
Pour que l'upload fonctionne, le projet utilise :
* **Cloud Name** : `dkfbcedvr`
* **Upload Preset** : `reservapro_preset` (configuré en mode **"Non signé"** dans Cloudinary).

### 2. Installation & Déploiement
1.  Hébergez le fichier `index.html` via **GitHub Pages**.
2.  Pour l'administration :
    * Cliquez sur **Login**.
    * Entrez le mot de passe : `admin123`.

### 3. Mise à jour des photos publiques
Pour que vos photos soient visibles par tous (et pas seulement sur votre navigateur), copiez les URLs de vos images Cloudinary dans la variable `IMAGES_PERMANENTES` du fichier `index.html`.

---

## 📦 Technologies Utilisées
* **Frontend** : HTML5, CSS3 (Grid & Flexbox), JavaScript Vanilla (ES6+).
* **APIs** : Calendly Inline Widget, Cloudinary Media API.
* **Sécurité** : Web Crypto API (SubtleCrypto).
* **Icons & Fonts** : FontAwesome 6, Google Fonts (Poppins).

---
© 2024 ReservaPro - Développé pour Benoit Renaux.