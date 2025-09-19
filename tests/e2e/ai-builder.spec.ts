import { test, expect } from '@playwright/test'

test.describe('🤖 Rork AI Builder - Tests E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/')
  })

  test('devrait afficher la page d\'accueil pour les utilisateurs non connectés', async ({ page }) => {
    // Vérifier que la page d'accueil s'affiche
    await expect(page).toHaveTitle(/Rork AI Builder/)
    
    // Vérifier les éléments principaux
    await expect(page.locator('h1')).toContainText('Créez des applications IA')
    await expect(page.getByText('Commencer gratuitement')).toBeVisible()
    await expect(page.getByText('Enterprise Edition')).toBeVisible()
  })

  test('devrait permettre la navigation vers la connexion', async ({ page }) => {
    // Cliquer sur le bouton de connexion
    await page.getByText('Se connecter').first().click()
    
    // Vérifier que la modal de connexion s'ouvre
    await expect(page.locator('[data-testid="clerk-modal"]')).toBeVisible()
  })

  test('devrait afficher le dashboard pour les utilisateurs connectés', async ({ page }) => {
    // Simuler une connexion utilisateur (mock)
    await page.evaluate(() => {
      // Mock Clerk pour simuler un utilisateur connecté
      window.localStorage.setItem('clerk-session', 'mock-session')
    })
    
    // Recharger la page
    await page.reload()
    
    // Vérifier que le dashboard s'affiche
    await expect(page.getByText('Dashboard Rork AI Builder')).toBeVisible()
    await expect(page.getByText('Générateur IA')).toBeVisible()
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('devrait permettre de générer du code avec l\'IA', async ({ page }) => {
    // Naviguer vers l'onglet générateur
    await page.getByText('Générateur IA').click()
    
    // Remplir le formulaire de génération
    const promptTextarea = page.locator('textarea[placeholder*="Décrivez votre application"]')
    await promptTextarea.fill('Créez une page d\'accueil moderne pour une startup tech')
    
    // Cliquer sur le bouton de génération
    await page.getByText('Générer le Code').click()
    
    // Vérifier que le code généré s'affiche
    await expect(page.getByText('Code Généré')).toBeVisible()
    await expect(page.locator('pre')).toBeVisible()
  })

  test('devrait afficher les métriques du dashboard', async ({ page }) => {
    // Naviguer vers l'onglet dashboard
    await page.getByText('Dashboard').click()
    
    // Vérifier que les métriques s'affichent
    await expect(page.getByText('Projets')).toBeVisible()
    await expect(page.getByText('Générations')).toBeVisible()
    await expect(page.getByText('Utilisateurs')).toBeVisible()
    await expect(page.getByText('Revenus')).toBeVisible()
  })

  test('devrait être responsive sur mobile', async ({ page }) => {
    // Changer la taille de l'écran pour mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Vérifier que la navigation mobile fonctionne
    await expect(page.locator('header')).toBeVisible()
    
    // Vérifier que le contenu s'adapte
    await expect(page.getByText('Rork AI Builder')).toBeVisible()
  })

  test('devrait gérer les erreurs API gracieusement', async ({ page }) => {
    // Intercepter les requêtes API et simuler une erreur
    await page.route('**/api/generate', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    // Essayer de générer du code
    await page.getByText('Générateur IA').click()
    await page.locator('textarea').fill('Test prompt')
    await page.getByText('Générer le Code').click()
    
    // Vérifier que l'erreur est gérée
    await expect(page.getByText(/erreur/i)).toBeVisible()
  })

  test('devrait permettre la copie du code généré', async ({ page }) => {
    // Générer du code
    await page.getByText('Générateur IA').click()
    await page.locator('textarea').fill('Créez une application simple')
    await page.getByText('Générer le Code').click()
    
    // Attendre que le code soit généré
    await expect(page.getByText('Code Généré')).toBeVisible()
    
    // Cliquer sur le bouton copier
    await page.getByText('Copier').click()
    
    // Vérifier que le code est copié (simulation)
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toBeTruthy()
  })

  test('devrait afficher les projets récents', async ({ page }) => {
    // Naviguer vers le dashboard
    await page.getByText('Dashboard').click()
    
    // Vérifier que la section projets récents s'affiche
    await expect(page.getByText('Projets Récents')).toBeVisible()
    
    // Vérifier qu'il y a des projets listés
    const projects = page.locator('[data-testid="project-item"]')
    await expect(projects).toHaveCount.greaterThan(0)
  })

  test('devrait permettre la navigation entre les onglets', async ({ page }) => {
    // Vérifier que l'onglet générateur est actif par défaut
    await expect(page.getByText('Générateur IA')).toHaveClass(/active/)
    
    // Cliquer sur l'onglet dashboard
    await page.getByText('Dashboard').click()
    
    // Vérifier que l'onglet dashboard est maintenant actif
    await expect(page.getByText('Dashboard')).toHaveClass(/active/)
    
    // Vérifier que le contenu du dashboard s'affiche
    await expect(page.getByText('Santé du Système')).toBeVisible()
  })

  test('devrait respecter le thème sombre/clair', async ({ page }) => {
    // Vérifier que le thème clair est appliqué par défaut
    const body = page.locator('body')
    await expect(body).toHaveClass(/light/)
    
    // Simuler le changement de thème (si implémenté)
    // await page.getByTestId('theme-toggle').click()
    // await expect(body).toHaveClass(/dark/)
  })
})
