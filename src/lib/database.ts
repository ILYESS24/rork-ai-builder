import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Types pour la base de données
export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  code: string
  framework: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  email: string
  name?: string
  subscription: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

// Fonctions utilitaires
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert([project])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getProjects(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProject(id: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Partial<Project>, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(id: string, userId: string) {
  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}
