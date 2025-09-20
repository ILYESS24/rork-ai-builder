import { test, expect } from '@playwright/test'

test.describe('Rork AI Builder - Tests de Fonctionnalité', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('devrait afficher la page d\'accueil avec tous les éléments', async ({ page }) => {
    // Vérifier le header
    await expect(page.getByText('Rork AI Builder')).toBeVisible()
    await expect(page.getByText('Enterprise Edition')).toBeVisible()
    
    // Vérifier les boutons de navigation
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Commencer' })).toBeVisible()
    
    // Vérifier le titre principal
    await expect(page.getByText('Construisez des applications IA')).toBeVisible()
    await expect(page.getByText('à la vitesse de l\'éclair')).toBeVisible()
  })

  test('devrait afficher les onglets de navigation', async ({ page }) => {
    // Vérifier que tous les onglets sont présents
    await expect(page.getByRole('tab', { name: 'Générateur IA' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Éditeur' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Prompts' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible()
  })

  test('devrait permettre la navigation entre les onglets', async ({ page }) => {
    // Vérifier que l'onglet générateur est actif par défaut
    await expect(page.getByRole('tab', { name: 'Générateur IA' })).toHaveAttribute('data-state', 'active')
    
    // Cliquer sur l'onglet Éditeur
    await page.getByRole('tab', { name: 'Éditeur' }).click()
    await expect(page.getByRole('tab', { name: 'Éditeur' })).toHaveAttribute('data-state', 'active')
    
    // Cliquer sur l'onglet Prompts
    await page.getByRole('tab', { name: 'Prompts' }).click()
    await expect(page.getByRole('tab', { name: 'Prompts' })).toHaveAttribute('data-state', 'active')
    
    // Cliquer sur l'onglet Dashboard
    await page.getByRole('tab', { name: 'Dashboard' }).click()
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute('data-state', 'active')
  })

  test('devrait afficher le générateur de code IA', async ({ page }) => {
    // S'assurer qu'on est sur l'onglet générateur
    await page.getByRole('tab', { name: 'Générateur IA' }).click()
    
    // Vérifier les éléments du générateur
    await expect(page.getByText('Configuration de Génération')).toBeVisible()
    await expect(page.getByText('Prompt de Génération')).toBeVisible()
    await expect(page.getByText('Langage de programmation')).toBeVisible()
    await expect(page.getByText('Provider IA')).toBeVisible()
  })

  test('devrait afficher l\'éditeur de code', async ({ page }) => {
    // Naviguer vers l'onglet éditeur
    await page.getByRole('tab', { name: 'Éditeur' }).click()
    
    // Vérifier les éléments de l'éditeur
    await expect(page.getByText('Éditeur de Code')).toBeVisible()
    await expect(page.getByText('Langage:')).toBeVisible()
    await expect(page.getByText('Thème:')).toBeVisible()
    await expect(page.getByText('Code')).toBeVisible()
    await expect(page.getByText('Sortie')).toBeVisible()
  })

  test('devrait afficher le système de prompts', async ({ page }) => {
    // Naviguer vers l'onglet prompts
    await page.getByRole('tab', { name: 'Prompts' }).click()
    
    // Vérifier les éléments du système de prompts
    await expect(page.getByText('Système de Prompts IA')).toBeVisible()
    await expect(page.getByText('Catégorie')).toBeVisible()
    await expect(page.getByText('Langage')).toBeVisible()
    await expect(page.getByText('Prompts Populaires')).toBeVisible()
  })

  test('devrait permettre de générer du code avec l\'IA', async ({ page }) => {
    // Naviguer vers le générateur
    await page.getByRole('tab', { name: 'Générateur IA' }).click()
    
    // Remplir le prompt
    const promptTextarea = page.locator('textarea[placeholder*="Décrivez le code"]')
    await promptTextarea.fill('Crée un composant React pour un bouton')
    
    // Cliquer sur générer
    await page.getByRole('button', { name: 'Générer le Code' }).click()
    
    // Attendre la génération (simulation)
    await page.waitForTimeout(3000)
    
    // Vérifier que le code est généré
    await expect(page.getByText('Code Généré')).toBeVisible()
  })

  test('devrait être responsive sur mobile', async ({ page }) => {
    // Changer la taille de l'écran pour mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Vérifier que les éléments s'adaptent
    await expect(page.getByText('Rork AI Builder')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Générateur IA' })).toBeVisible()
  })

  test('devrait afficher les fonctionnalités de l\'Enterprise Edition', async ({ page }) => {
    // Faire défiler vers la section fonctionnalités
    await page.evaluate(() => window.scrollTo(0, 800))
    
    // Vérifier les cartes de fonctionnalités
    await expect(page.getByText('Génération de Code IA Avancée')).toBeVisible()
    await expect(page.getByText('Éditeur de Code Collaboratif')).toBeVisible()
    await expect(page.getByText('Tableau de Bord Analytique')).toBeVisible()
    await expect(page.getByText('Intégrations Multi-LLM')).toBeVisible()
  })
})
