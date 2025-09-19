import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  priceId: string
  features: string[]
  limits: {
    projects: number
    generations: number
    storage: string
  }
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Parfait pour commencer',
    price: 0,
    priceId: '',
    features: [
      '5 projets',
      '50 générations par mois',
      'Support communautaire',
      'Templates de base'
    ],
    limits: {
      projects: 5,
      generations: 50,
      storage: '100MB'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les développeurs sérieux',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Projets illimités',
      '1000 générations par mois',
      'Support prioritaire',
      'Tous les templates',
      'Export avancé',
      'Collaboration'
    ],
    limits: {
      projects: -1, // Illimité
      generations: 1000,
      storage: '10GB'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour les équipes',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      'Tout du plan Pro',
      'Générations illimitées',
      'Support dédié',
      'API privée',
      'Intégrations personnalisées',
      'SLA garanti'
    ],
    limits: {
      projects: -1,
      generations: -1,
      storage: '100GB'
    }
  }
]

export async function createCheckoutSession(
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  })

  return session
}

export async function createPortalSession(userId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: userId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscription(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  })

  return subscriptions.data[0] || null
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  })

  return updatedSubscription
}
