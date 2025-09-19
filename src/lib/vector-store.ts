import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from '@langchain/core/documents'

// Configuration Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
})

export class VectorStore {
  private index: any
  private embeddings: OpenAIEmbeddings

  constructor() {
    this.index = pinecone.index(process.env.PINECONE_INDEX_NAME!)
    this.embeddings = embeddings
  }

  // Ajouter des documents au vector store
  async addDocuments(documents: Document[], namespace?: string) {
    try {
      const vectors = await Promise.all(
        documents.map(async (doc, index) => {
          const embedding = await this.embeddings.embedQuery(doc.pageContent)
          return {
            id: `doc_${Date.now()}_${index}`,
            values: embedding,
            metadata: {
              content: doc.pageContent,
              source: doc.metadata.source || 'unknown',
              ...doc.metadata,
            },
          }
        })
      )

      await this.index.namespace(namespace || 'default').upsert(vectors)
      return { success: true, count: vectors.length }
    } catch (error) {
      console.error('Error adding documents to vector store:', error)
      throw error
    }
  }

  // Rechercher des documents similaires
  async searchSimilar(
    query: string,
    topK: number = 5,
    namespace?: string,
    filter?: any
  ) {
    try {
      const queryEmbedding = await this.embeddings.embedQuery(query)
      
      const searchResponse = await this.index
        .namespace(namespace || 'default')
        .query({
          vector: queryEmbedding,
          topK,
          includeMetadata: true,
          filter,
        })

      return searchResponse.matches?.map((match: any) => ({
        score: match.score,
        content: match.metadata.content,
        metadata: match.metadata,
      })) || []
    } catch (error) {
      console.error('Error searching vector store:', error)
      throw error
    }
  }

  // Supprimer des documents
  async deleteDocuments(ids: string[], namespace?: string) {
    try {
      await this.index.namespace(namespace || 'default').deleteMany(ids)
      return { success: true, count: ids.length }
    } catch (error) {
      console.error('Error deleting documents from vector store:', error)
      throw error
    }
  }

  // Obtenir des statistiques de l'index
  async getStats() {
    try {
      const stats = await this.index.describeIndexStats()
      return stats
    } catch (error) {
      console.error('Error getting vector store stats:', error)
      throw error
    }
  }
}

// Instance globale
export const vectorStore = new VectorStore()

// Fonctions utilitaires pour RAG (Retrieval Augmented Generation)
export async function searchRelevantCodeExamples(
  query: string,
  framework?: string
) {
  const filter = framework ? { framework } : undefined
  return vectorStore.searchSimilar(query, 5, 'code-examples', filter)
}

export async function searchDocumentation(
  query: string,
  category?: string
) {
  const filter = category ? { category } : undefined
  return vectorStore.searchSimilar(query, 3, 'documentation', filter)
}

export async function addCodeExample(
  code: string,
  framework: string,
  description: string,
  tags: string[] = []
) {
  const doc = new Document({
    pageContent: code,
    metadata: {
      framework,
      description,
      tags: tags.join(','),
      source: 'user-generated',
      type: 'code-example',
    },
  })

  return vectorStore.addDocuments([doc], 'code-examples')
}
