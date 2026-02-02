✂️ ReservaPro v7.0 — Plateforme de Réservation & Portfolio Cloud
ReservaPro est une solution web "tout-en-un" conçue pour les professionnels de la coiffure et de l'esthétique. Elle combine une prise de rendez-vous synchronisée en temps réel et une galerie de réalisations administrable via le cloud.

🚀 Fonctionnalités Clés
📅 Gestion des Réservations
Intégration Calendly : Synchronisation bidirectionnelle avec Google Calendar et Outlook via votre lien personnel (benoitrenaux1999/30min).

Verrouillage en Temps Réel : Les créneaux réservés sont instantanément bloqués pour éviter les doublons.

Multi-Services : Possibilité de gérer plusieurs types de soins avec des durées et tarifs variables.

☁️ Portfolio Cloud & Persistance
Stockage Cloudinary : Les images sont hébergées sur des serveurs cloud dédiés (dkfbcedvr), garantissant qu'elles soient visibles par tous les visiteurs sur n'importe quel appareil.

Optimisation Automatique : Compression et redimensionnement des photos pour un chargement ultra-rapide.

Gestion Permanente : Les liens d'images sont inscrits dans le code (IMAGES_PERMANENTES) pour une visibilité publique totale.

🔐 Sécurité & Confidentialité
Authentification Admin : Accès aux fonctions d'édition protégé par un hachage cryptographique SHA-256 (Web Crypto API).

Confidentialité des Données : Les informations sensibles et les outils de gestion ne sont visibles que par l'administrateur connecté.

🌗 Expérience Utilisateur
Mode Sombre (Dark Mode) : Interface moderne et adaptative pour un confort visuel optimal.

Design Mobile-First : Application entièrement responsive, fluide sur smartphones, tablettes et ordinateurs.

Contact & Accès : Localisation GPS via Google Maps et liens directs vers les réseaux sociaux (Instagram, TikTok).

🛠️ Configuration Technique
Prérequis Cloudinary
Pour que l'upload fonctionne, assurez-vous d'avoir :

Un compte Cloudinary actif.

Un Upload Preset configuré en mode "Unsigned" (Non signé) nommé reservapro_preset.

Le Cloud Name configuré sur dkfbcedvr dans le script.

Installation
Clonez ce dépôt ou téléchargez le fichier index.html.

Ouvrez le fichier dans un navigateur ou hébergez-le via GitHub Pages.

Pour accéder au mode administrateur :

Cliquez sur le bouton Login dans la barre de navigation.

Entrez le mot de passe par défaut : admin123.

📦 Technologies Utilisées
Langages : HTML5, CSS3 (Grid & Flexbox), Vanilla JavaScript (ES6+).

APIs Externes : Calendly API, Cloudinary Upload API.

Sécurité : SHA-256 Hashing via crypto.subtle.

Design : FontAwesome 6, Google Fonts (Poppins).