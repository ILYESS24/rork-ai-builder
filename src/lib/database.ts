// Configuration de base de données simple pour éviter les erreurs d'import
export const prisma = {
  // Mock Prisma client pour éviter les erreurs
  user: {
    findUnique: async (args: any) => null,
    create: async (args: any) => ({ id: 'mock-id', ...args.data }),
    update: async (args: any) => ({ id: args.where.id, ...args.data }),
    delete: async (args: any) => ({ id: args.where.id }),
  },
  project: {
    findMany: async () => [],
    create: async (args: any) => ({ id: 'mock-id', ...args.data }),
    update: async (args: any) => ({ id: args.where.id, ...args.data }),
    delete: async (args: any) => ({ id: args.where.id }),
  },
  generation: {
    findMany: async () => [],
    create: async (args: any) => ({ id: 'mock-id', ...args.data }),
  },
}

// Fonctions helper pour éviter les erreurs d'import
export const getProjects = async () => []
export const createProject = async (data: any) => ({ id: 'mock-id', ...data })
export const getProject = async (id: string) => ({ id, name: 'Mock Project' })
export const updateProject = async (id: string, data: any) => ({ id, ...data })
export const deleteProject = async (id: string) => ({ id })