# ⚡ Déploiement Rapide sur Render - 5 Minutes

## 🚀 **Déploiement Express**

### **Étape 1: Préparer le Code (2 minutes)**

```bash
# 1. Vérifier que tout fonctionne localement
npm run dev
# Tester sur http://localhost:3000

# 2. Build de test
npm run build

# 3. Push sur GitHub (si pas déjà fait)
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### **Étape 2: Créer le Service Render (2 minutes)**

1. **Aller sur** [render.com](https://render.com)
2. **Créer un compte** avec GitHub
3. **Cliquer** "New +" → "Web Service"
4. **Connecter** votre repository GitHub
5. **Sélectionner** le repository `rork-ai-builder`

### **Étape 3: Configuration (1 minute)**

#### **Paramètres Automatiques**
- **Name** : `rork-ai-builder`
- **Environment** : `Node` (détecté automatiquement)
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`

#### **Variables d'Environnement (OBLIGATOIRE)**
```env
OPENAI_API_KEY=sk-your-openai-api-key
NEXT_PUBLIC_APP_URL=https://rork-ai-builder.onrender.com
NODE_ENV=production
```

### **Étape 4: Déployer**
1. **Cliquer** "Create Web Service"
2. **Attendre** 5-10 minutes
3. **Tester** l'application sur l'URL fournie

---

## ✅ **Vérification Rapide**

### **Test de Fonctionnement**
1. **Aller** sur votre URL Render
2. **Taper** : "Créer une page d'accueil simple"
3. **Vérifier** :
   - ✅ Interface se charge
   - ✅ Chat fonctionne
   - ✅ Génération de code fonctionne
   - ✅ Preview se met à jour

---

## 🔧 **Configuration Minimale**

### **Variables Obligatoires**
```env
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
NODE_ENV=production
```

### **Variables Optionnelles**
```env
# Pour l'authentification
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Pour la base de données
DATABASE_URL=postgresql://...
```

---

## 🚨 **Dépannage Express**

### **Build Failed**
- Vérifier que `npm run build` fonctionne localement
- Vérifier les variables d'environnement

### **App Won't Start**
- Vérifier le Start Command : `npm start`
- Vérifier le port : 3000

### **API Not Working**
- Vérifier `OPENAI_API_KEY` est configurée
- Vérifier `NEXT_PUBLIC_APP_URL` est correcte

---

## 🎯 **Résultat**

**En 5 minutes, vous aurez :**
- ✅ **Application déployée** sur Render
- ✅ **URL publique** accessible
- ✅ **HTTPS automatique**
- ✅ **Déploiements automatiques** depuis GitHub

**Votre AI Builder est maintenant en ligne ! 🚀**

---

## 📱 **URL Finale**

**Votre application sera accessible sur :**
```
https://rork-ai-builder.onrender.com
```

**Partagez cette URL pour montrer votre AI Builder au monde ! 🌍**
