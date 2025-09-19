import {
  validateEmail,
  validateCodeLength,
  validateFramework,
  sanitizeInput,
  validateHTML,
  validateCSS,
  validateJavaScript,
} from '../validation'

describe('Validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('user123@test-domain.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validateCodeLength', () => {
    it('should validate code length', () => {
      const shortCode = 'console.log("hello")'
      const longCode = 'a'.repeat(100001)

      expect(validateCodeLength(shortCode)).toBe(true)
      expect(validateCodeLength(longCode)).toBe(false)
      expect(validateCodeLength(shortCode, 10)).toBe(false)
    })
  })

  describe('validateFramework', () => {
    it('should validate supported frameworks', () => {
      expect(validateFramework('react')).toBe(true)
      expect(validateFramework('vue')).toBe(true)
      expect(validateFramework('vanilla')).toBe(true)
      expect(validateFramework('nextjs')).toBe(true)
      expect(validateFramework('svelte')).toBe(true)
    })

    it('should reject unsupported frameworks', () => {
      expect(validateFramework('angular')).toBe(false)
      expect(validateFramework('ember')).toBe(false)
      expect(validateFramework('')).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove dangerous scripts', () => {
      const maliciousInput = '<script>alert("hack")</script>Hello world'
      const result = sanitizeInput(maliciousInput)
      expect(result).toBe('Hello world')
    })

    it('should remove javascript: protocols', () => {
      const maliciousInput = '<a href="javascript:alert(1)">Click me</a>'
      const result = sanitizeInput(maliciousInput)
      expect(result).toBe('<a href="">Click me</a>')
    })

    it('should remove event handlers', () => {
      const maliciousInput = '<div onclick="alert(1)">Click me</div>'
      const result = sanitizeInput(maliciousInput)
      expect(result).toBe('<div>Click me</div>')
    })
  })

  describe('validateHTML', () => {
    it('should validate correct HTML', () => {
      const validHTML = '<html><body><div>Hello</div></body></html>'
      const result = validateHTML(validHTML)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect incomplete HTML', () => {
      const invalidHTML = 'Hello world'
      const result = validateHTML(invalidHTML)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Le code HTML semble incomplet')
    })

    it('should detect unclosed tags', () => {
      const invalidHTML = '<div>Hello<span>World</div>'
      const result = validateHTML(invalidHTML)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Certaines balises HTML ne sont pas fermées')
    })
  })

  describe('validateCSS', () => {
    it('should validate correct CSS', () => {
      const validCSS = '.class { color: red; }'
      const result = validateCSS(validCSS)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect unbalanced braces', () => {
      const invalidCSS = '.class { color: red; '
      const result = validateCSS(invalidCSS)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Les accolades CSS ne sont pas équilibrées')
    })

    it('should handle empty CSS', () => {
      const result = validateCSS('')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('validateJavaScript', () => {
    it('should validate correct JavaScript', () => {
      const validJS = 'console.log("Hello world")'
      const result = validateJavaScript(validJS)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid JavaScript syntax', () => {
      const invalidJS = 'console.log("Hello world"'
      const result = validateJavaScript(invalidJS)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('Erreur JavaScript')
    })

    it('should handle empty JavaScript', () => {
      const result = validateJavaScript('')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
