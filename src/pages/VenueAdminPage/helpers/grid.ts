import React from 'react'
import { CategoryName, Seat } from '../../../types/venue'

type Category = {
  name: CategoryName
  disabled: boolean
  content: React.ReactNode
  gridColor: string
  order: number
}

// hard code
export const category: Category[] = [
  {
    name: 'walkway',
    disabled: true,
    content: '',
    gridColor: '#ececec',
    order: 0,
  },
  {
    name: 'blocked',
    disabled: true,
    content: 'XXX',
    gridColor: '#ffffff',
    order: 1,
  },
  {
    name: 'high',
    disabled: false,
    content: '',
    gridColor: 'rgba(255, 190, 30, 0.1)',
    order: 2,
  },
  {
    name: 'normal',
    disabled: false,
    content: '',
    gridColor: '',
    order: 3,
  },
]

export const categoryFilter = (name: CategoryName) => {
  const data = category.find(c => c.name === name)
  return data
    ? data
    : ({
        name: 'normal',
        disabled: false,
        content: '',
        gridColor: '',
        order: 3,
      } as Category)
}

export const generateGridLayout = (cols: number, rows: number) => {
  const item = cols * rows
  return Array.from(Array(item).keys()).map((_, index) => ({
    x: index % cols,
    y: Math.floor(index / cols),
    w: 1,
    h: 1,
    i: index.toString(),
    static: true,
  }))
}

export const generateHeadTitles = (cols: number, rows: number, seats: Seat[]) => {
  const character = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const length = character.length
  let colWalkwayCount = 0,
    rowWalkwayCount = 0,
    colResult = [''],
    rowResult = ['']
  for (let i = 0; i < cols; i++) {
    if (seats.find(s => s.position === i + 1)?.category === 'walkway') {
      colWalkwayCount += 1
      colResult.push('')
    } else {
      colResult.push(
        (i + 1 > length + colWalkwayCount ? character[Math.floor((i + 1 - length) / length)] : '') +
          character[(i - colWalkwayCount) % length],
      )
    }
  }
  for (let i = 0; i < rows; i++) {
    if (seats.find(s => Math.floor(s.position / cols) === i + 1)?.category === 'walkway') {
      rowWalkwayCount += 1
      rowResult.push('')
    } else {
      rowResult.push(`${i + 1 - rowWalkwayCount}`)
    }
  }
  return { col: colResult, row: rowResult }
}
