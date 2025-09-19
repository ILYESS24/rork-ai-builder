import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from '@langchain/core/documents'

export interface VectorDocument {
  id: string
  content: string
  metadata: {
    type: 'project' | 'template' | 'documentation' | 'user_query'
    title?: string
    description?: string
    tags?: string[]
    userId?: string
    projectId?: string
    createdAt?: string
    updatedAt?: string
    category?: string
    industry?: string
    framework?: string
    complexity?: string
  }
}

export interface SearchResult {
  id: string
  score: number
  content: string
  metadata: VectorDocument['metadata']
}

export class PineconeService {
  private pinecone: Pinecone
  private embeddings: OpenAIEmbeddings
  private indexName: string

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    })
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
    })
    this.indexName = process.env.PINECONE_INDEX_NAME || 'rork-ai-builder'
  }

  // Initialiser l'index Pinecone
  async initializeIndex(): Promise<void> {
    try {
      const indexList = await this.pinecone.listIndexes()
      
      if (!indexList.indexes?.find(index => index.name === this.indexName)) {
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 1536, // Dimension des embeddings OpenAI
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        })
        
        console.log(`Index Pinecone créé: ${this.indexName}`)
      } else {
        console.log(`Index Pinecone existe déjà: ${this.indexName}`)
      }
    } catch (error) {
      console.error('Erreur initialisation Pinecone:', error)
      throw error
    }
  }

  // Obtenir l'index
  private getIndex() {
    return this.pinecone.index(this.indexName)
  }

  // Ajouter un document au vector store
  async addDocument(document: VectorDocument): Promise<void> {
    try {
      // Générer l'embedding
      const embedding = await this.embeddings.embedQuery(document.content)
      
      // Préparer les métadonnées pour Pinecone
      const metadata = {
        content: document.content,
        type: document.metadata.type,
        title: document.metadata.title || '',
        description: document.metadata.description || '',
        tags: document.metadata.tags?.join(',') || '',
        userId: document.metadata.userId || '',
        projectId: document.metadata.projectId || '',
        category: document.metadata.category || '',
        industry: document.metadata.industry || '',
        framework: document.metadata.framework || '',
        complexity: document.metadata.complexity || '',
        createdAt: document.metadata.createdAt || new Date().toISOString(),
        updatedAt: document.metadata.updatedAt || new Date().toISOString(),
      }

      // Ajouter au vector store
      await this.getIndex().upsert([
        {
          id: document.id,
          values: embedding,
          metadata,
        },
      ])

      console.log(`Document ajouté au vector store: ${document.id}`)
    } catch (error) {
      console.error('Erreur ajout document:', error)
      throw error
    }
  }

  // Ajouter plusieurs documents
  async addDocuments(documents: VectorDocument[]): Promise<void> {
    try {
      const vectors = []

      for (const document of documents) {
        const embedding = await this.embeddings.embedQuery(document.content)
        
        const metadata = {
          content: document.content,
          type: document.metadata.type,
          title: document.metadata.title || '',
          description: document.metadata.description || '',
          tags: document.metadata.tags?.join(',') || '',
          userId: document.metadata.userId || '',
          projectId: document.metadata.projectId || '',
          category: document.metadata.category || '',
          industry: document.metadata.industry || '',
          framework: document.metadata.framework || '',
          complexity: document.metadata.complexity || '',
          createdAt: document.metadata.createdAt || new Date().toISOString(),
          updatedAt: document.metadata.updatedAt || new Date().toISOString(),
        }

        vectors.push({
          id: document.id,
          values: embedding,
          metadata,
        })
      }

      await this.getIndex().upsert(vectors)
      console.log(`${documents.length} documents ajoutés au vector store`)
    } catch (error) {
      console.error('Erreur ajout documents:', error)
      throw error
    }
  }

  // Rechercher des documents similaires
  async searchSimilar(
    query: string,
    options: {
      topK?: number
      filter?: Record<string, any>
      includeMetadata?: boolean
    } = {}
  ): Promise<SearchResult[]> {
    try {
      const { topK = 10, filter, includeMetadata = true } = options

      // Générer l'embedding de la requête
      const queryEmbedding = await this.embeddings.embedQuery(query)

      // Rechercher dans Pinecone
      const searchResponse = await this.getIndex().query({
        vector: queryEmbedding,
        topK,
        filter,
        includeMetadata,
      })

      // Formater les résultats
      const results: SearchResult[] = searchResponse.matches?.map(match => ({
        id: match.id,
        score: match.score || 0,
        content: (match.metadata as any)?.content || '',
        metadata: {
          type: (match.metadata as any)?.type || 'documentation',
          title: (match.metadata as any)?.title,
          description: (match.metadata as any)?.description,
          tags: (match.metadata as any)?.tags?.split(',') || [],
          userId: (match.metadata as any)?.userId,
          projectId: (match.metadata as any)?.projectId,
          category: (match.metadata as any)?.category,
          industry: (match.metadata as any)?.industry,
          framework: (match.metadata as any)?.framework,
          complexity: (match.metadata as any)?.complexity,
          createdAt: (match.metadata as any)?.createdAt,
          updatedAt: (match.metadata as any)?.updatedAt,
        },
      })) || []

      return results
    } catch (error) {
      console.error('Erreur recherche vectorielle:', error)
      throw error
    }
  }

  // Rechercher des projets similaires
  async searchSimilarProjects(
    projectDescription: string,
    userId?: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    const filter: Record<string, any> = {
      type: 'project',
    }

    if (userId) {
      filter.userId = userId
    }

    return this.searchSimilar(projectDescription, {
      topK,
      filter,
    })
  }

  // Rechercher des templates similaires
  async searchSimilarTemplates(
    requirements: string,
    category?: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    const filter: Record<string, any> = {
      type: 'template',
    }

    if (category) {
      filter.category = category
    }

    return this.searchSimilar(requirements, {
      topK,
      filter,
    })
  }

  // Rechercher dans la documentation
  async searchDocumentation(
    query: string,
    topK: number = 10
  ): Promise<SearchResult[]> {
    return this.searchSimilar(query, {
      topK,
      filter: { type: 'documentation' },
    })
  }

  // Rechercher des requêtes utilisateur similaires
  async searchSimilarQueries(
    query: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    return this.searchSimilar(query, {
      topK,
      filter: { type: 'user_query' },
    })
  }

  // Supprimer un document
  async deleteDocument(id: string): Promise<void> {
    try {
      await this.getIndex().deleteOne(id)
      console.log(`Document supprimé du vector store: ${id}`)
    } catch (error) {
      console.error('Erreur suppression document:', error)
      throw error
    }
  }

  // Supprimer plusieurs documents
  async deleteDocuments(ids: string[]): Promise<void> {
    try {
      await this.getIndex().deleteMany(ids)
      console.log(`${ids.length} documents supprimés du vector store`)
    } catch (error) {
      console.error('Erreur suppression documents:', error)
      throw error
    }
  }

  // Mettre à jour un document
  async updateDocument(document: VectorDocument): Promise<void> {
    try {
      // Supprimer l'ancien document
      await this.deleteDocument(document.id)
      
      // Ajouter le nouveau document
      await this.addDocument(document)
      
      console.log(`Document mis à jour dans le vector store: ${document.id}`)
    } catch (error) {
      console.error('Erreur mise à jour document:', error)
      throw error
    }
  }

  // Obtenir les statistiques de l'index
  async getIndexStats(): Promise<{
    totalVectors: number
    dimension: number
    metric: string
  }> {
    try {
      const stats = await this.getIndex().describeIndexStats()
      
      return {
        totalVectors: stats.totalVectorCount || 0,
        dimension: stats.dimension || 1536,
        metric: 'cosine',
      }
    } catch (error) {
      console.error('Erreur récupération stats:', error)
      throw error
    }
  }

  // Recherche hybride (vectorielle + textuelle)
  async hybridSearch(
    query: string,
    options: {
      topK?: number
      filter?: Record<string, any>
      textWeight?: number
      vectorWeight?: number
    } = {}
  ): Promise<SearchResult[]> {
    try {
      const { topK = 10, filter, textWeight = 0.3, vectorWeight = 0.7 } = options

      // Recherche vectorielle
      const vectorResults = await this.searchSimilar(query, { topK, filter })

      // Recherche textuelle (simulation - en production, utiliser Elasticsearch ou similaire)
      const textResults = await this.textSearch(query, filter)

      // Combiner et scorer les résultats
      const combinedResults = this.combineSearchResults(
        vectorResults,
        textResults,
        textWeight,
        vectorWeight
      )

      // Trier par score et limiter
      return combinedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
    } catch (error) {
      console.error('Erreur recherche hybride:', error)
      throw error
    }
  }

  // Recherche textuelle (placeholder)
  private async textSearch(
    query: string,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    // TODO: Implémenter une vraie recherche textuelle
    // Pour l'instant, retourner des résultats vides
    return []
  }

  // Combiner les résultats de recherche
  private combineSearchResults(
    vectorResults: SearchResult[],
    textResults: SearchResult[],
    textWeight: number,
    vectorWeight: number
  ): SearchResult[] {
    const combinedMap = new Map<string, SearchResult>()

    // Ajouter les résultats vectoriels
    vectorResults.forEach(result => {
      const combinedScore = result.score * vectorWeight
      combinedMap.set(result.id, {
        ...result,
        score: combinedScore,
      })
    })

    // Ajouter les résultats textuels
    textResults.forEach(result => {
      const existing = combinedMap.get(result.id)
      if (existing) {
        // Combiner les scores
        existing.score += result.score * textWeight
      } else {
        // Nouveau résultat
        combinedMap.set(result.id, {
          ...result,
          score: result.score * textWeight,
        })
      }
    })

    return Array.from(combinedMap.values())
  }

  // Indexer un projet complet
  async indexProject(project: {
    id: string
    name: string
    description: string
    code: string
    framework: string
    tags: string[]
    userId: string
    category?: string
    industry?: string
    complexity?: string
  }): Promise<void> {
    try {
      // Indexer le projet principal
      const projectDoc: VectorDocument = {
        id: `project-${project.id}`,
        content: `${project.name}\n\n${project.description}\n\nFramework: ${project.framework}\n\nTags: ${project.tags.join(', ')}`,
        metadata: {
          type: 'project',
          title: project.name,
          description: project.description,
          tags: project.tags,
          userId: project.userId,
          projectId: project.id,
          category: project.category,
          industry: project.industry,
          framework: project.framework,
          complexity: project.complexity,
          createdAt: new Date().toISOString(),
        },
      }

      await this.addDocument(projectDoc)

      // Indexer le code (par chunks si nécessaire)
      const codeChunks = this.chunkText(project.code, 1000)
      for (let i = 0; i < codeChunks.length; i++) {
        const codeDoc: VectorDocument = {
          id: `project-${project.id}-code-${i}`,
          content: codeChunks[i],
          metadata: {
            type: 'project',
            title: `${project.name} - Code Part ${i + 1}`,
            description: `Code du projet ${project.name}`,
            userId: project.userId,
            projectId: project.id,
            framework: project.framework,
            createdAt: new Date().toISOString(),
          },
        }

        await this.addDocument(codeDoc)
      }

      console.log(`Projet indexé: ${project.name}`)
    } catch (error) {
      console.error('Erreur indexation projet:', error)
      throw error
    }
  }

  // Diviser un texte en chunks
  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = []
    
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize))
    }
    
    return chunks
  }
}

// Instance globale
export const pineconeService = new PineconeService()

export default pineconeService
