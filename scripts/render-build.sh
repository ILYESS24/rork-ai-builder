#!/bin/bash

# Script de build optimisé pour Render.com
set -e

echo "🚀 Building Rork AI Builder for Render..."

# Installer les dépendances avec legacy-peer-deps
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Générer le client Prisma
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build de l'application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
