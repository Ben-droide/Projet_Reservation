# ✂️ ReservaPro v7.0 - Solution Connectée Finale

Application métier pour salon de coiffure/esthétique intégrant la prise de rendez-vous synchronisée et un portfolio cloud.

## 🚀 Fonctionnalités Clés
* **📅 Calendly Integration** : Prise de rendez-vous en temps réel via `benoitrenaux1999/30min`. Les créneaux sont automatiquement bloqués dans l'agenda Google.
* **☁️ Cloudinary Storage** : Stockage permanent des images du portfolio sur le cloud (`dkfbcedvr`). Les images ne sont plus dépendantes du navigateur.
* **🔐 Sécurité SHA-256** : Mode administration verrouillé par mot de passe pour la gestion du portfolio.
* **🌗 Interface Adaptive** : Mode sombre inclus avec persistance visuelle.

## 🛠️ Configuration Technique
* **Cloud Name** : `dkfbcedvr`
* **Upload Preset** : `reservapro_preset` (Mode non-signé)
* **Auth** : Hachage cryptographique côté client.

## 📁 Installation & Déploiement
1. Héberger le fichier `index.html` sur **GitHub Pages**.
2. Accéder à l'interface Admin via le bouton **Login** (Mot de passe : `admin123`).