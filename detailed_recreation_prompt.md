
# Demande de Création d'Application : Système de Gestion d'Emploi du Temps "ShudWelcome"

## 1. Objectif Général

Créer une application web complète en utilisant Next.js pour la gestion d'emplois du temps scolaires. L'application doit guider l'utilisateur à travers un processus de configuration en 7 étapes, permettre la gestion des données de base (professeurs, matières, classes, salles), et intégrer une fonctionnalité d'IA pour personnaliser l'accueil. L'application doit être entièrement en **français**.

## 2. Pile Technologique Requise

- **Framework Frontend** : Next.js (avec App Router)
- **Langage** : TypeScript
- **Bibliothèque UI** : ShadCN UI
- **Styling** : Tailwind CSS
- **Gestion d'État** : Redux Toolkit
- **Base de Données / ORM** : Prisma avec une base de données PostgreSQL
- **Fonctionnalités IA** : Genkit

## 3. Style et Thème Visuel

- **Palette de Couleurs** :
  - **Primaire** : Bleu doux (`#64B5F6`)
  - **Arrière-plan** : Bleu très clair (`#F0F8FF`)
  - **Accentuation** : Violet pâle (`#9575CD`)
- **Fichier de Thème** : Implémentez ces couleurs dans `src/app/globals.css` en utilisant des variables HSL CSS pour le thème ShadCN.
- **Police** : Utilisez 'PT Sans' pour le corps du texte et les titres.
- **Composants** : Utilisez les composants ShadCN par défaut, avec des coins arrondis et des ombres pour une apparence professionnelle.

## 4. Structure de la Base de Données (Prisma)

Créez un `prisma/schema.prisma` qui définit les modèles suivants. Utilisez des relations **implicites** pour les liaisons plusieurs-à-plusieurs.

- **Modèles principaux** : `User`, `Teacher`, `Student`, `Parent`, `Grade`, `Class`, `Subject`, `Classroom`, `Lesson`.
- **Énumérations** : `Role`, `UserSex`, `Day`.
- **Relations Clés** :
  - `User` a des relations optionnelles uniques avec `Teacher`, `Student`, `Parent`, `Admin`.
  - `Teacher` a une relation plusieurs-à-plusieurs avec `Class` et `Subject`.
  - `Lesson` est lié à `Subject`, `Class`, `Teacher`, et `Classroom`.
- **Intégrité des Données** : Assurez-vous que des règles `onDelete: Cascade` sont en place pour gérer les suppressions de manière cohérente.

## 5. Script de Seeding de la Base de Données

- Créez un script de seeding robuste dans `prisma/seed.ts`.
- Le script doit d'abord **supprimer** les données existantes dans l'ordre inverse des dépendances pour éviter les erreurs de contrainte.
- Ensuite, il doit **créer** des données de démonstration pour chaque modèle, y compris :
  - Admins, Grades, Classes, Matières, Professeurs (et les lier aux classes/matières), Parents, Étudiants, Salles de classe et Leçons.
- Utilisez des boucles (`for...of`) pour les opérations de création au lieu de `createMany` pour une meilleure fiabilité.

## 6. Routes d'API (Next.js)

Implémentez les routes d'API RESTful suivantes en **français**. Utilisez Zod pour la validation des données entrantes.

- `GET, POST` sur `/api/matieres`
- `GET, POST` sur `/api/classes`
- `GET, POST` sur `/api/salles`
- `GET, POST, PUT, DELETE` sur `/api/professeurs` et `/api/professeurs/[id]`

## 7. Gestion d'État (Redux Toolkit)

- Configurez un store Redux.
- Créez des "slices" pour `matieres`, `classes`, `salles`, et `professeurs`.
- Chaque slice doit contenir des `createAsyncThunk` pour interagir avec les routes d'API correspondantes (ex: `fetchMatieres`, `addMatiere`).

## 8. Fonctionnalité IA (Genkit)

- Créez un flux Genkit dans `src/ai/flows/generate-personalized-greeting.ts`.
- Ce flux doit utiliser le modèle `gemini-2.0-flash`.
- Le prompt, **en français**, doit demander de générer un message d'accueil personnalisé en fonction de l'heure de la journée (matin, après-midi, soir, nuit).
- La page d'accueil appellera ce flux pour afficher le message.

## 9. Pages et Fonctionnalités de l'Application

L'application est centrée sur un guide de configuration en plusieurs étapes.

- **Page d'Accueil (`/`)** :
  - Doit afficher un message de bienvenue, la date et l'heure actuelles (mises à jour côté client), et le message d'accueil personnalisé généré par Genkit.
  - Un bouton proéminent doit mener à la première étape du guide.

- **Guide de Configuration (`/guide/pas...`)** :
  - **Navigateur de Guide** : Un bouton flottant persistant doit permettre de naviguer facilement vers l'étape suivante.
  - **Pas 1 (`/guide/pas1`)** : Un formulaire pour les informations de base de l'école (nom, année scolaire) et les paramètres de l'emploi du temps (nombre de cours par jour, jours par semaine, week-end).
    - **Modales** : Inclure des modales pour "Renommer les jours" et "Gérer les périodes/pauses".
  - **Pas 2 (`/guide/pas2`)** : Une page de questionnaire pour comprendre les besoins spécifiques de l'école (élèves avec emploi du temps individuel, contraintes de déplacement, etc.).
  - **Pas 3 (`/guide/pas3`)** : C'est la page principale de gestion des données.
    - **Interface** : Une mise en page à trois colonnes :
      1.  **Barre latérale gauche** : Icônes pour naviguer entre les vues : Matières, Classes, Salles, Professeurs.
      2.  **Contenu principal** : Un tableau affichant les données de la vue active. Les données doivent être chargées via Redux.
      3.  **Barre d'action droite** : Boutons contextuels comme "Nouvelle", "Éditer", "Effacer".
    - **Modales** : Des modales complètes pour ajouter et modifier chaque type de données (ex: `TeacherFormModal` qui inclut des onglets pour les informations générales et les disponibilités).
  - **Pas 4 à 7** : Créez des pages de remplacement ("placeholder") indiquant que ces sections sont en construction.

## 10. Exigences Clés

- **Langue** : Toute l'interface utilisateur, les messages d'erreur de l'API et les notifications doivent être en **français**.
- **Cohérence du Code** : Le code interne (noms de variables, noms de modèles Prisma) doit utiliser l'anglais pour la cohérence, mais l'interface utilisateur doit être en français.
- **Qualité du Code** : Le code doit être propre, bien organisé, et suivre les meilleures pratiques pour la pile technologique spécifiée.
