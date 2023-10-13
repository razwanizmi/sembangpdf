interface Props {
  pdfUrl: string
}

export default function PdfViewer({pdfUrl}: Props) {
  return (
    <iframe
      className="w-full h-full"
      src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
    ></iframe>
  )
}
