# 🚀 Guide de Déploiement sur Render - Rork AI Builder

## 📋 **Étapes de Déploiement**

### **1. Préparation du Code**

#### **✅ Fichiers de Configuration Créés**
- ✅ `render.yaml` - Configuration Render
- ✅ `Dockerfile` - Configuration Docker
- ✅ `.dockerignore` - Fichiers à ignorer pour Docker
- ✅ `.renderignore` - Fichiers à ignorer pour Render
- ✅ `next.config.js` - Configuration Next.js optimisée

#### **✅ Configuration Next.js**
- ✅ Mode `standalone` activé
- ✅ Optimisations de production
- ✅ Headers de sécurité
- ✅ Configuration des images

---

### **2. Création du Compte Render**

1. **Aller sur** [render.com](https://render.com)
2. **Créer un compte** avec GitHub
3. **Connecter votre repository** GitHub

---

### **3. Déploiement Automatique**

#### **Option A: Déploiement via GitHub (Recommandé)**

1. **Push du code** sur GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

2. **Dans Render Dashboard** :
   - Cliquer "New +" → "Web Service"
   - Connecter votre repository GitHub
   - Sélectionner le repository `rork-ai-builder`
   - Render détectera automatiquement la configuration

#### **Option B: Déploiement via render.yaml**

1. **Push du fichier render.yaml**
2. **Render utilisera automatiquement** la configuration

---

### **4. Configuration des Variables d'Environnement**

Dans le Dashboard Render → Settings → Environment Variables :

#### **🔑 Variables Obligatoires**
```env
# OpenAI (OBLIGATOIRE)
OPENAI_API_KEY=sk-your-openai-api-key

# Next.js
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
NODE_ENV=production
```

#### **🔐 Variables Optionnelles (pour fonctionnalités avancées)**
```env
# Anthropic (Optionnel)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Clerk Auth (Optionnel)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your-clerk-key
CLERK_SECRET_KEY=sk_live_your-clerk-secret

# Supabase (Optionnel)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://user:password@host:port/database

# Stripe (Optionnel)
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret

# Pinecone (Optionnel)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=your-index-name

# Sentry (Optionnel)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

---

### **5. Configuration du Service**

#### **Paramètres de Base**
- **Name** : `rork-ai-builder`
- **Environment** : `Node`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`
- **Plan** : `Starter` (gratuit) ou `Professional` (recommandé)

#### **Paramètres Avancés**
- **Auto-Deploy** : `Yes` (déploiement automatique)
- **Pull Request Previews** : `Yes` (aperçus des PR)
- **Health Check Path** : `/` (vérification de santé)

---

### **6. Déploiement**

1. **Cliquer "Create Web Service"**
2. **Attendre le build** (5-10 minutes)
3. **Vérifier les logs** de déploiement
4. **Tester l'application** sur l'URL fournie

---

## 🔧 **Configuration Optimisée**

### **Build Command**
```bash
npm install && npm run build
```

### **Start Command**
```bash
npm start
```

### **Health Check**
- **Path** : `/`
- **Timeout** : 30s
- **Interval** : 60s

---

## 📊 **Plans Render**

### **Starter Plan (Gratuit)**
- ✅ 750 heures/mois
- ✅ 512 MB RAM
- ✅ Sleep après 15 min d'inactivité
- ✅ Custom domains
- ✅ HTTPS automatique

### **Professional Plan ($7/mois)**
- ✅ Pas de limite d'heures
- ✅ 512 MB RAM
- ✅ Pas de sleep
- ✅ Auto-scaling
- ✅ Monitoring avancé

---

## 🚨 **Dépannage**

### **Erreur de Build**
```bash
# Vérifier les logs dans Render Dashboard
# Erreurs communes :
- Variables d'environnement manquantes
- Erreurs TypeScript
- Dépendances manquantes
```

### **Erreur de Démarrage**
```bash
# Vérifier :
- Port 3000 exposé
- Variables d'environnement correctes
- Next.js configuré en mode production
```

### **Application Lente**
```bash
# Solutions :
- Upgrade vers Professional Plan
- Optimiser les images
- Réduire la taille du bundle
```

---

## ✅ **Checklist de Déploiement**

### **Avant le Déploiement**
- [ ] Code pushé sur GitHub
- [ ] Variables d'environnement préparées
- [ ] Tests locaux réussis
- [ ] Build local réussi

### **Pendant le Déploiement**
- [ ] Service créé sur Render
- [ ] Variables d'environnement configurées
- [ ] Build réussi
- [ ] Application accessible

### **Après le Déploiement**
- [ ] Application fonctionne
- [ ] Génération de code fonctionne
- [ ] Interface responsive
- [ ] HTTPS activé
- [ ] Domain personnalisé (optionnel)

---

## 🎉 **Résultat Final**

**Votre AI Builder sera accessible sur :**
- **URL Render** : `https://rork-ai-builder.onrender.com`
- **HTTPS** : Automatiquement activé
- **Performance** : Optimisée pour la production
- **Monitoring** : Logs et métriques disponibles

**Votre AI Builder est maintenant déployé en production ! 🚀**
