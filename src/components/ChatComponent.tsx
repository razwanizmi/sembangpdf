'use client'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {useChat} from 'ai/react'
import {Send} from 'lucide-react'
import MessageList from './MessageList'

interface Props {
  chatId: number
}

export default function ChatComponent({chatId}: Props) {
  const {input, handleInputChange, handleSubmit, messages} = useChat({
    api: '/api/chat',
    body: {chatId},
  })

  return (
    <div className="relative max-h-screen overflow-scroll">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>
      <MessageList messages={messages} />
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
