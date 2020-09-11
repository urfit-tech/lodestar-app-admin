import { UserRole } from './general'

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
  phones: string[]
  properties: {
    id: string
    name: string
  }[]
  consumption?: number
}
