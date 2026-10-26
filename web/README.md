# Batobaye Market — panier Offline-First (TP e-business)

Projet pédagogique React + Vite pour illustrer la comparaison de performances et la résilience d'un mini-site e-commerce.

## 1. Ce que contient la démo

- Catalogue de 7 familles : réfrigérateurs, congélateurs, climatiseurs, machines à laver, cuisinières à gaz, plaques à gaz et ventilateurs rechargeables.
- Recherche et filtres par catégorie.
- Ajout, suppression et modification des quantités du panier.
- Panier enregistré dans `localStorage` : il reste présent après rechargement et sans connexion, sur le même navigateur/appareil.
- Service Worker qui met en cache le shell de l'application et les ressources locales après leur première visite.
- Bandeau qui signale l'état en ligne/hors ligne.
- Formulaire de commande de démonstration : **aucune commande n'est réellement envoyée** et aucun paiement n'est exécuté.
- Visuels SVG originaux et locaux pour que la démonstration s'affiche sans dépendre d'images distantes. Ce sont des illustrations, pas des photos de produits réels.

## 2. Prérequis

- Node.js 20 LTS ou plus récent
- npm
- Visual Studio Code
- Un navigateur moderne (Chrome ou Edge conseillé)

## 3. Exécuter dans VS Code

1. Décompresser `batobaye-offline-shop.zip`.
2. Ouvrir le dossier `batobaye-offline-shop` dans VS Code.
3. Ouvrir Terminal > New Terminal.
4. Exécuter :

```bash
npm install
npm run dev
```

5. Ouvrir l'URL affichée par Vite, généralement `http://localhost:5173`.

Pour tester le Service Worker et le mode hors ligne de façon fiable, lancer une version de production locale :

```bash
npm run build
npm run preview
```

Ouvrir l'URL indiquée par `vite preview`, attendre le chargement complet, puis dans Chrome DevTools > Network, cocher **Offline** et recharger. Les ressources déjà mises en cache devraient rester accessibles. Un premier chargement sans réseau ne peut pas être garanti : l'application doit d'abord avoir été chargée au moins une fois en ligne.

## 4. Analyse fonctionnelle et technique

### Besoin
L'application simule un catalogue de commerce électronique. Le scénario critique est le panier : l'utilisateur doit pouvoir consulter les articles et ajuster les quantités même si le réseau est interrompu.

### Architecture de la démo
- `src/main.jsx` : interface, catalogue, filtres, panier et persistance locale.
- `src/styles.css` : design responsive desktop/mobile.
- `public/products/*.svg` : images locales.
- `public/sw.js` : stratégie de cache du shell et des ressources same-origin.
- `public/manifest.webmanifest` : métadonnées installables de la PWA.
- `localStorage` : sauvegarde du panier côté navigateur.

### Limites à expliquer à l'enseignant
1. `localStorage` est adapté à un panier léger, mais il est synchrone et limité en capacité. Pour un catalogue/stock volumineux, préférer IndexedDB.
2. Le panier est local à un navigateur et un appareil ; il n'est pas synchronisé entre appareils.
3. La démo ne confirme pas les prix, les stocks, les paiements ou les commandes auprès d'un serveur. En production, le serveur doit recalculer les prix et vérifier le stock.
4. Le cache ne rend pas magiquement le serveur accessible hors ligne. Il permet de relire l'interface et les ressources déjà téléchargées. Les opérations serveur doivent être mises en file puis synchronisées à la reconnexion.
5. Pour une commande hors ligne réelle, enregistrer une intention de commande dans IndexedDB avec un identifiant unique, afficher clairement « en attente de synchronisation », puis envoyer au serveur lors du retour réseau. Prévoir idempotence, gestion des conflits de stock et confirmation serveur.
6. Les illustrations SVG sont originales et locales, conçues pour la maquette. Avant un site commercial, remplacer par des photos de produits authentiques dont les droits d'utilisation sont établis.

## 5. Plan de test manuel Offline-First

| Test | Procédure | Résultat attendu |
|---|---|---|
| Panier persistant | Ajouter 2 produits, recharger | Quantités conservées |
| Fermeture/réouverture | Ajouter, fermer l'onglet, revenir | Panier conservé dans le même navigateur |
| Coupure réseau | Après le premier chargement, DevTools > Network > Offline | Interface et images déjà cachées disponibles |
| Ajout hors ligne | Ajouter un article hors ligne | Panier mis à jour dans localStorage |
| Retour réseau | Désactiver Offline | Le bandeau revient à l'état en ligne |
| Cache froid | Effacer les données du site et se mettre hors ligne | Le site ne peut pas être garanti accessible avant une nouvelle visite en ligne |

## 6. Apache JMeter — objectif 500 utilisateurs concurrents

### Point important
JMeter doit tester un **endpoint HTTP serveur** représentant le panier, par exemple `POST /api/cart/items` ou `GET /api/cart`. Cette démo front-end seule ne possède pas d'API ; lancer 500 utilisateurs sur `localhost:5173` ne mesure que le serveur statique, pas la logique métier du panier. Ne pas annoncer un test backend réussi tant qu'un backend réel n'est pas installé.

### Configuration de départ
- Thread Group : 500 threads (utilisateurs virtuels)
- Ramp-up : 50 secondes (environ 10 utilisateurs démarrés par seconde)
- Loop Count : 5 pour un premier essai
- HTTP Request Defaults : URL de l'API de test
- HTTP Header Manager : `Content-Type: application/json`, jeton de test si requis
- HTTP Request : POST panier avec corps JSON réaliste
- Assertions : codes attendus (200/201), JSON de réponse, temps maximal acceptable défini par le cours
- Listeners pour l'analyse locale : Summary Report et Aggregate Report ; éviter d'activer trop de listeners graphiques pendant un gros test
- Exécuter en ligne de commande pour un essai sérieux :

```bash
jmeter -n -t tests/cart-load-test.jmx -l results/cart-results.jtl -e -o results/html-report
```

### Mesures à rapporter
- Throughput (requêtes/seconde)
- Temps de réponse médian, p90, p95 et maximum
- Taux d'erreur
- Latence de connexion
- Ressources serveur (CPU, mémoire, connexions DB)
- Résultats avant/après cache, avec le même scénario et la même charge

### Comparaison juste
- **Scénario A :** cache applicatif désactivé.
- **Scénario B :** cache applicatif activé, même dataset et même charge.
- Comparer p95, débit et taux d'erreur. Préciser ce qui est mis en cache (catalogue, session, calcul panier, etc.). Le cache navigateur ne remplace pas un cache serveur et ne diminue pas forcément le coût d'un POST panier.

### Sécurité / robustesse
- Ne lancer 500 threads que sur une application de test que vous possédez ou pour laquelle vous avez une autorisation explicite.
- Ne jamais charger le site public d'un tiers sans autorisation.
- Garder les prix et le stock autoritatifs côté serveur ; valider les entrées et utiliser des clés d'idempotence pour les commandes.

## 7. Déploiement

### Option simple : Vercel ou Netlify
1. Créer un dépôt Git et y pousser ce dossier.
2. Importer le dépôt dans Vercel/Netlify.
3. Build command : `npm run build`.
4. Output directory : `dist`.
5. Déployer en HTTPS. Le Service Worker exige un contexte sécurisé en production (HTTPS), avec l'exception habituelle de `localhost` pour le développement.

### Option serveur personnel
```bash
npm install
npm run build
```
Servir le contenu de `dist/` par Nginx/Apache en HTTPS. Configurer le fallback SPA vers `index.html` si vous ajoutez plus tard un routeur. Pour une vraie API, déployer le backend séparément, utiliser des variables d'environnement côté serveur et configurer CORS correctement.

## 8. Sources techniques à citer dans le rapport
- React : https://react.dev/
- Vite : https://vite.dev/guide/
- MDN localStorage : https://developer.mozilla.org/docs/Web/API/Window/localStorage
- MDN Service Worker API : https://developer.mozilla.org/docs/Web/API/Service_Worker_API
- MDN Offline and background operation : https://developer.mozilla.org/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
- Apache JMeter : https://jmeter.apache.org/usermanual/


### Images de produits
Le catalogue utilise désormais des photographies hébergées sur Unsplash via des URL HTTPS. Une connexion Internet est nécessaire pour les charger lors de la première visite. Pour une démonstration Offline-First fiable, télécharge des images dont la licence permet cet usage dans `public/products/`, puis remplace les URL par des chemins locaux et ajoute-les au précache du Service Worker. Les photos illustrent les catégories et ne garantissent pas les modèles exacts indiqués dans les noms/prix de démonstration.

## Navigation vers la fiche détaillée d'un produit

Le bouton de chaque carte produit ouvre maintenant une fiche dédiée (`#produit/p1`, `#produit/p2`, etc.) avec description, prix, marque, caractéristiques connues, disponibilité/livraison à confirmer et contact du magasin. Depuis cette fiche, le bouton **Ajouter au panier** ajoute effectivement le produit au panier local et ouvre le récapitulatif du panier. Le panier est toujours sauvegardé dans `localStorage`.

**Important :** les descriptions et caractéristiques de ce projet sont une démonstration pédagogique. Les données qui ne sont pas confirmées sont explicitement signalées ; vérifiez les références et spécifications réelles avant une mise en production.
