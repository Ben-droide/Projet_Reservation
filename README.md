# ✂️ ReservaPro - Gestion Professionnelle & Portfolio

ReservaPro est une application web légère et sécurisée destinée aux professionnels (coiffeurs, barbiers, soins) pour gérer leurs rendez-vous et présenter leur travail.

## ✨ Fonctionnalités
- 📅 **Gestion des RDV** : Formulaire de réservation avec sélection de services.
- 📷 **Portfolio Administrable** : Galerie interactive pour exposer vos réalisations.
- 🔐 **Sécurité SHA-256** : Authentification par hachage cryptographique pour protéger les fonctions d'édition.
- 📍 **Localisation & Contact** : Intégration Google Maps et liens réseaux sociaux.
- 🌓 **Mode Sombre** : Interface élégante adaptable selon la luminosité.
- 💾 **Données Persistantes** : Utilisation du `LocalStorage` pour une sauvegarde côté client.

## 🔒 Sécurité
L'application utilise l'API **Web Crypto** du navigateur pour hacher le mot de passe admin en SHA-256. 
- **Mot de passe par défaut** : `admin123`
- Le mot de passe n'apparaît jamais en clair dans le code source.

## 🛠️ Technologies
- **Front-end** : HTML5, CSS3 (Grid/Flexbox), JavaScript Vanilla.
- **Design** : Google Fonts (Poppins), FontAwesome 6.
- **Cryptographie** : SHA-256 (Web Crypto API).

## 🚀 Utilisation
1. Clonez le projet ou téléchargez le fichier `index.html`.
2. Ouvrez le fichier dans un navigateur moderne.
3. Pour ajouter des photos ou supprimer des rendez-vous, cliquez sur **Login** et entrez le mot de passe.