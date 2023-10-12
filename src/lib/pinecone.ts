import {downloadFromS3} from '@/lib/s3-server'
import {
  Document,
  RecursiveCharacterTextSplitter,
} from '@pinecone-database/doc-splitter'
import {Pinecone, PineconeRecord} from '@pinecone-database/pinecone'
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
import md5 from 'md5'
import {getEmbeddings} from './embeddings'
import {convertToAscii} from './utils'

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT!,
})

interface PdfPage {
  pageContent: string
  metadata: {
    loc: {pageNumber: number}
  }
}

export async function loadS3IntoPinecone(fileKey: string) {
  console.log('Downloading S3 into file system')
  // Download PDF from S3
  const fileName = await downloadFromS3(fileKey)

  if (!fileName) {
    throw new Error('Could not download from S3')
  }

  // Read from PDF
  const loader = new PDFLoader(fileName)
  const pages = (await loader.load()) as PdfPage[]

  // Split and segment the PDF
  const documents = await Promise.all(pages.map(prepareDocument))

  // Vectorize and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument))

  // Upload to Pinecone
  const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!)
  console.log('Inserting vectors into Pinecone')
  pineconeIndex.upsert(vectors)
  return documents[0]
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent)
    const hash = md5(doc.pageContent)

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord
  } catch (err) {
    console.log('Error embedding document', err)
    throw err
  }
}

export function truncateStringByBytes(str: string, bytes: number) {
  const enc = new TextEncoder()
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}

async function prepareDocument(page: PdfPage) {
  let {pageContent, metadata} = page
  pageContent = pageContent.replace(/\n/g, '')
  const splitter = new RecursiveCharacterTextSplitter()

  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ])

  return docs
}
