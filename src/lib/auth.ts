import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const user = await currentUser()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }
  return user
}

export async function getUserSubscription(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId)
    return user.publicMetadata?.subscription || 'free'
  } catch (error) {
    console.error('Error getting user subscription:', error)
    return 'free'
  }
}

export async function updateUserSubscription(userId: string, subscription: string) {
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        subscription
      }
    })
  } catch (error) {
    console.error('Error updating user subscription:', error)
  }
}
