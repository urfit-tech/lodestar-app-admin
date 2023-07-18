import { PeriodType } from './general'

export type PodcastProgram = {
  id: string
  title: string
  contentType: string | null
  filename: string | null
  duration: number
  durationSecond: number
  description: string | null
  coverUrl: string | null
  abstract: string | null
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  creatorId: string
  instructors: { id: string; name: string; pictureUrl: string }[]
  publishedAt: Date | null
  supportLocales: string[]
  audios: PodcastProgramAudio[]
  isIndividuallySale?: boolean
}

export type PodcastProgramAdminProps = PodcastProgram

export type PodcastProgramAudio = {
  id: string
  key: string
  filename: string
  duration: number
}

type RawPodcastProgramAudio = {
  id: string
  data: RawPodcastProgramAudioData
}

type RawPodcastProgramAudioData = {
  key: string
  filename: string
  duration: number
}

export function podcastProgramAudiosFromRawAudios(rawAudios: RawPodcastProgramAudio[]): PodcastProgramAudio[] {
  const bodies: PodcastProgramAudio[] = []
  for (const rawBody of rawAudios) {
    const maybeBody = podcastProgramBodyFromRawBody(rawBody)
    if (maybeBody != null) {
      bodies.push(maybeBody)
    }
  }

  return bodies
}

// Might return undefined because a RawPodcastProgramBody might have no audio
function podcastProgramBodyFromRawBody(raw: RawPodcastProgramAudio): PodcastProgramAudio {
  const data = raw.data

  return {
    id: raw.id,
    key: data.key,
    filename: data.filename,
    duration: data.duration,
  }
}

export type PodcastPlanProps = {
  id: string
  isSubscription: boolean
  title: string
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  publishedAt: Date | null
  periodAmount: number
  periodType: PeriodType
  creatorId: string
}
