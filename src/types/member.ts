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
  creatorCategoryIds?: string[]
  role: string
}

export type MemberInfoProps = {
  id: string
  avatarUrl: string | null
  name: string
  username: string
  email: string
  role: UserRole
  createdAt: Date | null
  loginedAt: Date | null
  manager: {
    id: string
    name: string
  } | null
  assignedAt: Date | null
  phones: string[]
  consumption: number
  categories: {
    id: string
    name: string
  }[]
  tags: string[]
  properties: {
    [propertyId: string]: string
  }
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
  status?: string | null
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
  star: number
  role: UserRole
  createdAt: Date | null
  loginedAt: Date | null
  assignedAt: Date | null
  title: string | null
  abstract: string | null
  description: string | null
  manager: MemberBriefProps | null
  tags: string[]
  specialities: string[]
  phones: string[]
  categories: CategoryProps[]
  permissionIds: string[]
  lastRejectedNote: {
    author: {
      name: string
    }
    description: string | null
    rejectedAt: Date | null
  } | null

  consumption?: number
  coins?: number
}

export type MemberPropertyProps = {
  id: string
  name: string
  value: string
}

export type NoteAdminProps = {
  id: string
  createdAt: Date
  type: 'inbound' | 'outbound' | 'demo' | 'sms' | null
  status: string | null
  author: {
    id: string
    pictureUrl: string | null
    name: string
  }
  manager: {
    id: string
    name: string
  } | null
  member: {
    id: string
    pictureUrl: string | null
    name: string
    email: string
  } | null
  memberCategories: {
    id: string
    name: string
  }[]
  memberTags: string[]
  consumption: number
  duration: number
  audioFilePath: string | null
  description: string | null
  metadata: any
  note: string | null
  attachments: {
    id: string
    data: any
    options: any
  }[]
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
  author: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
}
