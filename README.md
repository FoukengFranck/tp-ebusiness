# Batobaye Market — Plateforme E-Commerce PWA et API REST Laravel

## Introduction et Objectif du Projet

Batobaye Market est une application e-commerce conçue pour répondre à deux grands défis du web moderne :
1. **La gestion de la forte affluence (Montée en charge)** : Empêcher qu'un produit soit vendu en double ou que le stock devienne négatif lorsque plusieurs clients achètent le même article au même moment.
2. **Le mode hors-ligne (Offline-First)** : Permettre aux clients de naviguer et de préparer leurs achats même si la connexion internet saute, avec une synchronisation automatique dès que le réseau revient.

---

## Explication Simple : Comment le système gère 2 clients qui achètent le dernier produit en même temps ?

Imagine qu'il ne reste plus qu'**un seul téléviseur en stock (stock = 1)**. Deux clients (Client A et Client B) cliquent exactement à la même milliseconde sur "Confirmer la commande".

Sans protection, les deux clients verraient qu'il reste 1 article, les deux commandes passeraient, et le stock passerait à `-1` (ce qui est une erreur grave en e-commerce).

### Notre solution (Le verrou pessimiste et la transaction) :
* Lorsque le **Client A** clique, le système Laravel pose immédiatement un **cadenas invisible (verrou)** sur la ligne de ce produit en base de données MySQL.
* Le **Client B**, qui a cliqué en même temps, est automatiquement mis en pause (file d'attente) pendant une fraction de seconde par le moteur de base de données.
* Le Client A achète le produit : le stock passe de 1 à 0, la commande est validée, et le cadenas est retiré.
* Le **Client B** sort de sa pause, regarde de nouveau le stock, voit qu'il est désormais à `0`, et le système lui affiche proprement : *"Stock insuffisant"*. 

De cette façon, **zéro erreur de stock n'est possible**, même avec des centaines de personnes connectées en même temps.

---

## Structure du Projet

```text
tp-ebusiness/
├── api/                  # Backend Laravel 11 (API REST et base de données MySQL)
├── web/                  # Frontend React PWA (Interface utilisateur)
└── README.md             # Documentation générale du projet
```

---

## Prérequis Techniques

Avant de commencer l'installation, assurez-vous d'avoir installé :
* **PHP** (version 8.2 ou supérieure)
* **Composer** (gestionnaire de paquets pour PHP)
* **Node.js et npm** (pour l'interface React)
* **MySQL** ou MariaDB (système de gestion de base de données, via XAMPP, WampServer ou autonome)
* **Apache JMeter** (logiciel de test de charge)

---

## Étape par Étape : Procédure d'Installation et Démarrage

### 1. Création de la Base de Données MySQL

1. Lancez votre serveur MySQL (par exemple via XAMPP ou WampServer).
2. Ouvrez votre outil de gestion MySQL (phpMyAdmin ou terminal MySQL).
3. Exécutez la commande SQL suivante pour créer la base de données :
   ```sql
   CREATE DATABASE e_commerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

### 2. Démarrage du Backend (API Laravel)

Ouvrez un premier terminal à la racine du projet (`tp-ebusiness`) et exécutez les commandes suivantes :

```bash
# 1. Accéder au dossier backend
cd api

# 2. Installer les dépendances PHP
composer install

# 3. Créer le fichier de configuration local .env
cp .env.example .env

# 4. Générer la clé de sécurité Laravel
php artisan key:generate

# 5. Configurer les accès MySQL dans le fichier .env
# Ouvrez le fichier .env et vérifiez/modifiez les lignes suivantes :
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=e_commerce_db
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Exécuter les migrations et charger les données de test (Products Seeder)
php artisan migrate --seed

# 7. Démarrer le serveur API Laravel
php artisan serve --port=8001
```

*Le serveur API Laravel sera accessible sur : `http://127.0.0.1:8001`*

---

### 3. Démarrage du Frontend (React PWA)

Ouvrez un **deuxième terminal** à la racine du projet (`tp-ebusiness`), puis exécutez :

```bash
# 1. Accéder au dossier frontend
cd web

# 2. Installer les dépendances JavaScript
npm install

# 3. Lancer le serveur de développement Vite
npm run dev
```

*L'application web React sera accessible sur : `http://localhost:5173`*

---

## Route API Principale pour les Tests

| Méthode | Route / Endpoint API | Description |
| :--- | :--- | :--- |
| `POST` | `http://127.0.0.1:8001/api/cart/add` | Ajout au panier / Validation de commande avec verrouillage atomique |

---

## Guide pour le Testeur : Protocole de Test de Charge avec Apache JMeter

Ce protocole permet de simuler **500 requêtes d'achat simultanées** pour prouver la résistance du système face aux accès concurrents.

### Route API exacte à tester dans JMeter
* **URL** : `http://127.0.0.1:8001/api/cart/add`
* **Méthode HTTP** : `POST`

---

### Instructions Pas à Pas dans Apache JMeter

1. Démarrez **Apache JMeter**.
2. Créez un **Thread Group** (Groupe d'utilisateurs) :
   * Clic droit sur *Test Plan* > *Add* > *Threads (Users)* > **Thread Group**.
   * **Number of Threads (Users)** : `500`
   * **Ramp-up period (seconds)** : `1` (Déclenchement quasi-simultané).
   * **Loop Count** : `1`.

3. Ajoutez le gestionnaire d'en-tête HTTP (**HTTP Header Manager**) :
   * Clic droit sur *Thread Group* > *Add* > *Config Element* > **HTTP Header Manager**.
   * Cliquez sur **Add** et ajoutez l'en-tête : `Content-Type` avec la valeur `application/json`.
   * Cliquez sur **Add** et ajoutez l'en-tête : `Accept` avec la valeur `application/json`.

4. Ajoutez la requête HTTP (**HTTP Request**) :
   * Clic droit sur *Thread Group* > *Add* > *Sampler* > **HTTP Request**.
   * **Server Name or IP** : `127.0.0.1`
   * **Port Number** : `8001`
   * **HTTP Method** : `POST`
   * **Path** : `/api/cart/add`
   * Dans l'onglet **Body Data**, collez le corps JSON suivant :
     ```json
     {
       "user_id": 1,
       "id_produit": 1,
       "quantite": 1,
       "mode_livraison": 1,
       "telephone": "672027744",
       "lieu_livraison": "Akwa, Douala",
       "idempotency_key": "TEST-JMETER-${__ThreadNum}-${__time()}"
     }
     ```

5. Ajoutez les écouteurs de résultats (**Listeners**) :
   * Clic droit sur *Thread Group* > *Add* > *Listener* > **View Results Tree**
   * Clic droit sur *Thread Group* > *Add* > *Listener* > **Summary Report**

6. Cliquez sur le bouton vert **Start** pour démarrer le test.

---

### Validation et Résultats Attendus

1. **Dans JMeter** :
   * Les premières requêtes (jusqu'à concurrence du stock disponible) renverront un code de succès **HTTP 201 Created**.
   * Toutes les requêtes suivantes recevront un code **HTTP 400 Bad Request** avec le message explicite : `"Stock insuffisant."`.
2. **Dans la Base de Données MySQL** :
   * Exécutez la requête SQL suivante dans phpMyAdmin ou votre client MySQL :
     ```sql
     SELECT id, nom_produit, stock FROM produits WHERE id = 1;
     ```
   * **Constat obligatoire** : Le stock est **strictement égal à 0**. Il ne descend jamais en dessous de zéro (`-1`, `-2`, etc.), ce qui confirme l'intégrité absolue des données sous haute concurrence.

---

## Informations Académiques

* **Auteur** : FOUKENG Kemayou Bavel Franck
* **Spécialité** : Génie Logiciel / E-Business
* **Année Académique** : 2025–2026