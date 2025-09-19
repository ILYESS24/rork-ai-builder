import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/payments'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const CheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID requis'),
  successUrl: z.string().url('URL de succès invalide'),
  cancelUrl: z.string().url('URL d\'annulation invalide'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { priceId, successUrl, cancelUrl } = CheckoutSchema.parse(body)

    const session = await createCheckoutSession(
      priceId,
      user.id,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Erreur lors de la création de la session de paiement'
    }, { status: 500 })
  }
}
