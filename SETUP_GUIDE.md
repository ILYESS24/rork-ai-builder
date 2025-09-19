# 🚀 Guide de Configuration - Rork AI Builder

## 📋 **Étape 1: Configuration des Variables d'Environnement**

### 1.1 Créer le fichier .env.local
```bash
cp env.local.example .env.local
```

### 1.2 Configurer les Services Externes

#### **🤖 OpenAI (Obligatoire)**
1. Aller sur [OpenAI Platform](https://platform.openai.com/)
2. Créer un compte et générer une API Key
3. Ajouter dans `.env.local`:
```env
OPENAI_API_KEY=sk-your-actual-openai-key
```

#### **🤖 Anthropic Claude (Recommandé)**
1. Aller sur [Anthropic Console](https://console.anthropic.com/)
2. Créer un compte et générer une API Key
3. Ajouter dans `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key
```

#### **🔐 Clerk Auth (Recommandé)**
1. Aller sur [Clerk Dashboard](https://dashboard.clerk.com/)
2. Créer un nouveau projet
3. Récupérer les clés et ajouter dans `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-clerk-key
CLERK_SECRET_KEY=sk_test_your-actual-clerk-secret
```

#### **🗄️ Supabase Database**
1. Aller sur [Supabase](https://supabase.com/)
2. Créer un nouveau projet
3. Récupérer l'URL et les clés dans Settings > API
4. Ajouter dans `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
```

#### **💳 Stripe Payments**
1. Aller sur [Stripe Dashboard](https://dashboard.stripe.com/)
2. Créer un compte et récupérer les clés de test
3. Créer des produits/prix pour les plans
4. Ajouter dans `.env.local`:
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your-actual-stripe-key
STRIPE_SECRET_KEY=sk_test_your-actual-stripe-secret
```

#### **📊 Pinecone Vector DB (Optionnel)**
1. Aller sur [Pinecone Console](https://app.pinecone.io/)
2. Créer un index
3. Récupérer l'API key
4. Ajouter dans `.env.local`:
```env
PINECONE_API_KEY=your-actual-pinecone-key
PINECONE_INDEX_NAME=your-index-name
```

#### **📈 Sentry Monitoring (Optionnel)**
1. Aller sur [Sentry](https://sentry.io/)
2. Créer un projet Next.js
3. Récupérer le DSN
4. Ajouter dans `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-actual-dsn@sentry.io/project-id
```

---

## 🗄️ **Étape 2: Configuration de la Base de Données**

### 2.1 Initialiser Prisma
```bash
# Générer le client Prisma
npm run db:generate

# Appliquer le schéma à la base de données
npm run db:push

# (Optionnel) Ajouter des données de test
npm run db:seed
```

### 2.2 Vérifier la connexion
```bash
# Ouvrir l'interface Prisma Studio
npm run db:studio
```

---

## 🔐 **Étape 3: Configuration de l'Authentification**

### 3.1 Configurer Clerk
1. Dans le dashboard Clerk, configurer:
   - Sign-in methods (Email, Google, GitHub)
   - Custom fields si nécessaire
   - Webhooks pour synchronisation

2. Ajouter les routes dans l'app:
```typescript
// app/sign-in/[[...sign-in]]/page.tsx
// app/sign-up/[[...sign-up]]/page.tsx
```

### 3.2 Tester l'authentification
```bash
npm run dev
# Aller sur http://localhost:3000/sign-in
```

---

## 🤖 **Étape 4: Test des Services IA**

### 4.1 Tester OpenAI
```bash
# Créer un test simple
curl -X POST http://localhost:3000/api/test/openai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

### 4.2 Tester Anthropic
```bash
# Créer un test simple
curl -X POST http://localhost:3000/api/test/anthropic \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

---

## 💳 **Étape 5: Configuration des Paiements**

### 5.1 Créer les produits Stripe
1. Dans Stripe Dashboard > Products
2. Créer 3 produits:
   - **Free Plan** (Gratuit)
   - **Pro Plan** ($29/mois)
   - **Enterprise Plan** ($99/mois)

### 5.2 Configurer les webhooks
1. Dans Stripe Dashboard > Webhooks
2. Ajouter endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Sélectionner les événements:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

## 🧪 **Étape 6: Tests de Base**

### 6.1 Tests unitaires
```bash
npm run test
```

### 6.2 Tests E2E
```bash
npm run test:e2e
```

### 6.3 Vérification du build
```bash
npm run build
npm run start
```

---

## 🚀 **Étape 7: Déploiement**

### 7.1 Déploiement Vercel (Recommandé)
1. Connecter le repo GitHub à Vercel
2. Ajouter toutes les variables d'environnement
3. Déployer automatiquement

### 7.2 Configuration production
- Utiliser des clés de production
- Configurer les domaines personnalisés
- Activer le monitoring

---

## ✅ **Checklist de Validation**

### Services de Base
- [ ] OpenAI API fonctionne
- [ ] Anthropic API fonctionne
- [ ] Base de données connectée
- [ ] Authentification fonctionne

### Fonctionnalités Core
- [ ] Génération de code fonctionne
- [ ] Prévisualisation fonctionne
- [ ] Éditeur de code fonctionne
- [ ] Sauvegarde de projets fonctionne

### Paiements
- [ ] Stripe connecté
- [ ] Plans configurés
- [ ] Webhooks fonctionnent
- [ ] Portail client accessible

### Production
- [ ] Build de production réussi
- [ ] Tests passent
- [ ] Monitoring configuré
- [ ] Déploiement réussi

---

## 🆘 **Dépannage Commun**

### Erreur OpenAI
```
Error: Invalid API key
```
**Solution:** Vérifier que `OPENAI_API_KEY` est correcte

### Erreur Base de Données
```
Error: Connection refused
```
**Solution:** Vérifier `DATABASE_URL` et que Supabase est actif

### Erreur Clerk
```
Error: Clerk key not found
```
**Solution:** Vérifier les clés Clerk dans `.env.local`

### Erreur Stripe
```
Error: Invalid API key
```
**Solution:** Utiliser les clés de test Stripe

---

## 📞 **Support**

Si vous rencontrez des problèmes:
1. Vérifier les logs dans la console
2. Consulter la documentation des services
3. Tester chaque service individuellement
4. Vérifier les variables d'environnement

**Une fois toutes les étapes terminées, votre AI Builder sera prêt ! 🎉**
