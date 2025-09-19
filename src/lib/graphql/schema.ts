import { gql } from 'graphql-tag'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { auth } from '@clerk/nextjs'

// Types GraphQL
export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    clerkId: String!
    email: String!
    firstName: String
    lastName: String
    imageUrl: String
    bio: String
    website: String
    location: String
    plan: Plan!
    generationsUsed: Int!
    projectsCount: Int!
    storageUsed: BigInt!
    createdAt: DateTime!
    updatedAt: DateTime!
    lastLoginAt: DateTime
    projects: [Project!]!
    templates: [Template!]!
  }

  type Project {
    id: ID!
    userId: String!
    user: User!
    name: String!
    description: String
    code: String!
    framework: Framework!
    language: String!
    linesOfCode: Int!
    complexity: Complexity!
    features: [String!]!
    tags: [String!]!
    isPublic: Boolean!
    isTemplate: Boolean!
    isForked: Boolean!
    forkedFromId: String
    forkedFrom: Project
    forks: [Project!]!
    viewsCount: Int!
    likesCount: Int!
    forksCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    lastModifiedAt: DateTime!
    versions: [ProjectVersion!]!
    collaborations: [Collaboration!]!
    comments: [Comment!]!
  }

  type ProjectVersion {
    id: ID!
    projectId: String!
    project: Project!
    versionNumber: Int!
    name: String
    code: String!
    changes: String
    createdAt: DateTime!
  }

  type Template {
    id: ID!
    userId: String
    user: User
    name: String!
    description: String!
    code: String!
    framework: Framework!
    category: TemplateCategory!
    industry: String
    tags: [String!]!
    isOfficial: Boolean!
    isPremium: Boolean!
    price: Float
    downloadsCount: Int!
    rating: Float!
    reviewsCount: Int!
    previewImage: String
    thumbnailImage: String
    createdAt: DateTime!
    updatedAt: DateTime!
    reviews: [TemplateReview!]!
  }

  type TemplateReview {
    id: ID!
    templateId: String!
    template: Template!
    userId: String!
    rating: Int!
    content: String
    createdAt: DateTime!
  }

  type Comment {
    id: ID!
    projectId: String!
    project: Project!
    userId: String!
    content: String!
    parentId: String
    parent: Comment
    replies: [Comment!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Collaboration {
    id: ID!
    projectId: String!
    project: Project!
    userId: String!
    user: User!
    role: CollaborationRole!
    joinedAt: DateTime!
    lastActiveAt: DateTime!
  }

  type Notification {
    id: ID!
    userId: String!
    user: User!
    type: NotificationType!
    title: String!
    content: String!
    data: JSON
    isRead: Boolean!
    createdAt: DateTime!
  }

  type UsageStats {
    plan: String!
    limits: UsageLimits!
    usage: Usage!
    usagePercentage: UsagePercentage!
  }

  type UsageLimits {
    generations: Int!
    projects: Int!
    storage: Int!
    collaborators: Int!
    support: String!
  }

  type Usage {
    generations: Int!
    projects: Int!
    storage: Int!
  }

  type UsagePercentage {
    generations: Float!
    projects: Float!
    storage: Float!
  }

  type AIGeneration {
    id: ID!
    userId: String!
    prompt: String!
    code: String!
    provider: String!
    model: String!
    metadata: JSON
    suggestions: [String!]!
    createdAt: DateTime!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!

    # Project queries
    myProjects(limit: Int, offset: Int): [Project!]!
    project(id: ID!): Project
    projects(limit: Int, offset: Int, isPublic: Boolean, tags: [String!], framework: Framework): [Project!]!
    projectVersions(projectId: ID!, limit: Int, offset: Int): [ProjectVersion!]!

    # Template queries
    templates(limit: Int, offset: Int, category: TemplateCategory, industry: String, isOfficial: Boolean): [Template!]!
    template(id: ID!): Template
    myTemplates(limit: Int, offset: Int): [Template!]!

    # Collaboration queries
    projectCollaborators(projectId: ID!): [Collaboration!]!
    myCollaborations: [Collaboration!]!

    # Comment queries
    projectComments(projectId: ID!, limit: Int, offset: Int): [Comment!]!

    # Notification queries
    myNotifications(limit: Int, offset: Int, isRead: Boolean): [Notification!]!
    unreadNotificationsCount: Int!

    # Usage queries
    myUsageStats: UsageStats!

    # AI Generation queries
    myGenerations(limit: Int, offset: Int): [AIGeneration!]!
    generation(id: ID!): AIGeneration

    # Search queries
    searchProjects(query: String!, limit: Int, offset: Int): [Project!]!
    searchTemplates(query: String!, limit: Int, offset: Int): [Template!]!
  }

  type Mutation {
    # Project mutations
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    forkProject(id: ID!): Project!
    likeProject(id: ID!): Project!
    viewProject(id: ID!): Project!

    # Template mutations
    createTemplate(input: CreateTemplateInput!): Template!
    updateTemplate(id: ID!, input: UpdateTemplateInput!): Template!
    deleteTemplate(id: ID!): Boolean!
    downloadTemplate(id: ID!): Template!

    # Comment mutations
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, input: UpdateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!

    # Collaboration mutations
    inviteCollaborator(input: InviteCollaboratorInput!): Collaboration!
    updateCollaboratorRole(id: ID!, role: CollaborationRole!): Collaboration!
    removeCollaborator(id: ID!): Boolean!
    acceptCollaborationInvite(invitationId: ID!): Collaboration!

    # AI Generation mutations
    generateCode(input: GenerateCodeInput!): AIGeneration!
    improveCode(id: ID!, feedback: String!): AIGeneration!

    # Notification mutations
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!

    # User mutations
    updateProfile(input: UpdateProfileInput!): User!
    deleteAccount: Boolean!
  }

  type Subscription {
    # Real-time subscriptions
    projectUpdated(projectId: ID!): Project!
    collaborationJoined(projectId: ID!): Collaboration!
    collaborationLeft(projectId: ID!): Collaboration!
    commentAdded(projectId: ID!): Comment!
    notificationReceived(userId: ID!): Notification!
  }

  # Input types
  input CreateProjectInput {
    name: String!
    description: String
    code: String!
    framework: Framework = HTML
    language: String = "html"
    tags: [String!] = []
    isPublic: Boolean = false
  }

  input UpdateProjectInput {
    name: String
    description: String
    code: String
    framework: Framework
    language: String
    tags: [String!]
    isPublic: Boolean
  }

  input CreateTemplateInput {
    name: String!
    description: String!
    code: String!
    framework: Framework!
    category: TemplateCategory!
    industry: String
    tags: [String!] = []
    isOfficial: Boolean = false
    isPremium: Boolean = false
    price: Float
  }

  input UpdateTemplateInput {
    name: String
    description: String
    code: String
    framework: Framework
    category: TemplateCategory
    industry: String
    tags: [String!]
    isOfficial: Boolean
    isPremium: Boolean
    price: Float
  }

  input CreateCommentInput {
    projectId: ID!
    content: String!
    parentId: ID
  }

  input UpdateCommentInput {
    content: String!
  }

  input InviteCollaboratorInput {
    projectId: ID!
    email: String!
    role: CollaborationRole = VIEWER
  }

  input GenerateCodeInput {
    prompt: String!
    provider: String = "openai"
    framework: Framework = HTML
    style: String = "tailwind"
    complexity: String = "intermediate"
    features: [String!] = []
    options: JSON
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    bio: String
    website: String
    location: String
  }

  # Enums
  enum Plan {
    FREE
    PRO
    ENTERPRISE
  }

  enum Framework {
    HTML
    REACT
    VUE
    NEXTJS
    SVELTE
    ANGULAR
  }

  enum Complexity {
    SIMPLE
    INTERMEDIATE
    ADVANCED
    EXPERT
  }

  enum TemplateCategory {
    LANDING
    DASHBOARD
    PORTFOLIO
    ECOMMERCE
    BLOG
    SAAS
    CORPORATE
    CREATIVE
    MINIMAL
  }

  enum CollaborationRole {
    OWNER
    EDITOR
    VIEWER
  }

  enum NotificationType {
    PROJECT_SHARED
    COLLABORATION_INVITE
    PROJECT_FORKED
    TEMPLATE_LIKED
    COMMENT_ADDED
    SYSTEM
  }
`

// Resolvers
export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const { userId } = auth()
      if (!userId) return null
      
      return await context.prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          projects: true,
          templates: true,
        },
      })
    },

    user: async (_: any, { id }: { id: string }, context: any) => {
      return await context.prisma.user.findUnique({
        where: { id },
        include: {
          projects: { where: { isPublic: true } },
          templates: { where: { isOfficial: true } },
        },
      })
    },

    myProjects: async (_: any, { limit = 10, offset = 0 }: { limit: number; offset: number }, context: any) => {
      const { userId } = auth()
      if (!userId) return []

      return await context.prisma.project.findMany({
        where: { userId },
        include: {
          user: true,
          versions: { take: 5, orderBy: { versionNumber: 'desc' } },
          collaborations: { include: { user: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      })
    },

    project: async (_: any, { id }: { id: string }, context: any) => {
      const { userId } = auth()
      
      const project = await context.prisma.project.findUnique({
        where: { id },
        include: {
          user: true,
          versions: { orderBy: { versionNumber: 'desc' } },
          collaborations: { include: { user: true } },
          comments: { 
            include: { 
              user: true,
              replies: { include: { user: true } }
            },
            where: { parentId: null },
            orderBy: { createdAt: 'desc' }
          },
        },
      })

      // Vérifier les permissions
      if (!project) return null
      if (!project.isPublic && project.userId !== userId) {
        // Vérifier si l'utilisateur est collaborateur
        const collaboration = await context.prisma.collaboration.findFirst({
          where: { projectId: id, userId },
        })
        if (!collaboration) return null
      }

      return project
    },

    projects: async (
      _: any, 
      { limit = 10, offset = 0, isPublic, tags, framework }: {
        limit: number
        offset: number
        isPublic?: boolean
        tags?: string[]
        framework?: string
      }, 
      context: any
    ) => {
      const where: any = {}
      
      if (isPublic !== undefined) {
        where.isPublic = isPublic
      }
      
      if (tags && tags.length > 0) {
        where.tags = { hasSome: tags }
      }
      
      if (framework) {
        where.framework = framework
      }

      return await context.prisma.project.findMany({
        where,
        include: {
          user: true,
          versions: { take: 1, orderBy: { versionNumber: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      })
    },

    templates: async (
      _: any,
      { limit = 10, offset = 0, category, industry, isOfficial }: {
        limit: number
        offset: number
        category?: string
        industry?: string
        isOfficial?: boolean
      },
      context: any
    ) => {
      const where: any = {}
      
      if (category) where.category = category
      if (industry) where.industry = industry
      if (isOfficial !== undefined) where.isOfficial = isOfficial

      return await context.prisma.template.findMany({
        where,
        include: {
          user: true,
          reviews: true,
        },
        orderBy: { downloadsCount: 'desc' },
        take: limit,
        skip: offset,
      })
    },

    myNotifications: async (
      _: any,
      { limit = 10, offset = 0, isRead }: {
        limit: number
        offset: number
        isRead?: boolean
      },
      context: any
    ) => {
      const { userId } = auth()
      if (!userId) return []

      const where: any = { userId }
      if (isRead !== undefined) where.isRead = isRead

      return await context.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      })
    },

    unreadNotificationsCount: async (_: any, __: any, context: any) => {
      const { userId } = auth()
      if (!userId) return 0

      return await context.prisma.notification.count({
        where: { userId, isRead: false },
      })
    },
  },

  Mutation: {
    createProject: async (_: any, { input }: { input: any }, context: any) => {
      const { userId } = auth()
      if (!userId) throw new Error('Non authentifié')

      const project = await context.prisma.project.create({
        data: {
          ...input,
          userId,
        },
        include: {
          user: true,
          versions: true,
        },
      })

      // Créer la première version
      await context.prisma.projectVersion.create({
        data: {
          projectId: project.id,
          versionNumber: 1,
          code: project.code,
          changes: 'Version initiale',
        },
      })

      return project
    },

    updateProject: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      const { userId } = auth()
      if (!userId) throw new Error('Non authentifié')

      // Vérifier les permissions
      const project = await context.prisma.project.findUnique({
        where: { id },
      })

      if (!project) throw new Error('Projet non trouvé')
      if (project.userId !== userId) {
        const collaboration = await context.prisma.collaboration.findFirst({
          where: { projectId: id, userId, role: { in: ['OWNER', 'EDITOR'] } },
        })
        if (!collaboration) throw new Error('Permission refusée')
      }

      const updatedProject = await context.prisma.project.update({
        where: { id },
        data: input,
        include: {
          user: true,
          versions: true,
        },
      })

      // Créer une nouvelle version si le code a changé
      if (input.code && input.code !== project.code) {
        const latestVersion = await context.prisma.projectVersion.findFirst({
          where: { projectId: id },
          orderBy: { versionNumber: 'desc' },
        })

        await context.prisma.projectVersion.create({
          data: {
            projectId: id,
            versionNumber: (latestVersion?.versionNumber || 0) + 1,
            code: input.code,
            changes: input.changes || 'Mise à jour du code',
          },
        })
      }

      return updatedProject
    },

    generateCode: async (_: any, { input }: { input: any }, context: any) => {
      const { userId } = auth()
      if (!userId) throw new Error('Non authentifié')

      // Vérifier les limites d'utilisation
      // TODO: Implémenter la vérification des limites

      // Générer le code avec l'IA
      // TODO: Intégrer avec le service d'IA avancé

      const generation = await context.prisma.aIGeneration.create({
        data: {
          userId,
          prompt: input.prompt,
          code: 'Code généré par l\'IA', // TODO: Remplacer par le vrai code
          provider: input.provider,
          model: 'gpt-4o', // TODO: Récupérer le modèle utilisé
          metadata: input.options,
          suggestions: [],
        },
      })

      return generation
    },
  },
}

// Créer le schéma exécutable
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
