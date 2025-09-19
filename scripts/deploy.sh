#!/bin/bash

# Script de déploiement pour Render
# Usage: ./scripts/deploy.sh

echo "🚀 Déploiement de Rork AI Builder sur Render..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

# Vérifier que git est configuré
if ! git status &> /dev/null; then
    echo "❌ Erreur: Ce n'est pas un repository git."
    exit 1
fi

# Vérifier que toutes les dépendances sont installées
echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier le build local
echo "🔨 Test du build local..."
if ! npm run build; then
    echo "❌ Erreur: Le build local a échoué. Corrigez les erreurs avant de déployer."
    exit 1
fi

# Vérifier les variables d'environnement
echo "🔧 Vérification des variables d'environnement..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  Avertissement: .env.local non trouvé. Assurez-vous de configurer les variables dans Render Dashboard."
fi

# Ajouter tous les fichiers
echo "📝 Ajout des fichiers..."
git add .

# Commit avec timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Deploy to Render - $TIMESTAMP"

# Push vers GitHub
echo "🚀 Push vers GitHub..."
git push origin main

echo "✅ Déploiement lancé !"
echo "📊 Surveillez les logs dans Render Dashboard"
echo "🌐 Votre application sera disponible sur: https://rork-ai-builder.onrender.com"

# Instructions finales
echo ""
echo "📋 Prochaines étapes :"
echo "1. Aller sur render.com"
echo "2. Créer un nouveau Web Service"
echo "3. Connecter votre repository GitHub"
echo "4. Configurer les variables d'environnement"
echo "5. Déployer !"
