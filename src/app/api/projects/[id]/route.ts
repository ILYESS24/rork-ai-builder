import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject, deleteProject } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  code: z.string().min(1).optional(),
  framework: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const project = await getProject(params.id, user.id)

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({
      error: 'Projet non trouvé'
    }, { status: 404 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const updates = UpdateProjectSchema.parse(body)

    const project = await updateProject(params.id, updates, user.id)

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error('Error updating project:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Erreur lors de la mise à jour du projet'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    await deleteProject(params.id, user.id)

    return NextResponse.json({
      success: true,
      message: 'Projet supprimé avec succès'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({
      error: 'Erreur lors de la suppression du projet'
    }, { status: 500 })
  }
}
