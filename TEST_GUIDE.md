# 🧪 Guide de Test - Rork AI Builder

## 🚀 **Test Rapide (5 minutes)**

### 1. Configuration Minimale
```bash
# 1. Créer le fichier .env.local
cp env.local.example .env.local

# 2. Ajouter votre clé OpenAI (OBLIGATOIRE)
# Éditer .env.local et ajouter :
OPENAI_API_KEY=sk-your-actual-openai-key-here

# 3. Lancer l'application
npm run dev
```

### 2. Test de l'Interface
1. **Aller sur** http://localhost:3000
2. **Vérifier** que l'interface se charge correctement
3. **Cliquer** sur "Get Started" pour tester l'authentification (optionnel)
4. **Voir** les exemples de prompts dans le chat

### 3. Test de Génération de Code
1. **Taper** dans le chat : `"Créer une page d'accueil simple avec un titre bleu et un bouton"`
2. **Observer** :
   - ✅ Le message apparaît dans le chat
   - ✅ L'indicateur "Génération en cours..." s'affiche
   - ✅ Le code se génère progressivement
   - ✅ La prévisualisation se met à jour
   - ✅ Le bouton Download devient actif

### 4. Test des Fonctionnalités
- **Preview** : Voir l'application générée
- **Code** : Voir/éditer le code HTML
- **Download** : Télécharger le fichier HTML
- **Device View** : Tester desktop/tablet/mobile

---

## 🔧 **Tests Détaillés**

### Test 1: Interface Utilisateur
- [ ] Header avec logo et navigation
- [ ] Chat interface avec exemples
- [ ] Preview panel avec device selector
- [ ] Code editor avec syntaxe highlighting
- [ ] Responsive design (mobile/desktop)

### Test 2: Authentification (Optionnel)
- [ ] Page sign-in se charge
- [ ] Page sign-up se charge
- [ ] UserButton s'affiche après connexion
- [ ] Bannière de bienvenue pour non-connectés

### Test 3: Génération de Code
- [ ] Prompt simple : "Hello world"
- [ ] Prompt complexe : "Landing page avec hero section"
- [ ] Prompt avec JavaScript : "Page avec compteur interactif"
- [ ] Prompt avec CSS : "Design moderne avec animations"

### Test 4: Prévisualisation
- [ ] Iframe se charge correctement
- [ ] Device selector fonctionne
- [ ] Bouton refresh fonctionne
- [ ] Bouton "Ouvrir dans un nouvel onglet" fonctionne

### Test 5: Éditeur de Code
- [ ] Monaco Editor se charge
- [ ] Syntaxe highlighting fonctionne
- [ ] Modifications se reflètent dans la preview
- [ ] Thème sombre/clair fonctionne

---

## 🐛 **Dépannage Commun**

### Erreur "OpenAI API key not configured"
```bash
# Vérifier que .env.local existe et contient :
OPENAI_API_KEY=sk-your-actual-key
```

### Erreur "Failed to fetch"
```bash
# Vérifier que le serveur tourne sur le bon port
npm run dev
# Doit afficher : Ready - started server on 0.0.0.0:3000
```

### Erreur de compilation
```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run dev
```

### Interface ne se charge pas
```bash
# Vérifier les erreurs dans la console navigateur
# Vérifier que toutes les dépendances sont installées
npm list --depth=0
```

---

## ✅ **Checklist de Validation**

### Fonctionnalités Core
- [ ] Interface se charge sans erreur
- [ ] Chat interface fonctionne
- [ ] Génération de code fonctionne (avec clé OpenAI)
- [ ] Preview se met à jour en temps réel
- [ ] Code editor fonctionne
- [ ] Download fonctionne

### Interface Utilisateur
- [ ] Design responsive
- [ ] Thème sombre/clair
- [ ] Animations fluides
- [ ] Messages d'erreur informatifs
- [ ] Loading states

### Performance
- [ ] Chargement rapide (< 3 secondes)
- [ ] Génération de code fluide
- [ ] Pas d'erreurs dans la console
- [ ] Mémoire stable

---

## 🎯 **Résultats Attendus**

### Test Réussi ✅
- Interface moderne et fonctionnelle
- Génération de code en streaming
- Prévisualisation temps réel
- Code téléchargeable
- Expérience utilisateur fluide

### Niveau de Qualité
- **Interface** : Niveau professionnel ✅
- **Fonctionnalités** : MVP fonctionnel ✅
- **Performance** : Optimisée ✅
- **UX** : Intuitive ✅

---

## 🚀 **Prochaines Étapes Après Test**

1. **Si tout fonctionne** : Configurer les services avancés (DB, Auth, Payments)
2. **Si problèmes** : Consulter le guide de dépannage
3. **Optimisations** : Améliorer les prompts IA, ajouter des templates
4. **Déploiement** : Préparer pour la production

**Votre AI Builder est prêt pour la production ! 🎉**
