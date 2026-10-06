# mirfou

Le jardin numérique d'Ousmane NDIEGUENE — [mirfou.space](https://mirfou.space).

Articles, contes, tutos, réflexions, recherches, et un **Labo** de démonstrations
interactives d'algorithmes. *mirfou* est le verlan de *fourmi*.

Site statique construit avec [Astro](https://astro.build) et MDX.

## Commandes

| Commande          | Effet                                                        |
| :---------------- | :----------------------------------------------------------- |
| `npm install`     | Installe les dépendances                                     |
| `npm run dev`     | Serveur local sur `localhost:4321` (brouillons du Labo visibles) |
| `npm run build`   | Construit le site dans `dist/` et l'index de recherche       |
| `npm run preview` | Sert localement le résultat du build                         |
| `npm run og`      | Génère les images de partage dans `public/og/`               |
| `npm test`        | Tests des algorithmes du Labo                                |
| `npm run check:og`| Vérifie que les images de partage sont présentes et à jour   |
| `npm run verifier`| Tout ce que fait la CI : tests, images, build                |

## Intégration continue

`.github/workflows/ci.yml` s'exécute à chaque push et à chaque pull request :
tests du Labo, contrôle des images de partage, puis build complet. Le build
échoue aussi sur une référence cassée entre contenus (`relatedPosts`,
`<VoirAussi>`, `FEATURED`). Lancer `npm run verifier` avant de pousser
évite les mauvaises surprises.

Node 22 ou plus récent est requis (les tests s'exécutent en TypeScript
sans étape de compilation).

## Où vit quoi

```text
site.config.mjs          Domaine, titre, auteur, profils, mesure d'audience
src/consts.ts            Contenus mis en avant sur l'accueil (FEATURED)
src/content/<section>/   Les textes, en MDX — un fichier par contenu
src/content/labo/        Les pages de démonstration, rangées par famille
src/data/                Proverbes du hero, messages d'attente, feuille de route du Labo
src/assets/hero/         Images qui entrent dans le tirage du hero
src/labo/                Moteur des démonstrations et algorithmes
src/utils/garden.ts      Le graphe du jardin : liens, rétroliens, suggestions
docs/                    Rapports d'audit
```

## Écrire un texte

Créer `src/content/<section>/mon-titre.mdx` :

```mdx
---
title: "Mon titre"
description: "Une phrase de résumé."
pubDate: 2026-10-05
draft: false
origin: authentique     # authentique | assiste | genere
status: graine          # graine | pousse | mature
tags: ["Algorithmes"]
---

Le texte.
```

Puis lancer `npm run og` pour générer son image de partage.

**Relier deux contenus** — une seule déclaration suffit, le lien inverse est calculé :

- dans le texte : `<VoirAussi ref="labo/tris/tri-rapide" />`
- ou dans le frontmatter : `relatedPosts: ["labo/tris/tri-rapide"]`

Une référence vers un brouillon est mise en attente jusqu'à sa publication.
Une référence vers un contenu inexistant fait échouer le build.

## Ajouter une démonstration

Les algorithmes sont des générateurs qui émettent leurs étapes (`src/labo/tris.ts`).
Le lecteur, la frise, le pseudo-code et le journal sont communs à tous :
ajouter un tri revient à écrire son générateur et son pseudo-code.

```mdx
import VisuTri from '../../../components/labo/VisuTri.astro';

<VisuTri algo="rapide" donnees="presque-trie" taille={24} />
```

## Licence

Textes : [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr), comme indiqué en pied de page du site.
Code : licence à définir.
