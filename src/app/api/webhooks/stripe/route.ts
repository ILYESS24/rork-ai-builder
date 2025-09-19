import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { handleStripeWebhook } from '@/lib/payments/stripe-service'
import { MonitoringService } from '@/lib/monitoring/sentry-config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('Signature Stripe manquante')
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    )
  }

  try {
    // Vérifier la signature du webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    // Capturer l'événement webhook
    MonitoringService.captureUsageMetric(
      'stripe_webhook',
      event.type,
      {
        eventId: event.id,
        timestamp: new Date().toISOString(),
      }
    )

    // Traiter l'événement
    await handleStripeWebhook(event)

    console.log(`Webhook Stripe traité: ${event.type}`)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Erreur webhook Stripe:', error)
    
    MonitoringService.captureError(error as Error, {
      component: 'StripeWebhook',
      action: 'process_webhook',
    })

    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 400 }
    )
  }
}
