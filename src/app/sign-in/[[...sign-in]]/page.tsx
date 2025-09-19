import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rork AI Builder
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Connectez-vous pour commencer à créer
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md',
              card: 'bg-white shadow-xl rounded-lg border-0',
              headerTitle: 'text-gray-900 text-2xl font-bold',
              headerSubtitle: 'text-gray-600 text-sm',
              socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50 rounded-md',
              socialButtonsBlockButtonText: 'text-gray-700 font-medium',
              formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md',
              footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
              identityPreviewText: 'text-gray-700',
              formFieldLabel: 'text-gray-700 font-medium',
              dividerLine: 'bg-gray-300',
              dividerText: 'text-gray-500',
            },
          }}
        />
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            En vous connectant, vous acceptez nos{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-700">
              Conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
