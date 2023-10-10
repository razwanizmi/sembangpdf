import {NextResponse} from 'next/server'

export async function POST(req: Request, res: Response) {
  try {
    const {fileKey, fileName} = await req.json()
    console.log({fileKey, fileName})
    return NextResponse.json({message: 'Success'})
  } catch (err) {
    console.error(err)
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
