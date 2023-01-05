import { AttachmentSelectorValue } from '../components/common/AttachmentSelector'
import { DisplayMode } from '../components/program/DisplayModeSelector'
import { Attachment, Category, MetaTag } from './general'

export type ProgramPlanType = 'subscribeFromNow' | 'subscribeAll' | 'unknown'
export type ProgramPlanPeriodType = 'D' | 'W' | 'M' | 'Y'
export type ProgramRoleName = 'owner' | 'instructor' | 'assistant'

export type ProgramPreviewProps = {
  id: string
  coverUrl: string | null
  coverMobileUrl: string | null
  coverThumbnailUrl: string | null
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
  enrollment: number
}

export type ProgramProps = {
  id: string
  title: string
  appId: string
  coverUrl: string | null
  coverMobileUrl: string | null
  coverThumbnailUrl: string | null
  abstract: string | null
  description: string | null
  coverVideoUrl: string | null
  publishedAt: Date | null
  inAdvance: boolean
  isSoldOut: boolean | null
  supportLocales: string[]
  metaTag: MetaTag

  isDeleted: boolean
  isPrivate: boolean
  isIssuesOpen: boolean
  isCountdownTimerVisible?: boolean
  isIntroductionSectionVisible: boolean
  isEnrolledCountVisible: boolean
}

export type ProgramAdminProps = ProgramProps & {
  contentSections: ProgramContentSectionProps[]
  plans: ProgramPlan[]
  roles: ProgramRoleProps[]
  categories: Category[]
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
  displayMode: DisplayMode
}

export type ProgramContentBody = {
  id: string
  type: string | null
  description: string | null
  data: any
  materials: ProgramContentMaterialProps[]
  target: string | null
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
  isParticipantsVisible: boolean
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

type QuestionGroup = {
  id: string
  title: string
  amount: number
}

export type QuestionLibrary = {
  id: string
  title?: string
  questionGroups?: QuestionGroup[]
}

export type ExamTimeUnit = 'd' | 'h' | 'm'

export type Exam = {
  id: string | null
  point: number
  passingScore: number
  examinableUnit: ExamTimeUnit | null
  examinableAmount: number | null
  examinableStartedAt: Date | null
  examinableEndedAt: Date | null
  timeLimitUnit: ExamTimeUnit | null
  timeLimitAmount: number | null
  isAvailableToRetry: boolean
  isAvailableToGoBack: boolean
  isAvailableAnnounceScore: boolean
  questionLibraries: QuestionLibrary[]
}
