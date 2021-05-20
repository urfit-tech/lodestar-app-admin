export type SalesStatus = {
  name: string
  data: {
    id: string
    name: string
    revenue: {
      today: number
      thisWeek: number
      thisMonth: number
    }
    callTimes: {
      today: number
      thisWeek: number
      thisMonth: number
    }
    callDuration: {
      today: number
      thisWeek: number
      thisMonth: number
    }
  }[]
}[]

export type Lead = {
  id: string
  name: string
  email: string
  phones: string[]
  categoryNames: string[]
  paid: number
  star: number
  createdAt: Date
}
