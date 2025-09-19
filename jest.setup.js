import '@testing-library/jest-dom'

// Mock Next.js router
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

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(() => Promise.resolve({
    id: 'test-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User',
  })),
  requireAuth: jest.fn(() => Promise.resolve({
    id: 'test-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User',
  })),
  clerkClient: {
    users: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}))

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}))

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn(() => Promise.resolve({
          choices: [{
            message: {
              content: '<div>Test HTML</div>',
            },
          }],
        })),
      },
    },
  })),
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(() => Promise.resolve({
          id: 'test-session-id',
          url: 'https://checkout.stripe.com/test',
        })),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(() => Promise.resolve({
          url: 'https://billing.stripe.com/test',
        })),
      },
    },
  }))
})

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  startTransaction: jest.fn(),
  addBreadcrumb: jest.fn(),
}))

// Setup global test environment
global.fetch = jest.fn()

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-clerk-key'
process.env.CLERK_SECRET_KEY = 'test-clerk-secret'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-supabase-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-service-key'
process.env.STRIPE_SECRET_KEY = 'test-stripe-key'
process.env.PINECONE_API_KEY = 'test-pinecone-key'
process.env.PINECONE_INDEX_NAME = 'test-index'
