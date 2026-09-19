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
404.html                 # page d'erreur personnalisée (reconnue automatiquement par GitHub Pages)
robots.txt                # autorise l'indexation, référence le sitemap
sitemap.xml                # les 7 pages indexables (hors pages légales et 404, en noindex)
css/style.css          # styles (thème navy/rouge, typographies Fraunces / Manrope / Space Mono / Caveat)
js/script.js            # menu mobile, reveal au scroll, accordéon FAQ, compteur animé, formulaire
assets/logo.png          # vrai logo de l'agence · assets/logo-white.png : version blanche (fond sombre)
assets/favicon.png     # favicon dérivé du même emblème
assets/photos/           # photos utilisées sur le site : voir CREDITS.txt pour le détail et les sources
```

Icônes : [Font Awesome Free](https://fontawesome.com) 6.5.1 via CDN (cdnjs). Seule dépendance externe
avec Google Fonts : le site reste déployable tel quel sur un hébergement mutualisé.

Deux blocs CSS réutilisables (`.page-intro` et `.highlight-block` dans `css/style.css`) servent à
associer texte + photo sur plusieurs pages (`services.html`, `destinations.html`, `tarifs.html`,
`faq.html`) sans dupliquer de styles page par page. Les visuels de posts réseaux sociaux fournis
par l'agence sont utilisés à deux endroits : en galerie complète (avec visionneuse au clic) sur
`index.html`, et individuellement en illustration sur la page dont le sujet correspond (visa sur
`faq.html`, logement sur `services.html`, Campus France sur `destinations.html`).

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

- **Logo** : `assets/logo.png`, `assets/logo-white.png` et `assets/favicon.png` sont le vrai logo
  de l'agence (fourni le 2026-09-17), recadré serré sur l'emblème. Plus un placeholder, rien à
  faire ici, sauf si l'agence fournit un jour une version vectorielle (SVG) à la place du PNG actuel.
- **Taux de réussite visa** : affiché en placeholder à **96 %**, attribut `data-target` sur
  `.stat-number` (répété sur `index.html` en teaser et `a-propos.html#pourquoi` en détail : bien
  mettre à jour les deux une fois le vrai chiffre confirmé avec l'agence).
- **Témoignages** : les 6 témoignages de `a-propos.html` (un par destination) sont rédigés à titre
  d'exemple. À remplacer par des avis clients réels, avec l'accord des personnes citées.
- **Photos** : le site combine des photos libres de droits (Unsplash) pour 5 des 6 destinations, et
  des photos neutres générées par IA (sans personne réelle identifiable) fournies par l'agence pour
  les autres usages (about-campus.jpg, dest-france.jpg, success-graduate-eiffel.jpg, etc.), voir
  `assets/photos/CREDITS.txt` pour le détail complet. À remplacer par de vraies photos de l'agence
  (locaux, équipe, événements, vrais clients) dès qu'elles sont disponibles, en gardant les mêmes
  noms de fichiers dans `assets/photos/` pour ne rien casser.
- **Avatars témoignages** : les initiales colorées (au lieu de vraies photos) sont un choix
  délibéré tant que les témoignages restent fictifs : associer la photo d'un vrai inconnu à un
  faux nom/avis aurait donné l'impression trompeuse qu'une personne réelle identifiable
  cautionne l'agence. À remplacer par de vraies photos une fois de vrais témoignages clients
  obtenus (avec leur accord).
- **Réseaux sociaux** : les icônes Facebook / Instagram / TikTok / LinkedIn / YouTube du footer pointent vers
  les vrais profils de l'agence (mis à jour le 2026-09-17). Rien à faire ici, sauf si l'agence
  change de handle sur l'une de ces plateformes.
- **Tarifs** : `tarifs.html` affiche 3 formules sans montant chiffré (« Sur devis » sur chaque
  carte), à la demande du client qui ne souhaite pas communiquer de prix publiquement. Si ça
  change, il suffit de remplacer le texte « Sur devis » de `.price-amount` par un montant dans
  chacune des 3 cartes.
- **Formulaire de contact** : fonctionne actuellement via un lien `mailto:` pré-rempli (solution
  sans backend, adaptée à un hébergement mutualisé basique). Pour un envoi plus fiable sans
  dépendre du client mail du visiteur, prévoir une intégration Formspree ou EmailJS (quelques
  lignes à modifier dans `js/script.js`, section « Formulaire de contact »).
- **Carte Google Maps** : l'embed pointe sur les coordonnées GPS exactes du local (fournies par
  l'agence via un lien Google Maps), pas une recherche approximative par quartier. Rien à faire ici
  sauf déménagement.

## SEO et domaine personnalisé

Le domaine `campustravelhk.com` est acquis mais pas encore branché. `sitemap.xml`, `robots.txt`
et le fichier `CNAME` sont déjà préparés pour ce domaine (plus besoin d'y retoucher une fois le
DNS configuré). Si une page est ajoutée ou retirée plus tard, penser à mettre à jour `sitemap.xml`
en conséquence.

Pour activer le domaine, deux étapes restent à faire **côté registrar / hébergeur du domaine**
(hors de portée de ce dépôt) :

1. **Chez le registrar de `campustravelhk.com`** : ajouter les enregistrements DNS pointant vers
   GitHub Pages :
   - 4 enregistrements `A` sur le domaine racine (`@`) vers `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - un enregistrement `CNAME` sur `www` vers `primero0777.github.io` (optionnel, si `www.campustravelhk.com` doit aussi fonctionner)
2. **Dans les réglages GitHub Pages du dépôt** (Settings → Pages) : renseigner `campustravelhk.com`
   comme domaine personnalisé (le fichier `CNAME` du dépôt le fait déjà à moitié, GitHub demande
   souvent de confirmer côté interface) puis cocher « Enforce HTTPS » une fois le certificat
   généré automatiquement (peut prendre de quelques minutes à quelques heures après la
   propagation DNS).

En attendant, le site reste accessible sur `https://primero0777.github.io/campustravelhk/`.

## Aperçu local

```bash
python -m http.server 8000
# puis ouvrir http://localhost:8000
```
