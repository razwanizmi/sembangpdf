import {OpenAIApi, Configuration} from 'openai-edge'

const config = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
})

const openAI = new OpenAIApi(config)

export async function getEmbeddings(text: string) {
  try {
    const response = await openAI.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text.replace(/\n/g, ' '),
    })

    const result = await response.json()
    return result.data[0].embedding as number[]
  } catch (err) {
    console.error('Error calling OpenAI Embeddings API', err)
    throw err
  }
}
