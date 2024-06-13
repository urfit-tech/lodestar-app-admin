export type Meet = {
  id: string
  startedAt: Date
  endedAt: Date
  nbfAt: Date
  expAt: Date
  autoRecording: boolean
  options: any
  target: string
  type: string
  hostMemberId: string
  gateway: string
  serviceId: string
  meetMembers: MeetMember[]
}
export type MeetMember = {
  id: String
  memberId: string
}

export type OverlapMeets = Pick<Meet, 'id' | 'target' | 'hostMemberId' | 'serviceId' | 'meetMembers'>[]
