import ChatSideBar from '@/components/ChatSidebar'
import PdfViewer from '@/components/PdfViewer'
import {db} from '@/lib/db'
import {chats} from '@/lib/db/schema'
import {auth} from '@clerk/nextjs/server'
import {and, eq} from 'drizzle-orm'
import {redirect} from 'next/navigation'

interface Props {
  params: {
    chatId: string
  }
}

export default async function ChatPage({params: {chatId}}: Props) {
  const {userId} = auth()

  if (!userId) {
    return redirect('/sign-in')
  }

  // const userChats = await db
  //   .select()
  //   .from(chats)
  //   .where(and(eq(chats.id, parseInt(chatId)), eq(chats.userId, userId)))

  const userChats = await db.query.chats.findMany({
    where: eq(chats.userId, userId),
  })

  const currentChat = userChats.find(chat => chat.id === parseInt(chatId))

  if (!userChats.length || !currentChat) {
    return redirect('/')
  }

  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        <div className="flex-[1] max-w-xs ">
          <ChatSideBar chats={userChats} chatId={parseInt(chatId)} />
        </div>
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
          <PdfViewer pdfUrl={currentChat.pdfUrl} />
        </div>
        <div className="flex-[3] border-l-4 border-l-slate-200">
          ChatComponent
        </div>
      </div>
    </div>
  )
}
