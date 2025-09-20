// Configuration Clerk pour le build
export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_build_key',
  secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_build_secret',
}
