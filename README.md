# ✂️ ReservaPro v2.0 - Réservation avec Rappel Calendrier

ReservaPro est une plateforme complète pour professionnels de la coiffure et de l'esthétique, offrant une gestion autonome des rendez-vous et un portfolio sécurisé.

## 🚀 Nouveautés v2.0
- 📅 **Intégration Calendrier (ICS)** : Un fichier `.ics` est généré à chaque réservation pour permettre au client d'ajouter le rappel dans son agenda (iPhone, Android, Google).
- 📧 **Confirmation par Mail** : Ouverture automatique du logiciel de messagerie avec un message de confirmation pré-rempli.
- 🔐 **Sécurité SHA-256** : Authentification admin hachée pour protéger l'intégrité du portfolio.

## ✨ Fonctionnalités Clés
* ✅ **Booking Intelligent** : Système de réservation avec sélection de services.
* 📷 **Galerie Portfolio** : Importation et gestion de photos de réalisations (réservé admin).
* 🌓 **Mode Sombre** : Interface élégante et adaptative.
* 💾 **Zéro Serveur** : Utilisation exclusive du `LocalStorage` et des API Web natives.
* 📍 **Contact & Map** : Coordonnées et carte interactive.

## 🔒 Administration
Pour éditer le contenu (ajouter des photos, supprimer des RDV) :
1. Cliquez sur **Login**.
2. Mot de passe par défaut : `admin123`.

## 🛠️ Technologies
- **JavaScript ES6+** : Gestion du DOM et des fichiers (Blob, FileReader).
- **Web Crypto API** : Hachage sécurisé SHA-256.
- **CSS Grid & Flexbox** : Design ultra-responsive.