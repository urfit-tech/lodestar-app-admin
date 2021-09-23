import { CategoryProps } from './general'

export type PodcastAlbumPodcastProgram = {
  id: string
  title: string
  coverUrl: string | null
  position: number
  durationSecond: number
  podcastAlbumPodcastProgramId: string
}

export type PodcastAlbum = {
  id: string
  title: string
  coverUrl: string
  author: {
    id: string
    name: string
  }
  description: string
  isPublic: boolean
  isDeleted: boolean
  publishedAt: Date | null
  podcastPrograms: PodcastAlbumPodcastProgram[]
  categories: CategoryProps[]
}
