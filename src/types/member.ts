import { CategoryProps } from './general'

export type UserRole = 'app-owner' | 'content-creator' | 'general-member' | 'anonymous'

export type MemberProps = {
  id: string
  name: string
  email: string
  username: string
  pictureUrl: string | null
  description: string | null
  abstract: string | null
  title: string | null
  specialities?: string[]
  memberTags?: {
    id: string
    tagName: string
  }[]
  role: string
}

export type MemberInfoProps = {
  id: string
  avatarUrl: string | null
  name: string
  email: string
  role: UserRole
  createdAt: Date | null
  loginedAt: Date | null
  phones: string[]
  consumption: number
}

export type MemberPublicProps = {
  id: string
  name: string
  username: string
  pictureUrl: string
  description: string
  role: string
}

export type MemberOptionProps = {
  id: string
  avatarUrl?: string | null
  name?: string
  username: string
  email?: string
  disabled?: boolean
}

export type MemberBriefProps = {
  id: string
  avatarUrl: string | null
  name: string
  email: string
}

export type MemberAdminProps = {
  id: string
  avatarUrl: string | null
  username: string
  name: string
  email: string
  role: UserRole
  createdAt: Date | null
  loginedAt: Date | null
  tags: string[]
  specialities: string[]
  phones: string[]
  categories: CategoryProps[]
  notes: MemberNoteAdminProps[]
  permissionIds: string[]

  consumption?: number
  coins?: number
}

export type MemberPropertyProps = {
  id: string
  name: string
  value: string
}

export type MemberNoteAdminProps = {
  id: string
  type: 'inbound' | 'outbound' | null
  status: string | null
  duration: number | null
  description: string | null
  createdAt: Date
  author: {
    name: string
    pictureUrl: string | null
  }
}

export type MemberTaskProps = {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'done'
  category: {
    id: string
    name: string
  } | null
  dueAt: Date | null
  createdAt: Date | null
  description: string | null
  member: {
    id: string
    name: string
  }
  executor: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
}
