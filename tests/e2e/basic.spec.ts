import { test, expect } from '@playwright/test'

test.describe('Basic Tests', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })
})