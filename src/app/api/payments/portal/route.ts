import { NextRequest, NextResponse } from 'next/server'
import { createPortalSession } from '@/lib/payments'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const PortalSchema = z.object({
  returnUrl: z.string().url('URL de retour invalide'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { returnUrl } = PortalSchema.parse(body)

    const session = await createPortalSession(user.id, returnUrl)

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating portal session:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Erreur lors de la création de la session de portail'
    }, { status: 500 })
  }
}
