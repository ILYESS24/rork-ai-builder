# 🚀 Instructions de Déploiement - Rork AI Builder

## 📋 Étapes pour déployer sur GitHub + Render

### 1. **Créer le Repository GitHub**

1. Allez sur [GitHub.com](https://github.com) et connectez-vous
2. Cliquez sur **"New repository"** (bouton vert)
3. Configurez le repository :
   - **Repository name** : `rork-ai-builder`
   - **Description** : `🚀 Rork AI Builder - Enterprise Edition: Complete AI-powered web development platform`
   - **Visibility** : **Public** ✅
   - **DON'T** cocher "Add a README file"
   - **DON'T** cocher ".gitignore"
   - **DON'T** cocher "Add a license"
4. Cliquez sur **"Create repository"**

### 2. **Pousser le Code vers GitHub**

```bash
# Dans le terminal, dans le dossier rork-ai-builder
git push -u origin main
```

### 3. **Déployer sur Render.com**

1. Allez sur [Render.com](https://render.com) et connectez-vous
2. Cliquez sur **"New +"** puis **"Web Service"**
3. Connectez votre repository GitHub `ILYESS24/rork-ai-builder`
4. Configurez le service :
   - **Name** : `rork-ai-builder`
   - **Environment** : `Docker`
   - **Region** : `Oregon (US West)`
   - **Branch** : `main`
   - **Dockerfile Path** : `./Dockerfile`
   - **Build Command** : `npm run render:build`
   - **Start Command** : `npm run render:start`

### 4. **Variables d'Environnement sur Render**

Ajoutez ces variables d'environnement dans Render :

#### **Configuration Principale**
```
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://rork-ai-builder.onrender.com
```

#### **Base de Données**
```
DATABASE_URL = postgresql://user:password@host:port/database
```

#### **Authentification (Clerk)**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
```

#### **IA Providers**
```
OPENAI_API_KEY = sk-...
ANTHROPIC_API_KEY = sk-ant-...
```

#### **Paiements (Stripe) - Optionnel**
```
STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_SECRET_KEY = sk_test_...
STRIPE_PRO_PRICE_ID = price_...
STRIPE_ENTERPRISE_PRICE_ID = price_...
STRIPE_WEBHOOK_SECRET = whsec_...
```

#### **Vector Search (Pinecone) - Optionnel**
```
PINECONE_API_KEY = ...
PINECONE_INDEX_NAME = rork-ai-builder
```

#### **Monitoring (Sentry) - Optionnel**
```
NEXT_PUBLIC_SENTRY_DSN = https://...
```

### 5. **Configuration de la Base de Données**

1. Sur Render, créez un **PostgreSQL Database**
2. Copiez l'URL de connexion
3. Ajoutez-la comme variable `DATABASE_URL`
4. Le schéma sera créé automatiquement au premier démarrage

### 6. **Déploiement Automatique**

- Le déploiement se fait automatiquement à chaque push sur `main`
- Render détecte les changements et redéploie
- Les logs sont disponibles dans le dashboard Render

## 🔧 Configuration Locale

### Variables d'Environnement Locales

Créez un fichier `.env.local` :

```env
# Copiez depuis env.example et configurez
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@localhost:5432/rork_ai_builder"
# ... autres variables
```

### Démarrage Local

```bash
npm install --legacy-peer-deps
npm run db:generate
npm run db:push
npm run dev
```

## 📊 Monitoring et Logs

### Render Dashboard
- **Logs** : Disponibles en temps réel
- **Métriques** : CPU, RAM, Réseau
- **Health Checks** : Monitoring automatique

### Sentry (si configuré)
- **Erreurs** : Tracking automatique
- **Performance** : Métriques détaillées
- **Alertes** : Notifications par email

## 🚨 Dépannage

### Problèmes Courants

1. **Erreur de build** : Vérifiez les variables d'environnement
2. **Base de données** : Vérifiez l'URL de connexion
3. **Authentification** : Vérifiez les clés Clerk
4. **IA** : Vérifiez les clés API OpenAI/Anthropic

### Logs utiles

```bash
# Logs Render
- Allez dans le dashboard Render
- Cliquez sur votre service
- Onglet "Logs"

# Logs locaux
npm run dev
# Consultez la console pour les erreurs
```

## 🔗 URLs de Déploiement

- **Application** : `https://rork-ai-builder.onrender.com`
- **API Health** : `https://rork-ai-builder.onrender.com/api/health`
- **GraphQL** : `https://rork-ai-builder.onrender.com/api/graphql`
- **Admin Panel** : `https://rork-ai-builder.onrender.com/admin`

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs Render
2. Vérifiez les variables d'environnement
3. Testez localement d'abord
4. Consultez la documentation dans le README

---

**🎉 Félicitations ! Votre Rork AI Builder est maintenant déployé !**
