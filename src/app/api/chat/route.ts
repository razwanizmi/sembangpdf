import {OpenAIStream, StreamingTextResponse} from 'ai'
import {NextResponse} from 'next/server'
import {Configuration, OpenAIApi} from 'openai-edge'

export const runtime = 'edge'

const config = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
})

const openAI = new OpenAIApi(config)

export async function POST(req: Request) {
  try {
    const {messages} = await req.json()

    const response = await openAI.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      stream: true,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (err) {
    console.error('Error in api/chat', err)
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
