import { AttachmentSelectorValue } from '../components/common/AttachmentSelector'
import { Attachment, CategoryProps } from './general'

export type ProgramPlanType = 'subscribeFromNow' | 'subscribeAll' | 'unknown'
export type ProgramPlanPeriodType = 'D' | 'W' | 'M' | 'Y'
export type ProgramRoleName = 'owner' | 'instructor' | 'assistant'

export type ProgramPreviewProps = {
  id: string
  coverUrl: string | null
  title: string
  abstract: string | null
  instructors: {
    id: string
    avatarUrl: string | null
    name: string
  }[]
  listPrice: number | null
  salePrice: number | null
  periodAmount: number | null
  periodType: ProgramPlanPeriodType | null
  isPrivate: boolean
}

export type ProgramProps = {
  id: string
  title: string
  appId: string
  coverUrl: string | null
  abstract: string | null
  description: string | null
  coverVideoUrl: string | null
  publishedAt: Date | null
  inAdvance: boolean
  isSoldOut: boolean | null
  supportLocales: string[]

  isDeleted: boolean
  isPrivate: boolean
  isIssuesOpen: boolean
  isCountdownTimerVisible?: boolean
  isIntroductionSectionVisible: boolean
}

export type ProgramAdminProps = ProgramProps & {
  contentSections: ProgramContentSectionProps[]
  plans: ProgramPlan[]
  roles: ProgramRoleProps[]
  categories: CategoryProps[]
  tags: string[]
  approvals: ProgramApprovalProps[]
}

export type ProgramContentSectionProps = {
  id: string
  title: string
  programContents: ProgramContentProps[]
}

export type ProgramContent = {
  id: string
  title: string
  publishedAt: Date | null
  listPrice: number | null
  duration: number | null
  programContentType: string | null
  isNotifyUpdate: boolean
  notifiedAt: Date | null
  programPlans: {
    id: string
    title: string | null
  }[]
  metadata: any
  attachments: {
    id: string
    data: any
    options: any
  }[]
  videos: Attachment[]
  programContentBodyData: any
}

export type ProgramContentProps = {
  id: string
  title: string
  publishedAt: Date | null
  listPrice: number | null
  duration: number | null
  programContentType: string | null
  isNotifyUpdate: boolean
  notifiedAt: Date | null
  programPlans?: {
    id: string
    title: string | null
  }[]
  metadata: any
  attachments: {
    id: string
    data: any
    options: any
  }[]
  videos: AttachmentSelectorValue[]
  programContentBodyData: any
}

export type ProgramContentBodyProps = {
  id: string
  type: string | null
  description: string | null
  data: any
  materials: ProgramContentMaterialProps[]
}

export type ProgramContentMaterialProps = {
  id: string
  data: any
}

export type ProgramPlan = {
  id: string
  type: number
  title: string | null
  description: string | null
  gains: string | null
  salePrice: number
  listPrice: number
  discountDownPrice: number
  periodAmount: number | null
  periodType: string | null
  remindPeriodAmount: number | null
  remindPeriodType: string | null
  soldAt: Date | null
  currencyId: string
  autoRenewed: boolean
  publishedAt: Date | null
  isCountdownTimerVisible?: boolean
  groupBuyingPeople?: number | null
}

export type ProgramRoleProps = {
  id: string
  name: ProgramRoleName
  member: {
    id: string | null
    name: string | null
    pictureUrl: string | null
  } | null
}

export type ProgramApprovalProps = {
  id: string
  createdAt: Date
  updatedAt: Date
  status: 'pending' | 'canceled' | 'rejected' | 'approved'
  description: string | null
  feedback: string | null
}

export type QuestionProps = {
  id: string
  points: number
  description: string | null
  answerDescription: string | null
  isMultipleAnswers: boolean
  choices: ChoiceProps[]
}

export type ChoiceProps = {
  id: string
  description: string | null
  isCorrect: boolean
}

export type ExerciseProps = {
  id: string
  memberId: string
  answer: {
    questionId: string
    choiceIds: string[]
    questionPoints: number
    gainedPoints: number
  }[]
}
