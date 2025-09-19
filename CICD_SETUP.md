# 🚀 Configuration CI/CD - Rork AI Builder

Ce document explique comment configurer le pipeline CI/CD complet pour le projet Rork AI Builder.

## 📋 Prérequis

### 1. **GitHub Repository**
- Repository GitHub configuré avec les branches `main` et `develop`
- Accès administrateur au repository

### 2. **Services Externes**
- [SonarCloud](https://sonarcloud.io/) - Analyse de qualité de code
- [Snyk](https://snyk.io/) - Scan de sécurité des dépendances
- [Codecov](https://codecov.io/) - Couverture de code (optionnel)

## 🔧 Configuration des Secrets GitHub

Ajoutez les secrets suivants dans votre repository GitHub (`Settings > Secrets and variables > Actions`) :

### Secrets Requis
```bash
SONAR_TOKEN=your_sonarcloud_token
SNYK_TOKEN=your_snyk_token
GITHUB_TOKEN=auto_generated_by_github
```

### Secrets Optionnels
```bash
CODECOV_TOKEN=your_codecov_token
RENDER_API_KEY=your_render_api_key
```

## 📊 Services à Configurer

### 1. **SonarCloud Setup**

1. Allez sur [sonarcloud.io](https://sonarcloud.io/)
2. Connectez-vous avec votre compte GitHub
3. Importez votre repository `ILYESS24/rork-ai-builder`
4. Copiez le token SonarCloud dans les secrets GitHub
5. Le fichier `sonar-project.properties` est déjà configuré

**Configuration SonarCloud :**
- Organisation : `ILYESS24`
- Projet : `rork-ai-builder`
- Branches analysées : `main`, `develop`

### 2. **Snyk Setup**

1. Allez sur [snyk.io](https://snyk.io/)
2. Connectez-vous avec votre compte GitHub
3. Importez votre repository
4. Copiez le token Snyk dans les secrets GitHub
5. Configurez les politiques de sécurité dans `.snyk`

**Commandes Snyk locales :**
```bash
# Installer Snyk CLI
npm install -g snyk

# Authentifier
snyk auth

# Tester les vulnérabilités
npm run security:scan

# Monitorer le projet
npm run security:monitor
```

### 3. **Codecov Setup (Optionnel)**

1. Allez sur [codecov.io](https://codecov.io/)
2. Connectez votre repository GitHub
3. Copiez le token dans les secrets GitHub

## 🧪 Tests et Qualité

### Tests Inclus
- **Tests Unitaires** : Jest avec couverture
- **Tests de Fuzzing** : Fast-check pour génération de données aléatoires
- **Tests E2E** : Playwright pour tests d'intégration
- **Tests de Performance** : Mesures de temps de réponse

### Commandes de Test
```bash
# Tous les tests
npm run test:all

# Tests unitaires seulement
npm run test:unit

# Tests de fuzzing
npm run test:fuzzing

# Tests E2E
npm run test:e2e

# Couverture de code
npm run test:coverage

# Analyse de qualité complète
npm run quality:check
```

## 🔍 Analyse de Code

### ESLint
- Configuration Next.js
- Règles TypeScript
- Règles React
- Export des rapports en JSON

### TypeScript
- Vérification de types stricte
- Pas d'émission de fichiers JS
- Configuration dans `tsconfig.json`

### Prettier
- Formatage automatique
- Vérification du formatage dans CI

## 🚀 Pipeline CI/CD

### Workflow GitHub Actions

Le pipeline s'exécute sur :
- **Push** vers `main` ou `develop`
- **Pull Requests** vers `main` ou `develop`
- **Schedule** quotidien pour l'analyse de sécurité

### Jobs du Pipeline

1. **🔒 Security Analysis (CodeQL)**
   - Analyse de sécurité avec GitHub CodeQL
   - Détection de vulnérabilités
   - Support multi-langages

2. **🧪 Test & Quality**
   - Tests unitaires, fuzzing, E2E
   - Linting et formatage
   - Multi-plateforme (Linux, Windows, macOS)

3. **🔍 SonarCloud Analysis**
   - Analyse de qualité de code
   - Métriques de complexité
   - Couverture de code

4. **🛡️ Dependency Scan (Snyk)**
   - Scan des vulnérabilités
   - Mise à jour des dépendances
   - Politiques de sécurité

5. **🎭 E2E Tests**
   - Tests Playwright
   - Multi-navigateurs
   - Tests de régression

6. **🏗️ Build & Deploy**
   - Build de production
   - Tests de déploiement
   - Déploiement automatique

## 📈 Métriques de Qualité

### Seuils de Qualité
- **Couverture de code** : 70% minimum
- **Complexité cyclomatique** : < 10
- **Duplication de code** : < 3%
- **Vulnérabilités** : 0 critique, 0 haute

### Rapports
- **SonarCloud** : Métriques détaillées
- **Codecov** : Couverture de code
- **Snyk** : Vulnérabilités
- **GitHub Actions** : Résumé des tests

## 🔧 Configuration Locale

### Prérequis
```bash
# Node.js 18+
node --version

# npm ou yarn
npm --version

# Git
git --version
```

### Installation
```bash
# Cloner le repository
git clone https://github.com/ILYESS24/rork-ai-builder.git
cd rork-ai-builder

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local

# Lancer les tests
npm run test:all

# Lancer l'analyse de qualité
npm run quality:check
```

### Variables d'Environnement
```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 🚨 Résolution des Problèmes

### Problèmes Courants

1. **Échec des tests de fuzzing**
   - Augmenter le timeout dans `jest.config.js`
   - Réduire le nombre de runs pour les tests lents

2. **Échec SonarCloud**
   - Vérifier le token SONAR_TOKEN
   - Vérifier la configuration dans `sonar-project.properties`

3. **Échec Snyk**
   - Vérifier le token SNYK_TOKEN
   - Mettre à jour les dépendances vulnérables

4. **Échec des tests E2E**
   - Vérifier que l'application démarre correctement
   - Augmenter les timeouts dans `playwright.config.ts`

### Logs et Debug
```bash
# Logs détaillés des tests
npm run test:unit -- --verbose

# Logs des tests E2E
npm run test:e2e -- --debug

# Analyse locale avec SonarCloud
npx sonar-scanner

# Scan local avec Snyk
npx snyk test
```

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Snyk Documentation](https://docs.snyk.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Fast-Check Documentation](https://fast-check.dev/)

## 🆘 Support

En cas de problème :
1. Vérifiez les logs GitHub Actions
2. Consultez la documentation des services
3. Vérifiez la configuration des secrets
4. Testez en local avec les mêmes commandes

---

**🎉 Votre pipeline CI/CD est maintenant configuré !**

Le pipeline s'exécutera automatiquement à chaque push et PR, fournissant une analyse complète de la qualité, sécurité et performance de votre code.
