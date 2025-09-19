import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  code: z.string().min(1, 'Code requis'),
  framework: z.string().default('vanilla'),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const projects = await getProjects(user.id)

    return NextResponse.json({
      success: true,
      projects,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({
      error: 'Erreur lors de la récupération des projets'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name, description, code, framework } = CreateProjectSchema.parse(body)

    const project = await createProject({
      user_id: user.id,
      name,
      description,
      code,
      framework,
    })

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Erreur lors de la création du projet'
    }, { status: 500 })
  }
}
