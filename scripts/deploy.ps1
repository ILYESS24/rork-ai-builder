# Script de déploiement PowerShell pour Render
# Usage: .\scripts\deploy.ps1

Write-Host "🚀 Déploiement de Rork AI Builder sur Render..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet." -ForegroundColor Red
    exit 1
}

# Vérifier que git est configuré
try {
    git status | Out-Null
} catch {
    Write-Host "❌ Erreur: Ce n'est pas un repository git." -ForegroundColor Red
    exit 1
}

# Vérifier que toutes les dépendances sont installées
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Vérifier le build local
Write-Host "🔨 Test du build local..." -ForegroundColor Yellow
try {
    npm run build
} catch {
    Write-Host "❌ Erreur: Le build local a échoué. Corrigez les erreurs avant de déployer." -ForegroundColor Red
    exit 1
}

# Vérifier les variables d'environnement
Write-Host "🔧 Vérification des variables d'environnement..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Avertissement: .env.local non trouvé. Assurez-vous de configurer les variables dans Render Dashboard." -ForegroundColor Yellow
}

# Ajouter tous les fichiers
Write-Host "📝 Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Commit avec timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy to Render - $timestamp"

# Push vers GitHub
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Déploiement lancé !" -ForegroundColor Green
Write-Host "📊 Surveillez les logs dans Render Dashboard" -ForegroundColor Cyan
Write-Host "🌐 Votre application sera disponible sur: https://rork-ai-builder.onrender.com" -ForegroundColor Cyan

# Instructions finales
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Aller sur render.com" -ForegroundColor White
Write-Host "2. Créer un nouveau Web Service" -ForegroundColor White
Write-Host "3. Connecter votre repository GitHub" -ForegroundColor White
Write-Host "4. Configurer les variables d'environnement" -ForegroundColor White
Write-Host "5. Déployer !" -ForegroundColor White
