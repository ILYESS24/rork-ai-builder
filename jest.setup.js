// Configuration Jest pour les tests
import '@testing-library/jest-dom'

// Mock pour Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock pour Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock pour Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: false,
    user: null,
  }),
  SignInButton: ({ children }) => children,
  SignUpButton: ({ children }) => children,
  UserButton: () => <div data-testid="user-button" />,
  ClerkProvider: ({ children }) => children,
}))

// Mock pour les modules Node.js
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    rmdir: jest.fn(),
    unlink: jest.fn(),
  },
}))

// Configuration globale pour les tests
global.fetch = jest.fn()

// Mock pour les API externes
global.fetch.mockImplementation((url) => {
  if (url.includes('/api/generate')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        code: 'console.log("Generated code")',
        metadata: {
          title: 'Test App',
          description: 'Generated app',
          framework: 'html',
        },
      }),
    })
  }
  
  if (url.includes('/api/health')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Rork AI Builder',
      }),
    })
  }
  
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Not found' }),
  })
})

// Configuration pour les tests de fuzzing
beforeAll(() => {
  // Configuration globale pour fast-check
  if (typeof global.fc !== 'undefined') {
    global.fc.configureGlobal({
      numRuns: process.env.NODE_ENV === 'test' ? 10 : 100,
      timeout: 10000,
    })
  }
})

afterEach(() => {
  // Nettoyage après chaque test
  jest.clearAllMocks()
})

// Configuration pour les tests de performance
jest.setTimeout(30000)