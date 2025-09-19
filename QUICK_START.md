# 🚀 Guide de Démarrage Rapide - Rork AI Builder

## ⚡ **Démarrage en 5 Minutes**

### 1. Configuration Minimale
```bash
# 1. Copier le fichier d'environnement
cp env.local.example .env.local

# 2. Configurer au minimum OpenAI (obligatoire)
# Éditer .env.local et ajouter votre clé OpenAI :
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### 2. Lancer l'Application
```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

### 3. Test Rapide
1. **Aller sur** http://localhost:3000
2. **Cliquer** sur "Get Started" pour créer un compte (optionnel)
3. **Taper** dans le chat : "Créer une page d'accueil simple avec un titre et un bouton"
4. **Voir** le code généré et la prévisualisation

---

## 🔧 **Configuration Complète (Recommandée)**

### Services Optionnels mais Utiles

#### **🔐 Authentification (Clerk)**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```
**Avantages :** Sauvegarde des projets, authentification sécurisée

#### **🗄️ Base de Données (Supabase)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL="postgresql://..."
```
**Avantages :** Persistance des données, collaboration

#### **💳 Paiements (Stripe)**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```
**Avantages :** Plans premium, monétisation

---

## 🎯 **Première Utilisation**

### Interface Principale
1. **Chat Panel (Gauche)** : Décrivez votre application
2. **Preview Panel (Droite)** : Voir le résultat en temps réel
3. **Code Editor** : Modifier le code généré
4. **Download** : Télécharger le fichier HTML

### Exemples de Prompts
```
"Créer une landing page pour une startup tech avec hero section, features et footer"

"Faire un dashboard admin avec sidebar, tableau de données et graphiques"

"Construire un portfolio créatif avec animations et galerie d'images"

"Créer un blog moderne avec articles, recherche et pagination"
```

---

## 🛠️ **Fonctionnalités Avancées**

### Avec Authentification
- ✅ Sauvegarde automatique des projets
- ✅ Historique des générations
- ✅ Partage de projets
- ✅ Collaboration en temps réel

### Avec Base de Données
- ✅ Templates prédéfinis
- ✅ Galerie de projets
- ✅ Recherche et filtres
- ✅ Métriques d'utilisation

### Avec Paiements
- ✅ Plans Free/Pro/Enterprise
- ✅ Limites de génération
- ✅ Fonctionnalités premium
- ✅ Support prioritaire

---

## 🚨 **Dépannage Rapide**

### Erreur "OpenAI API key not found"
```bash
# Vérifier que .env.local existe et contient :
OPENAI_API_KEY=sk-your-actual-key
```

### Erreur de connexion base de données
```bash
# Pour tester sans DB, commenter les lignes DATABASE_URL dans .env.local
# DATABASE_URL="postgresql://..."
```

### Application ne démarre pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📱 **Interface Mobile**

L'application est **100% responsive** :
- ✅ Interface adaptative
- ✅ Touch-friendly
- ✅ Performance optimisée
- ✅ PWA ready

---

## 🎉 **Vous Êtes Prêt !**

**Félicitations !** Votre AI Builder est maintenant opérationnel.

### Prochaines Étapes
1. **Tester** différentes générations
2. **Configurer** les services optionnels
3. **Personnaliser** l'interface
4. **Déployer** en production

### Support
- 📖 Documentation complète dans `/docs`
- 🐛 Issues sur GitHub
- 💬 Discord communautaire
- 📧 Support email

**Happy Building! 🚀**
