'use client'

import {QueryClientProvider, QueryClient} from '@tanstack/react-query'

const queryClient = new QueryClient()

interface Props {
  children: React.ReactNode
}

function Providers({children}: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default Providers
