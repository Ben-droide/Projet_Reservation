# ✂️ ReservaPro - Plateforme de Réservation & Portfolio

Application web moderne pour professionnels permettant de gérer des rendez-vous, d'exposer ses créations et de faciliter le contact client.

## ✨ Fonctionnalités
* 📅 **Réservation dynamique** : Prise de rendez-vous fluide avec choix du service et de l'horaire.
* 📷 **Portfolio Interactif** : Galerie d'images permettant d'exposer vos travaux.
* 🔐 **Système d'Authentification** : Mode Administrateur sécurisé par mot de passe pour gérer les contenus (Ajout/Suppression).
* 🌓 **Mode Sombre** : Interface adaptable pour un confort visuel optimal.
* 📍 **Contact & Map** : Coordonnées professionnelles et carte interactive Google Maps intégrée.
* 💾 **Persistance locale** : Sauvegarde des données via `LocalStorage` (pas besoin de base de données externe).
* 📱 **Design Responsive** : Expérience fluide sur smartphones, tablettes et ordinateurs.

## 🛠️ Installation
1. Clonez le dépôt.
2. Ouvrez `index.html` dans votre navigateur.
3. Pour accéder aux fonctions de gestion :
   - Cliquez sur **Login**.
   - Entrez le mot de passe par défaut : `admin123`.

   ## 🔒 Sécurité & Confidentialité
* **Authentification** : Accès administrateur protégé par hachage SHA-256 via l'API Web Crypto.
* **Intégrité** : Le mot de passe n'est jamais stocké en clair dans le code source.
* **Limitation** : Système basé sur le client (Front-end), idéal pour un usage personnel et la protection contre les erreurs de manipulation des visiteurs.

## 🚀 Technologies
- HTML5 / CSS3 (Grid & Flexbox)
- JavaScript Vanilla (ES6)
- FontAwesome (Iconographie)
- Google Fonts (Poppins)