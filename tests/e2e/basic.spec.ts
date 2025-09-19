import { test, expect } from '@playwright/test'

test.describe('Rork AI Builder - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main page', async ({ page }) => {
    await expect(page).toHaveTitle(/Rork AI Builder/)
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('Rork AI Builder')
    await expect(page.locator('text=AI Assistant')).toBeVisible()
    await expect(page.locator('text=Code Generated')).toBeVisible()
  })

  test('should show chat interface', async ({ page }) => {
    await expect(page.locator('textarea[placeholder*="Décrivez votre application"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show example prompts', async ({ page }) => {
    // Check if example buttons are visible
    await expect(page.locator('text=Landing Page')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Portfolio')).toBeVisible()
  })

  test('should have preview and code tabs', async ({ page }) => {
    await expect(page.locator('text=Preview')).toBeVisible()
    await expect(page.locator('text=Code')).toBeVisible()
  })

  test('should have download button', async ({ page }) => {
    const downloadButton = page.locator('text=Download')
    await expect(downloadButton).toBeVisible()
    await expect(downloadButton).toBeDisabled() // Should be disabled initially
  })
})

test.describe('Rork AI Builder - Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should allow typing in chat input', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="Décrivez votre application"]')
    await chatInput.fill('Crée une landing page simple')
    await expect(chatInput).toHaveValue('Crée une landing page simple')
  })

  test('should enable send button when input has content', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="Décrivez votre application"]')
    const sendButton = page.locator('button[type="submit"]')
    
    await expect(sendButton).toBeDisabled()
    
    await chatInput.fill('Test prompt')
    await expect(sendButton).toBeEnabled()
  })

  test('should disable send button when input is empty', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="Décrivez votre application"]')
    const sendButton = page.locator('button[type="submit"]')
    
    await chatInput.fill('Test prompt')
    await expect(sendButton).toBeEnabled()
    
    await chatInput.fill('')
    await expect(sendButton).toBeDisabled()
  })
})

test.describe('Rork AI Builder - Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check if main elements are still visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('textarea[placeholder*="Décrivez votre application"]')).toBeVisible()
  })

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    // Check if layout adapts properly
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=AI Assistant')).toBeVisible()
    await expect(page.locator('text=Code Generated')).toBeVisible()
  })
})
