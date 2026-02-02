# ✂️ ReservaPro v3.0 - Confidentialité & Productivité

Version professionnelle avec gestion privée des données clients et outils de rappel automatique.

## 🔒 Confidentialité & Sécurité
* **Vie Privée** : La liste des réservations est **totalement masquée** pour les visiteurs. Seul l'administrateur peut la consulter après connexion.
* **Authentification** : Accès admin sécurisé par hachage **SHA-256**.
* **Zéro Fuite** : Les noms des clients ne sont jamais exposés publiquement.

## 🚀 Nouvelles Fonctionnalités
* 🗓️ **Générateur de Calendrier** : Création automatique de fichiers `.ics` pour synchroniser les agendas clients.
* 📧 **Workflow Email** : Déclenchement d'un e-mail de confirmation pré-rempli après chaque réservation.
* 📷 **Portfolio Maîtrisé** : Importation de photos réservée uniquement au propriétaire du site.
* ✅ **Feedback Client** : Message de confirmation visuel après validation du formulaire.

## 🛠️ Utilisation
1. Ouvrez `index.html`.
2. Les clients utilisent le formulaire normalement.
3. Pour voir les rendez-vous ou modifier le portfolio :
   - Cliquez sur **Login**.
   - Mot de passe : `admin123`.

## 💻 Stack Technique
- HTML5, CSS3 (Grid/Flexbox).
- Vanilla JavaScript (ES6+).
- Web Crypto API pour la sécurité.