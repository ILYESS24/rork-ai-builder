import Stripe from 'stripe'
import { prisma } from '@/lib/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    generations: number
    projects: number
    storage: number // en MB
    collaborators: number
    support: string
  }
  stripePriceId: string
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Parfait pour commencer',
    price: 0,
    currency: 'eur',
    interval: 'month',
    features: [
      '50 générations par mois',
      '5 projets maximum',
      '100 MB de stockage',
      'Support communautaire',
      'Templates de base'
    ],
    limits: {
      generations: 50,
      projects: 5,
      storage: 100,
      collaborators: 1,
      support: 'community'
    },
    stripePriceId: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les développeurs professionnels',
    price: 29,
    currency: 'eur',
    interval: 'month',
    features: [
      '1000 générations par mois',
      'Projets illimités',
      '10 GB de stockage',
      'Support prioritaire',
      'Tous les templates',
      'Export avancé',
      'Collaboration temps réel'
    ],
    limits: {
      generations: 1000,
      projects: -1, // Illimité
      storage: 10240, // 10 GB
      collaborators: 10,
      support: 'priority'
    },
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour les équipes et entreprises',
    price: 99,
    currency: 'eur',
    interval: 'month',
    features: [
      'Générations illimitées',
      'Projets illimités',
      '100 GB de stockage',
      'Support dédié',
      'Tous les templates premium',
      'API personnalisée',
      'Collaboration avancée',
      'Analytics détaillées',
      'Intégrations personnalisées'
    ],
    limits: {
      generations: -1, // Illimité
      projects: -1, // Illimité
      storage: 102400, // 100 GB
      collaborators: -1, // Illimité
      support: 'dedicated'
    },
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
  },
]

// Créer une session de checkout Stripe
export async function createCheckoutSession({
  userId,
  planId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  planId: string
  successUrl: string
  cancelUrl: string
}) {
  const plan = PLANS.find(p => p.id === planId)
  if (!plan) {
    throw new Error('Plan non trouvé')
  }

  if (plan.price === 0) {
    // Plan gratuit - pas besoin de checkout
    await upgradeToFreePlan(userId)
    return { url: successUrl }
  }

  // Récupérer ou créer le customer Stripe
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  let customerId = user.stripeCustomerId

  if (!customerId) {
    // Créer un nouveau customer Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        clerkId: userId,
      },
    })

    customerId = customer.id

    // Mettre à jour l'utilisateur avec l'ID customer
    await prisma.user.update({
      where: { clerkId: userId },
      data: { stripeCustomerId: customerId },
    })
  }

  // Créer la session de checkout
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
  })

  return session
}

// Créer une session de portail de facturation
export async function createBillingPortalSession(userId: string, returnUrl: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user?.stripeCustomerId) {
    throw new Error('Aucun abonnement trouvé')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  })

  return session
}

// Gérer les webhooks Stripe
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
      break

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice)
      break

    default:
      console.log(`Événement Stripe non géré: ${event.type}`)
  }
}

// Gérer l'achèvement du checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error('Métadonnées manquantes dans la session')
    return
  }

  const plan = PLANS.find(p => p.id === planId)
  if (!plan) {
    console.error('Plan non trouvé:', planId)
    return
  }

  // Récupérer la subscription
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      plan: plan.id.toUpperCase() as any,
      stripeSubscriptionId: subscription.id,
      stripePriceId: plan.stripePriceId,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`Utilisateur ${userId} a souscrit au plan ${planId}`)
}

// Gérer la mise à jour de l'abonnement
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('userId manquant dans les métadonnées de l\'abonnement')
    return
  }

  const plan = PLANS.find(p => p.stripePriceId === subscription.items.data[0].price.id)
  if (!plan) {
    console.error('Plan non trouvé pour l\'abonnement:', subscription.id)
    return
  }

  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      plan: plan.id.toUpperCase() as any,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`Abonnement mis à jour pour l'utilisateur ${userId}`)
}

// Gérer la suppression de l'abonnement
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('userId manquant dans les métadonnées de l\'abonnement')
    return
  }

  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      plan: 'FREE',
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  })

  console.log(`Abonnement supprimé pour l'utilisateur ${userId}`)
}

// Gérer le succès du paiement
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('userId manquant dans les métadonnées de l\'abonnement')
    return
  }

  // Créer une notification de paiement réussi
  await prisma.notification.create({
    data: {
      userId: userId,
      type: 'SYSTEM',
      title: 'Paiement réussi',
      content: `Votre abonnement a été renouvelé avec succès. Montant: ${invoice.amount_paid / 100}€`,
    },
  })

  console.log(`Paiement réussi pour l'utilisateur ${userId}`)
}

// Gérer l'échec du paiement
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('userId manquant dans les métadonnées de l\'abonnement')
    return
  }

  // Créer une notification d'échec de paiement
  await prisma.notification.create({
    data: {
      userId: userId,
      type: 'SYSTEM',
      title: 'Échec du paiement',
      content: 'Votre paiement a échoué. Veuillez mettre à jour votre méthode de paiement.',
    },
  })

  console.log(`Échec du paiement pour l'utilisateur ${userId}`)
}

// Passer au plan gratuit
async function upgradeToFreePlan(userId: string) {
  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      plan: 'FREE',
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  })

  console.log(`Utilisateur ${userId} passé au plan gratuit`)
}

// Vérifier les limites d'un utilisateur
export async function checkUserLimits(userId: string, action: 'generation' | 'project' | 'storage') {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  const plan = PLANS.find(p => p.id === user.plan.toLowerCase())
  if (!plan) {
    throw new Error('Plan non trouvé')
  }

  const limits = plan.limits

  switch (action) {
    case 'generation':
      if (limits.generations === -1) return true // Illimité
      return user.generationsUsed < limits.generations

    case 'project':
      if (limits.projects === -1) return true // Illimité
      return user.projectsCount < limits.projects

    case 'storage':
      if (limits.storage === -1) return true // Illimité
      return Number(user.storageUsed) < limits.storage * 1024 * 1024 // Convertir MB en bytes

    default:
      return false
  }
}

// Incrémenter l'utilisation
export async function incrementUsage(userId: string, action: 'generation' | 'project' | 'storage', amount: number = 1) {
  const updateData: any = {}

  switch (action) {
    case 'generation':
      updateData.generationsUsed = { increment: amount }
      break
    case 'project':
      updateData.projectsCount = { increment: amount }
      break
    case 'storage':
      updateData.storageUsed = { increment: amount }
      break
  }

  await prisma.user.update({
    where: { clerkId: userId },
    data: updateData,
  })
}

// Obtenir les statistiques d'utilisation
export async function getUserUsageStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  const plan = PLANS.find(p => p.id === user.plan.toLowerCase())
  if (!plan) {
    throw new Error('Plan non trouvé')
  }

  return {
    plan: plan.name,
    limits: plan.limits,
    usage: {
      generations: user.generationsUsed,
      projects: user.projectsCount,
      storage: Number(user.storageUsed),
    },
    usagePercentage: {
      generations: plan.limits.generations === -1 ? 0 : (user.generationsUsed / plan.limits.generations) * 100,
      projects: plan.limits.projects === -1 ? 0 : (user.projectsCount / plan.limits.projects) * 100,
      storage: plan.limits.storage === -1 ? 0 : (Number(user.storageUsed) / (plan.limits.storage * 1024 * 1024)) * 100,
    },
  }
}

export default {
  createCheckoutSession,
  createBillingPortalSession,
  handleStripeWebhook,
  checkUserLimits,
  incrementUsage,
  getUserUsageStats,
  PLANS,
}
