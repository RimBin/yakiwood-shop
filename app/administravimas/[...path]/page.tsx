import { redirect } from 'next/navigation'

type Props = {
  params: { path?: string[] }
}

export default function AdministravimasCatchAllPage({ params }: Props) {
  const nextPath = params.path?.length ? `/${params.path.join('/')}` : ''
  redirect(`/admin${nextPath}`)
}
