import {db} from '@/lib/db'
import {chats} from '@/lib/db/schema'
import {loadS3IntoPinecone} from '@/lib/pinecone'
import {getS3Url} from '@/lib/s3'
import {auth} from '@clerk/nextjs/server'
import {NextResponse} from 'next/server'

export async function POST(req: Request, res: Response) {
  const {userId} = auth()
  if (!userId) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  try {
    const {fileKey, fileName} = await req.json()
    console.log({fileKey, fileName})
    await loadS3IntoPinecone(fileKey)

    const chatId = await db
      .insert(chats)
      .values({
        fileKey,
        pdfName: fileName,
        pdfUrl: getS3Url(fileKey),
        userId,
      })
      .returning({insertedId: chats.id})

    return NextResponse.json({chatId: chatId[0].insertedId}, {status: 200})
  } catch (err) {
    console.error(err)
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
