export type Venue = {
  id: string
  name: string
  cols: number
  rows: number
  seats: number
  venue_seats: Seat[]
}

export type Seat = {
  id: string
  venue_id: string
  position: number
  disabled: boolean
  category: CategoryName
}

export type KeyOfSeat = keyof Seat
export type CategoryName = 'walkway' | 'blocked' | 'high' | 'normal' | null
