import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Input, Menu, message } from 'antd'
import gql from 'graphql-tag'
import React, { useMemo, useState } from 'react'
import GridLayout from 'react-grid-layout'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { AdminBlock } from '../../components/admin'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { Seat, Venue } from '../../types/venue'
import pageMessages from '../translation'

interface ButtonProps {
  seatDisabled?: boolean
  category?: string | null
}

const StyledButton = styled.button<ButtonProps>`
  border: 1px solid #000000;
  width: 100%;
  height: 100%;
  background-color: ${props =>
    props.seatDisabled
      ? props.category === 'walkway'
        ? '#ececec'
        : props.category === 'heigh'
        ? 'rgba(255, 190, 30, 0.1)'
        : undefined
      : undefined};
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

const StyledInput = styled(Input)`
  margin-right: 1.5rem;
  width: 80px;
`

const generateGridLayout = (cols: number, rows: number) => {
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

const VenueSeatSetting: React.VFC<{ venue: Venue; onRefetch?: () => void }> = ({ venue, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [cols, setCols] = useState(venue.cols)
  const [rows, setRows] = useState(venue.rows)
  const [seats, setSeats] = useState<Seat[]>(venue.venue_seats)
  const [loading, setLoading] = useState(false)
  const [saveVenueSeats] = useMutation<hasura.SAVE_VENUE_SEATS, hasura.SAVE_VENUE_SEATSVariables>(SAVE_VENUE_SEATS)

  const isSeatInfoChanged: boolean = useMemo(() => {
    let isChanged = false
    for (const seat of seats) {
      if (JSON.stringify(seat) !== JSON.stringify(venue.venue_seats.filter(s => s.position === seat.position)[0])) {
        isChanged = true
        break
      }
    }
    return isChanged
  }, [venue.venue_seats, seats])

  const layout = useMemo(() => {
    return generateGridLayout(cols + 1, rows + 1)
  }, [cols, rows])

  // adjust number of cols/rows
  const handleChangeCols = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (newValue < 0) return
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
            category: null,
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
  const handleChangeRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (newValue < 0) return
    if (!isNaN(newValue)) {
      let newSeats: Seat[] = []
      const dif = newValue - rows

      if (dif >= 0) {
        for (let i = 0; i < (newValue + 1) * (cols + 1); i++) {
          if (i / (cols + 1) < newValue - dif + 1) {
            newSeats.push({ ...seats.filter(seat => seat.position === i)[0] })
          } else {
            newSeats.push({ venue_id: venue.id, id: uuid().toString(), position: i, disabled: false, category: null })
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
  const handleChangeSeat = (newValue: Seat) => {
    setSeats([...seats.filter(seat => seat.position !== newValue.position), newValue])
  }

  // adjust all seats of one col/row
  const handleChangeRowSeats = (row: number, newValue: Seat) => {
    let newSeats: Seat[] = []
    for (const seat of seats.filter(seat => Math.floor(seat.position / (cols + 1)) === row)) {
      newSeats.push({
        ...seat,
        disabled: seat.category === 'walkway' || seat.category === 'blocked' || newValue.disabled,
        category: seat.category === 'walkway' || seat.category === 'blocked' ? seat.category : newValue.category,
      })
    }
    setSeats([...seats.filter(seat => Math.floor(seat.position / (cols + 1)) !== row), ...newSeats])
  }
  const handleChangeColSeats = (col: number, newValue: Seat) => {
    let newSeats: Seat[] = []
    for (const seat of seats.filter(seat => seat.position % (cols + 1) === col)) {
      newSeats.push({ ...seat, disabled: newValue.disabled, category: newValue.category })
    }
    setSeats([...seats.filter(seat => seat.position % (cols + 1) !== col), ...newSeats])
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

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <StyledSubTitle>{formatMessage(pageMessages.VenueSeatSetting.rows)}</StyledSubTitle>
          <StyledInput value={rows} onChange={handleChangeRows} />
          <StyledSubTitle>{formatMessage(pageMessages.VenueSeatSetting.cols)}</StyledSubTitle>
          <StyledInput value={cols} onChange={handleChangeCols} />
        </div>
        <div className="d-flex align-items-center">
          {isSeatInfoChanged && (
            <>
              <Button
                className="mr-2"
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
              <Button
                onClick={() => {
                  setCols(venue.cols)
                  setRows(venue.rows)
                  setSeats(venue.venue_seats)
                }}
              >
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
            </>
          )}
        </div>
      </div>
      <AdminBlock>
        <GridLayout
          className="layout"
          layout={layout}
          cols={cols + 1}
          width={(cols + 1) * 50}
          rowHeight={30}
          margin={[0, 0]}
          containerPadding={[0, 0]}
          isBounded
          useCSSTransforms
          style={{ position: 'relative' }}
        >
          {layout.map(i => (
            <div key={i.i}>
              <GridItem
                colIndex={i.x}
                rowIndex={i.y}
                seatInfo={seats.filter(seat => seat.position.toString() === i.i)[0]}
                onSeatChange={handleChangeSeat}
                onRowSeatsChange={handleChangeRowSeats}
                onColSeatsChange={handleChangeColSeats}
                onRowDelete={handleDeleteRow}
                onColDelete={handleDeleteCol}
              />
            </div>
          ))}
        </GridLayout>
      </AdminBlock>
    </>
  )
}

interface GridItemProps {
  colIndex: number
  rowIndex: number
  seatInfo: Seat
  onSeatChange: (newValue: Seat) => void
  onRowSeatsChange: (row: number, newValue: Seat) => void
  onColSeatsChange: (col: number, newValue: Seat) => void
  onRowDelete: (row: number) => void
  onColDelete: (col: number) => void
}

const GridItem: React.VFC<GridItemProps> = ({
  colIndex,
  rowIndex,
  seatInfo,
  onSeatChange,
  onRowSeatsChange,
  onColSeatsChange,
  onRowDelete,
  onColDelete,
}: GridItemProps) => {
  const { formatMessage } = useIntl()
  return colIndex === 0 && rowIndex === 0 ? (
    <StyledButton disabled></StyledButton>
  ) : rowIndex === 0 ? (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item
            onClick={() => {
              onColSeatsChange(colIndex, {
                ...seatInfo,
                disabled: !seatInfo.disabled,
                category: !seatInfo.disabled ? 'walkway' : null,
              })
            }}
          >
            {seatInfo.disabled
              ? `${formatMessage(commonMessages.ui.cancel)}${formatMessage(pageMessages.VenueSeatSetting.walkway)}`
              : `${formatMessage(commonMessages.ui.set)}${formatMessage(pageMessages.VenueSeatSetting.walkway)}`}
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              onColDelete(colIndex)
            }}
          >
            {formatMessage(commonMessages.ui.delete)}
            {formatMessage(pageMessages.VenueSeatSetting.col)}
          </Menu.Item>
        </Menu>
      }
      trigger={['click']}
    >
      <StyledButton seatDisabled={seatInfo.disabled} category={seatInfo.category}>
        {colIndex}
      </StyledButton>
    </Dropdown>
  ) : colIndex === 0 ? (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item
            onClick={() => {
              onRowSeatsChange(rowIndex, {
                ...seatInfo,
                disabled: !seatInfo.disabled,
                category: !seatInfo.disabled ? 'heigh' : null,
              })
            }}
          >
            {seatInfo.disabled
              ? `${formatMessage(commonMessages.ui.cancel)}${formatMessage(pageMessages.VenueSeatSetting.heigh)}`
              : `${formatMessage(commonMessages.ui.set)}${formatMessage(pageMessages.VenueSeatSetting.heigh)}`}
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              onRowDelete(rowIndex)
            }}
          >
            {formatMessage(commonMessages.ui.delete)}
            {formatMessage(pageMessages.VenueSeatSetting.row)}
          </Menu.Item>
        </Menu>
      }
      trigger={['click']}
    >
      <StyledButton seatDisabled={seatInfo.disabled} category={seatInfo.category}>
        {rowIndex}
      </StyledButton>
    </Dropdown>
  ) : (
    <StyledButton
      seatDisabled={seatInfo.disabled}
      category={seatInfo.category}
      onClick={() => {
        onSeatChange({
          ...seatInfo,
          disabled: seatInfo.category === 'walkway' || !seatInfo.disabled,
          category: seatInfo.category === 'walkway' ? 'walkway' : seatInfo.disabled ? null : 'blocked',
        })
      }}
    >
      {seatInfo.category === 'blocked' && 'XXX'}
    </StyledButton>
  )
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
