import {getEmbeddings} from '@/lib/embeddings'
import {Pinecone} from '@pinecone-database/pinecone'

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string,
) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  })

  const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!)

  try {
    const queryResult = await pineconeIndex.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    })

    return queryResult.matches
  } catch (err) {
    console.error('Error in getMatchesFromEmbeddings', err)
    throw err
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query)
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey)

  const qualifyingDocs = matches.filter(
    match => match.score && match.score > 0.7,
  )

  const docs = qualifyingDocs.map(doc => doc.metadata!.text)
  return docs.join('\n').substring(0, 3000)
}
