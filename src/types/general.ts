export type ProductType =
  | 'Program'
  | 'ProgramPlan'
  | 'ProgramContent'
  | 'ProgramPackagePlan'
  | 'ProjectPlan'
  | 'Card'
  | 'ActivityTicket'
  | 'Merchandise'
  | 'PodcastProgram'
  | 'PodcastPlan'
  | 'AppointmentPlan'

export type Category = {
  id: string
  name: string
  position: number
}

export type ClassType = 'program' | 'podcastProgram' | 'activity' | 'post' | 'merchandise'
