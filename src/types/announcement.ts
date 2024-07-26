import { PeriodType } from "lodestar-app-element/src/types/data"



export type Announcement = {
  id: string
  appId: string
  title: string
  content: string | null
  remindPeriodType: PeriodType
  remindPeriodAmount: number
  startedAt: Date | null
  endedAt: Date | null
  publishedAt: Date | null
  isUniversalDisplay: boolean
  createdAt: Date
  updatedAt: Date
  announcementPages: AnnouncementPage[]
  memberAnnouncementStatus: MemberAnnouncementStatus[]
}

export type MemberAnnouncementStatus = {
  id: string
  announcementId: number
  memberId: string
  readAt: Date | null
  remindAt: Date | null
  isDismissed: boolean
  createdAt: Date
  updatedAt: Date
  member?: { id: string; name: string; email: string }
}

export type AnnouncementPage = { id: string; announcementId: string; path: string; createdAt: Date; updatedAt: Date }
