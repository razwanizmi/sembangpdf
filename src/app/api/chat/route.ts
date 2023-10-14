import {getContext} from '@/lib/context'
import {db} from '@/lib/db'
import {chats} from '@/lib/db/schema'
import {OpenAIStream, StreamingTextResponse} from 'ai'
import {Message} from 'ai/react'
import {eq} from 'drizzle-orm'
import {NextResponse} from 'next/server'
import {Configuration, OpenAIApi} from 'openai-edge'

export const runtime = 'edge'

const config = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
})

const openAI = new OpenAIApi(config)

export async function POST(req: Request) {
  try {
    const {messages, chatId} = await req.json()
    const chat = await db.query.chats.findFirst({where: eq(chats.id, chatId)})
    if (!chat) throw new Error(`Chat with id ${chatId} not found`)

    const fileKey = chat.fileKey
    const lastMessage = messages[messages.length - 1]
    const context = await getContext(lastMessage.content, fileKey)

    const prompt = {
      role: 'system',
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    }

    const response = await openAI.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === 'user'),
      ],
      stream: true,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (err) {
    console.error('Error in api/chat', err)
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
