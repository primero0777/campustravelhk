# Campus Travel H&K : site vitrine

Site multi-pages statique (HTML / CSS / JS vanilla, sans build step) pour l'agence de mobilité
internationale **Campus Travel H&K** (Lomé, Togo).

## Structure

```
index.html            # landing page : hero + teasers condensés de chaque page, avec liens "en savoir plus"
a-propos.html         # Qui sommes-nous (vision/mission/valeurs) + Pourquoi nous choisir + Témoignages
services.html         # les 6 services en détail
destinations.html     # les 6 destinations + tableau comparatif
tarifs.html            # 3 formules d'accompagnement (Essentiel / Complet / Premium)
faq.html              # questions fréquentes (accordéon)
contact.html          # formulaire, coordonnées, carte
mentions-legales.html  # éditeur, hébergement, propriété intellectuelle
cgv.html                # conditions générales de vente
confidentialite.html    # politique de confidentialité (données collectées, droits)
css/style.css          # styles (thème navy/rouge, typographies Fraunces / Manrope / Space Mono / Caveat)
js/script.js            # menu mobile, reveal au scroll, accordéon FAQ, compteur animé, formulaire
assets/logo.svg          # emblème provisoire (chapeau + avion) recréé d'après la description du logo
assets/favicon.svg     # favicon dérivé du même emblème
assets/photos/           # photos libres de droits (Unsplash) utilisées sur le site : voir CREDITS.txt
```

Icônes : [Font Awesome Free](https://fontawesome.com) 6.5.1 via CDN (cdnjs). Seule dépendance externe
avec Google Fonts : le site reste déployable tel quel sur un hébergement mutualisé.

Chaque page interne réutilise le même header/footer/bouton WhatsApp (dupliqués par fichier, comme
c'est la norme sur un site statique multi-pages sans moteur de template) mais le **contenu** n'est
rédigé qu'à un seul endroit : la landing page ne fait que teaser chaque section avec un texte plus
court et un lien « en savoir plus » vers la page dédiée, pour éviter toute répétition de contenu.

Les 3 pages légales (`mentions-legales.html`, `cgv.html`, `confidentialite.html`) ne sont pas dans
la navigation principale (déjà chargée avec 6 entrées) mais accessibles depuis le bas de chaque
footer, comme c'est l'usage. Ce sont des **modèles rédigés à titre indicatif** : chacune affiche un
encadré rouge en haut de page rappelant qu'elles doivent être relues et validées par un
professionnel du droit avant mise en ligne, et complétées avec les informations exactes de l'agence
(forme juridique, numéro RCCM/NIF, hébergeur, modalités de paiement, durée de conservation des
données). Elles sont marquées `noindex` pour ne pas être indexées par les moteurs de recherche tant
qu'elles n'ont pas été validées.

## Placeholders à remplacer avant mise en ligne

- **Logo** : `assets/logo.svg` et `assets/favicon.svg` sont une reconstitution approximative du
  logo décrit (chapeau universitaire + avion formant un cercle). À remplacer par le fichier logo
  réel du client (idéalement en SVG) dès qu'il est disponible.
- **Taux de réussite visa** : affiché en placeholder à **96 %**, attribut `data-target` sur
  `.stat-number` (répété sur `index.html` en teaser et `a-propos.html#pourquoi` en détail : bien
  mettre à jour les deux une fois le vrai chiffre confirmé avec l'agence).
- **Témoignages** : les 3 témoignages de `a-propos.html` (dont un reprix en teaser sur `index.html`)
  sont rédigés à titre d'exemple (clairement signalés à l'écran par une note). À remplacer par des
  avis clients réels, avec l'accord des personnes citées.
- **Photos** : le site utilise 8 photos libres de droits (licence Unsplash, usage commercial
  autorisé, aucune attribution obligatoire : voir `assets/photos/CREDITS.txt` pour le détail) :
  une photo d'ambiance dans le Hero, une photo dans « Qui sommes-nous », et une photo par
  destination. À remplacer par des photos propres à l'agence (locaux, équipe, événements) dès
  qu'elles sont disponibles, en gardant les mêmes noms de fichiers dans `assets/photos/` pour
  ne rien casser.
- **Avatars témoignages** : les initiales colorées (au lieu de vraies photos) sont un choix
  délibéré tant que les témoignages restent fictifs : associer la photo d'un vrai inconnu à un
  faux nom/avis aurait donné l'impression trompeuse qu'une personne réelle identifiable
  cautionne l'agence. À remplacer par de vraies photos une fois de vrais témoignages clients
  obtenus (avec leur accord).
- **Réseaux sociaux** : les icônes Facebook / Instagram / LinkedIn du footer pointent vers `#`
  en attendant les liens réels.
- **Tarifs** : `tarifs.html` affiche 3 formules avec des montants **fictifs** (250 € / 450 € / 750 €)
  demandés à titre d'exemple provisoire, clairement signalés par un astérisque et une note en bas
  de page. À remplacer par la vraie grille tarifaire de l'agence (et à voir si le client souhaite
  afficher des prix fixes en FCFA, une fourchette, ou rester en « sur devis » uniquement).
- **Formulaire de contact** : fonctionne actuellement via un lien `mailto:` pré-rempli (solution
  sans backend, adaptée à un hébergement mutualisé basique). Pour un envoi plus fiable sans
  dépendre du client mail du visiteur, prévoir une intégration Formspree ou EmailJS (quelques
  lignes à modifier dans `js/script.js`, section « Formulaire de contact »).
- **Carte Google Maps** : l'embed pointe sur une recherche générale « Agoé Minamadou, Lomé,
  Togo ». À affiner avec les coordonnées GPS exactes du local si disponibles, pour un pointeur
  plus précis.

## Aperçu local

```bash
python -m http.server 8000
# puis ouvrir http://localhost:8000
```
