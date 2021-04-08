export type SalesProps = {
  id: string
  pictureUrl: string | null
  name: string
  email: string
  telephone: string | null
  metadata: any
  baseOdds: number
  lastAttend: {
    startedAt: Date
    endedAt: Date
  } | null
}
