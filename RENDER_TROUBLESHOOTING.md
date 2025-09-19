# 🚨 Résolution des Problèmes de Déploiement Render

## ❌ Erreur de Conflit de Dépendances

### Problème
```
npm error Could not resolve dependency:
npm error peerOptional zod@"^4.0.0" from @anthropic-ai/sdk@0.63.0
npm error Conflicting peer dependency: zod@4.1.9
```

### ✅ Solutions

#### Solution 1 : Utiliser le Dockerfile Simplifié
1. Dans Render, changez le **Dockerfile Path** vers `Dockerfile.render`
2. Ou utilisez le **Environment** : `Node` au lieu de `Docker`

#### Solution 2 : Configuration Render avec Node
1. **Environment** : `Node` (pas Docker)
2. **Build Command** : `npm ci --legacy-peer-deps && npx prisma generate && npm run build`
3. **Start Command** : `npm start`

#### Solution 3 : Variables d'Environnement
Ajoutez dans Render :
```
NPM_CONFIG_LEGACY_PEER_DEPS=true
```

## 🔧 Configuration Render Optimale

### Configuration Recommandée
```
Name: rork-ai-builder
Environment: Node (recommandé) ou Docker
Region: Oregon (US West)
Branch: main
Root Directory: /
Build Command: npm ci --legacy-peer-deps && npx prisma generate && npm run build
Start Command: npm start
```

### Variables d'Environnement Minimum
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://rork-ai-builder.onrender.com
NPM_CONFIG_LEGACY_PEER_DEPS=true
```

## 🗄️ Configuration Base de Données

### PostgreSQL sur Render
1. Créez un **PostgreSQL Database** sur Render
2. Copiez l'**Internal Database URL**
3. Ajoutez comme variable `DATABASE_URL`
4. Le schéma sera créé automatiquement

### Exemple DATABASE_URL
```
DATABASE_URL=postgresql://user:password@dpg-xxx-oregon-postgres.render.com:5432/database_name
```

## 🚀 Déploiement Étape par Étape

### 1. Créer le Service Web
1. Allez sur [Render.com](https://render.com)
2. **New +** → **Web Service**
3. Connectez GitHub → `ILYESS24/rork-ai-builder`

### 2. Configuration de Base
```
Name: rork-ai-builder
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: /
```

### 3. Commandes de Build
```
Build Command: npm ci --legacy-peer-deps && npx prisma generate && npm run build
Start Command: npm start
```

### 4. Variables d'Environnement
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://rork-ai-builder.onrender.com
NPM_CONFIG_LEGACY_PEER_DEPS=true
```

### 5. Créer la Base de Données
1. **New +** → **PostgreSQL**
2. Nom : `rork-ai-builder-db`
3. Copiez l'URL de connexion
4. Ajoutez comme variable `DATABASE_URL`

### 6. Déployer
1. Cliquez **Create Web Service**
2. Attendez le déploiement (5-10 minutes)
3. Votre app sera disponible à `https://rork-ai-builder.onrender.com`

## 🔍 Vérification du Déploiement

### Health Check
```
https://rork-ai-builder.onrender.com/api/health
```

### Logs Render
1. Allez dans votre service sur Render
2. Onglet **Logs**
3. Vérifiez les erreurs de build

### Tests Locaux
```bash
# Tester localement d'abord
npm ci --legacy-peer-deps
npm run build
npm start
```

## 🚨 Erreurs Courantes

### Erreur : "Cannot find module"
**Solution** : Vérifiez que toutes les dépendances sont dans `dependencies` et non `devDependencies`

### Erreur : "Prisma Client not found"
**Solution** : Ajoutez `npx prisma generate` dans le build command

### Erreur : "Port 3000 already in use"
**Solution** : Render gère automatiquement le port, pas besoin de configuration

### Erreur : "Build timeout"
**Solution** : Le build peut prendre 10-15 minutes, soyez patient

## 📞 Support

Si vous rencontrez encore des problèmes :
1. Consultez les logs Render
2. Testez localement avec `npm run build`
3. Vérifiez toutes les variables d'environnement
4. Contactez le support Render si nécessaire

---

**🎯 Avec ces solutions, votre Rork AI Builder devrait se déployer sans problème !**
