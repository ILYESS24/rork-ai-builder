# 🚀 Guide de Déploiement Rapide - Rork AI Builder

## ⚡ Déploiement en 5 Minutes

### Étape 1 : Créer le Repository GitHub

1. **Allez sur** [GitHub.com](https://github.com) et connectez-vous avec votre compte `ILYESS24`

2. **Cliquez sur** le bouton vert **"New"** ou **"New repository"**

3. **Configurez le repository :**
   - **Repository name** : `rork-ai-builder`
   - **Description** : `🚀 Rork AI Builder - Enterprise Edition: Complete AI-powered web development platform`
   - **Visibility** : **Public** ✅
   - **⚠️ IMPORTANT** : Ne cochez PAS "Add a README file"
   - **⚠️ IMPORTANT** : Ne cochez PAS ".gitignore"
   - **⚠️ IMPORTANT** : Ne cochez PAS "Add a license"

4. **Cliquez sur** **"Create repository"**

### Étape 2 : Pousser le Code

**Option A - Script PowerShell (Recommandé) :**
```powershell
.\deploy-to-github.ps1
```

**Option B - Commandes Git manuelles :**
```bash
git add .
git commit -m "Deploy Rork AI Builder Enterprise Edition"
git push -u origin main
```

### Étape 3 : Déployer sur Render.com

1. **Allez sur** [Render.com](https://render.com) et connectez-vous

2. **Cliquez sur** **"New +"** puis **"Web Service"**

3. **Connectez GitHub** et sélectionnez `ILYESS24/rork-ai-builder`

4. **Configurez le service :**
   - **Name** : `rork-ai-builder`
   - **Environment** : `Docker`
   - **Region** : `Oregon (US West)`
   - **Branch** : `main`
   - **Root Directory** : `/`
   - **Dockerfile Path** : `./Dockerfile`

5. **Variables d'Environnement** (ajoutez au minimum) :
   ```
   NODE_ENV = production
   NEXT_PUBLIC_APP_URL = https://rork-ai-builder.onrender.com
   DATABASE_URL = (sera fourni par Render)
   ```

6. **Cliquez sur** **"Create Web Service"**

### Étape 4 : Configuration de la Base de Données

1. **Sur Render**, créez un **PostgreSQL Database**
2. **Copiez l'URL** de connexion
3. **Ajoutez-la** comme variable `DATABASE_URL` dans votre service web
4. **Redéployez** le service

## 🎯 Résultat Final

Votre application sera accessible à :
- **URL** : `https://rork-ai-builder.onrender.com`
- **Repository** : `https://github.com/ILYESS24/rork-ai-builder`

## 🔧 Configuration Avancée (Optionnelle)

### Variables d'Environnement Complètes

```env
# Configuration Principale
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://rork-ai-builder.onrender.com

# Base de Données
DATABASE_URL=postgresql://user:password@host:port/database

# Authentification (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# IA Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Paiements (Stripe)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vector Search (Pinecone)
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=rork-ai-builder

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://...
```

## 🚨 Dépannage

### Problème : "Repository not found"
**Solution** : Créez d'abord le repository sur GitHub.com

### Problème : "Build failed"
**Solution** : Vérifiez que toutes les variables d'environnement sont configurées

### Problème : "Database connection failed"
**Solution** : Vérifiez l'URL de la base de données PostgreSQL

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs dans Render Dashboard
2. Vérifiez les variables d'environnement
3. Testez localement d'abord avec `npm run dev`

---

**🎉 Félicitations ! Votre Rork AI Builder est maintenant en ligne !**
