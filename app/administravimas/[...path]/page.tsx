import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ path?: string[] }>
}

export default async function AdministravimasCatchAllPage({ params }: Props) {
  const { path } = await params
  const nextPath = path?.length ? `/${path.join('/')}` : ''
  redirect(`/admin${nextPath}`)
}
