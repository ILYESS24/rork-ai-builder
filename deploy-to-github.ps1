# Script PowerShell pour déployer Rork AI Builder sur GitHub
# Utilisation: .\deploy-to-github.ps1

Write-Host "🚀 Déploiement de Rork AI Builder sur GitHub" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Vérifier si Git est installé
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git n'est pas installé. Veuillez installer Git d'abord."
    exit 1
}

# Vérifier si on est dans un repository Git
if (!(Test-Path ".git")) {
    Write-Host "Initialisation du repository Git..." -ForegroundColor Yellow
    git init
}

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Créer un commit
$commitMessage = "Deploy Rork AI Builder - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Création du commit..." -ForegroundColor Yellow
git commit -m $commitMessage

# Vérifier si le remote existe
$remoteExists = git remote get-url origin 2>$null
if (!$remoteExists) {
    Write-Host "Ajout du remote GitHub..." -ForegroundColor Yellow
    git remote add origin https://github.com/ILYESS24/rork-ai-builder.git
}

# Pousser vers GitHub
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host "✅ Déploiement réussi sur GitHub !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Repository: https://github.com/ILYESS24/rork-ai-builder" -ForegroundColor Cyan
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "   1. Configurez les variables d'environnement sur Render.com" -ForegroundColor White
    Write-Host "   2. Connectez le repository à Render.com" -ForegroundColor White
    Write-Host "   3. Déployez l'application" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Consultez DEPLOYMENT_INSTRUCTIONS.md pour les détails" -ForegroundColor Cyan
} catch {
    Write-Error "❌ Erreur lors du push vers GitHub: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "💡 Solutions possibles:" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez que le repository existe sur GitHub.com" -ForegroundColor White
    Write-Host "   2. Vérifiez vos credentials Git" -ForegroundColor White
    Write-Host "   3. Créez le repository sur GitHub.com d'abord" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Pour créer le repository GitHub:" -ForegroundColor Cyan
    Write-Host "   1. Allez sur https://github.com/ILYESS24" -ForegroundColor White
    Write-Host "   2. Cliquez sur 'New repository'" -ForegroundColor White
    Write-Host "   3. Nom: rork-ai-builder" -ForegroundColor White
    Write-Host "   4. Description: Rork AI Builder Enterprise Edition" -ForegroundColor White
    Write-Host "   5. Public" -ForegroundColor White
    Write-Host "   6. Ne cochez PAS 'Add README'" -ForegroundColor White
}
