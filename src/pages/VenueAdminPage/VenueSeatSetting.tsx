import { useMutation } from '@apollo/client'
import { Button, Dropdown, InputNumber, Menu, message } from 'antd'
import { gql } from '@apollo/client'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import GridLayout from 'react-grid-layout'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { AdminBlock } from '../../components/admin'
import hasura from '../../hasura'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ExportIcon } from '../../images/icon'
import { CategoryName, KeyOfSeat, Seat, Venue } from '../../types/venue'
import pageMessages from '../translation'
import { category, categoryFilter, generateGridLayout, generateHeadTitles } from './helpers/grid'

interface ButtonProps {
  backgroundColor?: string
}

const StyledButton = styled.button<ButtonProps>`
  border: 1px solid #000000;
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  &:hover {
    background-color: pink;
  }
`

const StyledSubTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  letter-spacing: 0.2px;
  margin-right: 0.8rem;
`

const StyledInput = styled(InputNumber)`
  margin-right: 1.5rem;
  width: 80px;
`

const StyledGridTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
  margin-right: 8px;
  text-align: center;
`

const StyledPrintButton = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.2px;
  color: #4c5b8f;
  cursor: pointer;
`

const VenueSeatSetting: React.VFC<{ venue: Venue; onRefetch?: () => void }> = ({ venue, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [cols, setCols] = useState(venue.cols)
  const [rows, setRows] = useState(venue.rows)
  const [seats, setSeats] = useState<Seat[]>(venue.venue_seats)
  const [loading, setLoading] = useState(false)
  const [saveVenueSeats] = useMutation<hasura.SAVE_VENUE_SEATS, hasura.SAVE_VENUE_SEATSVariables>(SAVE_VENUE_SEATS)

  const isSeatInfoChanged: boolean = useMemo(() => {
    for (const seat of seats) {
      for (const key of Object.keys(seat) as KeyOfSeat[]) {
        if (venue.venue_seats.find(s => s.position === seat.position)?.[key] !== seat[key]) {
          return true
        }
      }
    }
    return false
  }, [venue.venue_seats, seats])

  const layout = useMemo(() => {
    return generateGridLayout(cols + 1, rows + 1)
  }, [cols, rows])

  // adjust number of cols/rows
  const handleChangeCols = (value: string | number | undefined) => {
    const newValue = Number(value)
    if (newValue < 0 || newValue > 30) return
    if (!isNaN(newValue)) {
      let newSeats: Seat[] = []
      const dif = newValue - cols
      if (dif >= 0) {
        for (const seat of seats) {
          newSeats.push({
            ...seat,
            position: seat.position + Math.floor(seat.position / (cols + 1)) * dif,
          })
        }
        for (let i = 0; i < dif * (rows + 1); i++) {
          const newPosition = (newValue + 1) * (Math.floor(i / dif) + 1) - dif + (i % dif)
          newSeats.push({
            venue_id: venue.id,
            id: uuid().toString(),
            position: newPosition,
            disabled: false,
            category: 'normal',
          })
        }
      } else {
        for (const seat of seats.filter(seat => seat.position % (cols + 1) <= newValue)) {
          const newPosition = seat.position - Math.floor(seat.position / (cols + 1)) * Math.abs(dif)
          newSeats.push({
            ...seat,
            position: newPosition,
          })
        }
      }

      setCols(newValue)
      setSeats(newSeats)
    }
  }
  const handleChangeRows = (value: string | number | undefined) => {
    const newValue = Number(value)
    if (newValue < 0 || newValue > 30) return
    if (!isNaN(newValue)) {
      let newSeats: Seat[] = []
      const dif = newValue - rows

      if (dif >= 0) {
        for (let i = 0; i < (newValue + 1) * (cols + 1); i++) {
          if (i / (cols + 1) < newValue - dif + 1) {
            const newSeatInfo = seats.find(seat => seat.position === i)
            newSeatInfo && newSeats.push(newSeatInfo)
          } else {
            newSeats.push({
              venue_id: venue.id,
              id: uuid().toString(),
              position: i,
              disabled: false,
              category: 'normal',
            })
          }
        }
      } else {
        for (const seat of seats.filter(seat => seat.position / (cols + 1) < newValue + 1)) {
          newSeats.push({ ...seat })
        }
      }
      setRows(newValue)
      setSeats(newSeats)
    }
  }

  // adjust single seat info
  const handleChangeSeatBlock = (seatInfo: Seat, position: Position) => {
    const newCategory = category.find(
      c =>
        c.order ===
        Math.min(
          categoryFilter(seatInfo.category === 'blocked' ? 'normal' : 'blocked').order,
          categoryFilter(seats.filter(seat => seat.position === position.x)[0].category).order,
          categoryFilter(seats.filter(seat => seat.position === position.idx - position.x)[0].category).order,
        ),
    )
    newCategory &&
      setSeats([
        ...seats.filter(seat => seat.position !== position.idx),
        { ...seatInfo, category: newCategory.name, disabled: !!newCategory.disabled },
      ])
  }

  // adjust all seats of one col/row
  const handleChangeRowSeats = (newValue: CategoryName, seatInfo: Seat, position: Position) => {
    let newSeats: Seat[] = []
    for (const seat of seats.filter(s => Math.floor(s.position / (cols + 1)) === position.y)) {
      const seatCategory = seats.filter(s => s.position === seat.position)[0].category
      const newCategory = category.find(
        c =>
          c.order ===
          Math.min(
            categoryFilter(seatInfo.category === newValue ? 'normal' : newValue).order,
            categoryFilter(seats.filter(s => s.position === seat.position - position.idx)[0].category).order,
            categoryFilter(seatCategory === newValue ? 'normal' : seatCategory).order,
          ),
      )
      newCategory &&
        newSeats.push({
          ...seat,
          disabled: newCategory.disabled,
          category: newCategory.name,
        })
    }
    setSeats([...seats.filter(s => Math.floor(s.position / (cols + 1)) !== position.y), ...newSeats])
  }
  const handleChangeColSeats = (newValue: CategoryName, seatInfo: Seat, position: Position) => {
    let newSeats: Seat[] = []
    for (const seat of seats.filter(s => s.position % (cols + 1) === position.x)) {
      const seatCategory = seats.filter(s => s.position === seat.position)[0].category
      const newCategory = category.find(
        c =>
          c.order ===
          Math.min(
            categoryFilter(seatInfo.category === newValue ? 'normal' : newValue).order,
            categoryFilter(seatCategory === newValue ? 'normal' : seatCategory).order,
            categoryFilter(seats.filter(s => s.position === seat.position - position.x)[0].category).order,
          ),
      )
      newCategory && newSeats.push({ ...seat, disabled: newCategory.disabled, category: newCategory.name })
    }
    setSeats([...seats.filter(s => s.position % (cols + 1) !== position.x), ...newSeats])
  }

  const handleDeleteRow = (deleteRow: number) => {
    let newSeats: Seat[] = []
    for (const seat of seats) {
      const row = Math.floor(seat.position / (cols + 1))
      if (row < deleteRow) {
        newSeats.push({ ...seat })
      } else if (row > deleteRow) {
        newSeats.push({ ...seat, position: seat.position - (cols + 1) })
      }
    }
    setRows(rows - 1)
    setSeats(newSeats)
  }
  const handleDeleteCol = (deleteCol: number) => {
    let newSeats: Seat[] = []
    for (const seat of seats) {
      if (seat.position % (cols + 1) !== deleteCol) {
        newSeats.push({
          ...seat,
          position:
            seat.position < deleteCol
              ? seat.position
              : seat.position - Math.ceil((seat.position - deleteCol) / (cols + 1)),
        })
      }
    }
    setCols(cols - 1)
    setSeats(newSeats)
  }
  const headTitles = useMemo(() => {
    return generateHeadTitles(cols + 1, rows + 1, seats)
  }, [seats, cols, rows])

  const handleExport = () => {
    const sortedSeats = seats.sort((a, b) => a.position - b.position)
    let csvData: string[][] = []

    for (let i = 0; i < rows + 1; i++) {
      const rowSeats = sortedSeats.filter(v => v.position < (i + 1) * (cols + 1) && v.position >= i * (cols + 1))
      const isHighRow = rowSeats[0].category === 'high'
      const rowHeadTitle = `${i === 0 ? '' : headTitles.row[i]}${
        isHighRow ? formatMessage(pageMessages.VenueSeatSetting.highWord) : ''
      }`

      csvData.push(
        rowSeats.map((v, idx) =>
          i === 0 && idx === 0
            ? ''
            : i === 0
            ? headTitles.col[idx]
              ? `${headTitles.col[idx]}${
                  sortedSeats[idx].category === 'high' || rowSeats[0].category === 'high'
                    ? formatMessage(pageMessages.VenueSeatSetting.highWord)
                    : ''
                }`
              : formatMessage(pageMessages.VenueSeatSetting.walkway)
            : idx === 0
            ? headTitles.row[i]
              ? `${headTitles.row[i]}${
                  sortedSeats[idx].category === 'high' || rowSeats[0].category === 'high'
                    ? formatMessage(pageMessages.VenueSeatSetting.highWord)
                    : ''
                }`
              : formatMessage(pageMessages.VenueSeatSetting.walkway)
            : v.category === 'blocked'
            ? 'XXX'
            : sortedSeats[idx].category === 'walkway'
            ? rowHeadTitle
            : '',
        ),
      )
    }

    const title = formatMessage(pageMessages.VenueSeatSetting.blackboardPosition)
    let firstRow = []
    for (let i = 0; i < cols + 1; i++) {
      firstRow.push(title)
    }
    downloadCSV(
      `${venue.name}-${formatMessage(pageMessages.VenueAdminPage.seatSettings)}-${moment().format('YYYYMMDD')}.csv`,
      toCSV([firstRow, ...csvData]),
    )
  }

  return (
    <>
      <div className="d-flex align-items-center mb-4 justify-content-between">
        <div className="d-flex align-items-center">
          <StyledSubTitle>{formatMessage(pageMessages.VenueSeatSetting.rows)}</StyledSubTitle>
          <StyledInput className="mr-3" value={rows} max={30} onChange={handleChangeRows} />
          <StyledSubTitle>{formatMessage(pageMessages.VenueSeatSetting.cols)}</StyledSubTitle>
          <StyledInput className="mr-3" value={cols} max={30} onChange={handleChangeCols} />
          {isSeatInfoChanged && (
            <>
              <Button
                className="mr-2"
                onClick={() => {
                  setCols(venue.cols)
                  setRows(venue.rows)
                  setSeats(venue.venue_seats)
                }}
              >
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button
                type="primary"
                disabled={loading}
                loading={loading}
                onClick={() => {
                  setLoading(true)
                  saveVenueSeats({
                    variables: {
                      venueId: venue.id,
                      objects: seats,
                      cols: cols,
                      rows: rows,
                      seats: seats.filter(
                        seat =>
                          Math.floor(seat.position / (cols + 1)) !== 0 &&
                          seat.position % (cols + 1) !== 0 &&
                          !seat.disabled,
                      ).length,
                    },
                  })
                    .then(() => {
                      message.success(formatMessage(pageMessages['*'].successfullySaved))
                      onRefetch?.()
                    })
                    .finally(() => setLoading(false))
                }}
              >
                {formatMessage(commonMessages.ui.save)}
              </Button>
            </>
          )}
        </div>
        <StyledPrintButton onClick={handleExport}>
          <ExportIcon className="mr-2" />
          <div>{formatMessage(commonMessages.ui.print)}</div>
        </StyledPrintButton>
      </div>
      <AdminBlock style={{ position: 'relative', overflow: 'auto' }}>
        <StyledGridTitle style={{ width: (cols + 1) * 50 }}>
          {formatMessage(pageMessages.VenueSeatSetting.blackboardPosition)}
        </StyledGridTitle>
        <GridLayout
          className="layout"
          layout={layout}
          cols={cols + 1}
          width={(cols + 1) * 50}
          rowHeight={30}
          margin={[0, 0]}
          containerPadding={[0, 0]}
          isBounded
          style={{ width: (cols + 1) * 50 }}
        >
          {layout.map(i => {
            const seatInfo = seats.find(seat => seat.position === Number(i.i))
            const colHeadInfo = seats.find(seat => seat.position === i.x)
            const rowHeadInfo = seats.find(seat => seat.position === i.y * (cols + 1))
            const background =
              seatInfo && colHeadInfo && rowHeadInfo
                ? [seatInfo, colHeadInfo, rowHeadInfo].find(v => v.category === 'walkway')
                  ? categoryFilter('walkway').gridColor
                  : [seatInfo, colHeadInfo, rowHeadInfo].find(v => v.category === 'high')
                  ? categoryFilter('high').gridColor
                  : '#ffffff'
                : '#ffffff'

            return (
              <div key={i.i}>
                <GridItem
                  position={{ x: i.x, y: i.y, idx: Number(i.i) }}
                  seats={seats}
                  onSeatChange={handleChangeSeatBlock}
                  onRowSeatsChange={handleChangeRowSeats}
                  onColSeatsChange={handleChangeColSeats}
                  onRowDelete={handleDeleteRow}
                  onColDelete={handleDeleteCol}
                  headTitles={headTitles}
                  backgroundColor={background}
                />
              </div>
            )
          })}
        </GridLayout>
      </AdminBlock>
    </>
  )
}

type Position = { x: number; y: number; idx: number }

interface GridItemProps {
  position: Position
  seats: Seat[]
  onSeatChange: (seatInfo: Seat, position: Position) => void
  onRowSeatsChange: (newValue: CategoryName, seatInfo: Seat, position: Position) => void
  onColSeatsChange: (newValue: CategoryName, seatInfo: Seat, position: Position) => void
  onRowDelete: (row: number) => void
  onColDelete: (col: number) => void
  headTitles: { col: string[]; row: string[] }
  backgroundColor?: string
}

const GridItem: React.VFC<GridItemProps> = ({
  position,
  seats,
  onSeatChange,
  onRowSeatsChange,
  onColSeatsChange,
  onRowDelete,
  onColDelete,
  headTitles,
  backgroundColor,
}: GridItemProps) => {
  const { formatMessage } = useIntl()
  const seatInfo = seats.find(seat => seat.position === position.idx)

  if (seatInfo) {
    if (position.x === 0 && position.y === 0) {
      return <StyledButton disabled></StyledButton>
    } else if (position.y === 0) {
      return (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                onClick={() => {
                  seatInfo && onColSeatsChange('walkway', seatInfo, position)
                }}
              >
                {seatInfo?.category === 'walkway'
                  ? `${formatMessage(commonMessages.ui.cancel)}${formatMessage(pageMessages.VenueSeatSetting.walkway)}`
                  : `${formatMessage(commonMessages.ui.set)}${formatMessage(pageMessages.VenueSeatSetting.walkway)}`}
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  seatInfo && onColSeatsChange('high', seatInfo, position)
                }}
              >
                {seatInfo?.category === 'high'
                  ? `${formatMessage(commonMessages.ui.cancel)}${formatMessage(pageMessages.VenueSeatSetting.high)}`
                  : `${formatMessage(commonMessages.ui.set)}${formatMessage(pageMessages.VenueSeatSetting.high)}`}
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  onColDelete(position.x)
                }}
              >
                {formatMessage(commonMessages.ui.delete)}
                {formatMessage(pageMessages.VenueSeatSetting.col)}
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <StyledButton backgroundColor={backgroundColor}>{headTitles.col[position.x]}</StyledButton>
        </Dropdown>
      )
    } else if (position.x === 0) {
      return (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                onClick={() => {
                  seatInfo && onRowSeatsChange('walkway', seatInfo, position)
                }}
              >
                {seatInfo?.category === 'walkway'
                  ? `${formatMessage(commonMessages.ui.cancel)}${formatMessage(pageMessages.VenueSeatSetting.walkway)}`
                  : `${formatMessage(commonMessages.ui.set)}${formatMessage(pageMessages.VenueSeatSetting.walkway)}`}
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  seatInfo && onRowSeatsChange('high', seatInfo, position)
                }}
              >
                {seatInfo?.category === 'high'
                  ? `${formatMessage(commonMessages.ui.cancel)}${formatMessage(pageMessages.VenueSeatSetting.high)}`
                  : `${formatMessage(commonMessages.ui.set)}${formatMessage(pageMessages.VenueSeatSetting.high)}`}
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  onRowDelete(position.y)
                }}
              >
                {formatMessage(commonMessages.ui.delete)}
                {formatMessage(pageMessages.VenueSeatSetting.row)}
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <StyledButton backgroundColor={backgroundColor}>{headTitles.row[position.y]}</StyledButton>
        </Dropdown>
      )
    } else {
      return (
        <StyledButton
          backgroundColor={backgroundColor}
          onClick={() => {
            seatInfo && onSeatChange(seatInfo, position)
          }}
        >
          {seatInfo && categoryFilter(seatInfo.category).content}
        </StyledButton>
      )
    }
  } else {
    return null
  }
}

const SAVE_VENUE_SEATS = gql`
  mutation SAVE_VENUE_SEATS(
    $venueId: uuid!
    $objects: [venue_seat_insert_input!]!
    $cols: Int!
    $rows: Int!
    $seats: Int!
  ) {
    update_venue(where: { id: { _eq: $venueId } }, _set: { cols: $cols, rows: $rows, seats: $seats }) {
      affected_rows
    }
    delete_venue_seat(where: { venue_id: { _eq: $venueId } }) {
      affected_rows
    }
    insert_venue_seat(objects: $objects) {
      affected_rows
    }
  }
`

export default VenueSeatSetting
