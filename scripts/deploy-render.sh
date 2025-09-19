#!/bin/bash

# Script de déploiement pour Render.com
# Rork AI Builder - Enterprise Edition

set -e

echo "🚀 Déploiement de Rork AI Builder sur Render.com"
echo "=================================================="

# Variables
PROJECT_NAME="rork-ai-builder"
REGION="oregon"
PLAN="starter"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        error "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier Docker (optionnel)
    if ! command -v docker &> /dev/null; then
        warning "Docker n'est pas installé - déploiement sans container"
    fi
    
    success "Prérequis vérifiés"
}

# Installer les dépendances
install_dependencies() {
    log "Installation des dépendances..."
    
    npm install --legacy-peer-deps
    
    if [ $? -eq 0 ]; then
        success "Dépendances installées"
    else
        error "Échec de l'installation des dépendances"
        exit 1
    fi
}

# Construire l'application
build_application() {
    log "Construction de l'application..."
    
    # Générer le client Prisma
    npx prisma generate
    
    # Build Next.js
    npm run build
    
    if [ $? -eq 0 ]; then
        success "Application construite"
    else
        error "Échec de la construction"
        exit 1
    fi
}

# Vérifier la configuration
check_configuration() {
    log "Vérification de la configuration..."
    
    # Vérifier les variables d'environnement requises
    required_vars=(
        "DATABASE_URL"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        "CLERK_SECRET_KEY"
        "OPENAI_API_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        error "Variables d'environnement manquantes: ${missing_vars[*]}"
        warning "Assurez-vous de configurer ces variables sur Render.com"
    else
        success "Configuration vérifiée"
    fi
}

# Créer le fichier de configuration Render
create_render_config() {
    log "Création de la configuration Render..."
    
    cat > render.yaml << EOF
services:
  - type: web
    name: ${PROJECT_NAME}
    env: docker
    dockerfilePath: ./Dockerfile
    dockerContext: .
    plan: ${PLAN}
    region: ${REGION}
    branch: main
    buildCommand: npm run render:build
    startCommand: npm run render:start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: ${PROJECT_NAME}-database
          property: connectionString
      - key: NEXT_PUBLIC_APP_URL
        value: https://${PROJECT_NAME}.onrender.com
      - key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        sync: false
      - key: CLERK_SECRET_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: STRIPE_PUBLISHABLE_KEY
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_PRO_PRICE_ID
        sync: false
      - key: STRIPE_ENTERPRISE_PRICE_ID
        sync: false
      - key: PINECONE_API_KEY
        sync: false
      - key: PINECONE_INDEX_NAME
        sync: false
      - key: NEXT_PUBLIC_SENTRY_DSN
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false

  - type: redis
    name: ${PROJECT_NAME}-redis
    plan: starter
    region: ${REGION}
    maxmemoryPolicy: allkeys-lru

databases:
  - name: ${PROJECT_NAME}-database
    databaseName: rork_ai_builder
    user: rork_user
    plan: starter
    region: ${REGION}
EOF

    success "Configuration Render créée"
}

# Optimiser les images
optimize_images() {
    log "Optimisation des images..."
    
    # Créer un dossier pour les images optimisées
    mkdir -p public/optimized
    
    # Optimiser les images (si ImageMagick est disponible)
    if command -v convert &> /dev/null; then
        find public -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" | while read img; do
            filename=$(basename "$img")
            convert "$img" -resize 1920x1080\> "public/optimized/$filename"
        done
        success "Images optimisées"
    else
        warning "ImageMagick non disponible - optimisation des images ignorée"
    fi
}

# Préparer les fichiers pour le déploiement
prepare_deployment() {
    log "Préparation du déploiement..."
    
    # Nettoyer les fichiers temporaires
    rm -rf .next/cache
    rm -rf node_modules/.cache
    
    # Créer un fichier .dockerignore
    cat > .dockerignore << EOF
node_modules
npm-debug.log
.next
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage
.nyc_output
*.log
EOF

    success "Déploiement préparé"
}

# Tester l'application localement
test_local() {
    log "Test local de l'application..."
    
    # Démarrer l'application en arrière-plan
    npm start &
    APP_PID=$!
    
    # Attendre que l'application démarre
    sleep 10
    
    # Tester l'endpoint de santé
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        success "Application testée avec succès"
    else
        error "L'application ne répond pas correctement"
        kill $APP_PID 2>/dev/null || true
        exit 1
    fi
    
    # Arrêter l'application
    kill $APP_PID 2>/dev/null || true
}

# Créer un commit Git
create_git_commit() {
    log "Création du commit Git..."
    
    # Ajouter tous les fichiers
    git add .
    
    # Créer un commit
    git commit -m "Deploy to Render - $(date '+%Y-%m-%d %H:%M:%S')" || true
    
    success "Commit Git créé"
}

# Instructions de déploiement
show_deployment_instructions() {
    log "Instructions de déploiement sur Render.com:"
    echo ""
    echo "1. Créez un compte sur https://render.com"
    echo "2. Connectez votre repository GitHub"
    echo "3. Configurez les variables d'environnement:"
    echo "   - DATABASE_URL (PostgreSQL)"
    echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "   - CLERK_SECRET_KEY"
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY (optionnel)"
    echo "   - STRIPE_SECRET_KEY (optionnel)"
    echo "   - PINECONE_API_KEY (optionnel)"
    echo "   - NEXT_PUBLIC_SENTRY_DSN (optionnel)"
    echo ""
    echo "4. Utilisez le fichier render.yaml pour la configuration"
    echo "5. Déployez depuis la branche main"
    echo ""
    echo "URL de déploiement: https://${PROJECT_NAME}.onrender.com"
    echo ""
    success "Instructions affichées"
}

# Fonction principale
main() {
    echo "🚀 Rork AI Builder - Déploiement Render.com"
    echo "============================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    check_configuration
    build_application
    optimize_images
    prepare_deployment
    test_local
    create_render_config
    create_git_commit
    show_deployment_instructions
    
    echo ""
    success "Préparation du déploiement terminée!"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Push vers GitHub: git push origin main"
    echo "2. Connectez le repo à Render.com"
    echo "3. Configurez les variables d'environnement"
    echo "4. Déployez!"
    echo ""
}

# Exécuter le script
main "$@"
