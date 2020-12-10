import { DragOutlined } from '@ant-design/icons'
import { Button, Select } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { ProgramSortProps } from '../../pages/default/ProgramCollectionAdminPage'
import AdminModal from '../admin/AdminModal'
import DraggableItem from '../common/DraggableItem'

const messages = defineMessages({
  current: { id: 'program.label.current', defaultMessage: '目前' },
  sortProgram: { id: 'program.ui.sortProgram', defaultMessage: '課程排序' },
})
const StyledDraggableItem = styled(DraggableItem)`
  padding: 0 0 0 14px;
  background: white;
  border: solid 1px var(--gray-light);
  border-radius: 4px;
`
const StyledSelect = styled(Select)`
  text-align: center;
  border-left: solid 1px var(--gray-light);
  height: 100%;
  width: 50px;
`

const ProgramCollectionStructureAdminModal: React.FC<{
  programs: ProgramSortProps[]
  onSubmit?: (value: ProgramSortProps[]) => Promise<any>
}> = ({ programs, onSubmit, ...props }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [sortingPrograms, setSortingPrograms] = useState(programs)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!programs.length) {
      setVisible(false)
      return
    }
    setLoading(true)
    onSubmit?.(sortingPrograms)
      .then(() => {
        setVisible(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="link" icon={<DragOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(messages.sortProgram)}
        </Button>
      )}
      title={formatMessage(messages.sortProgram)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      {...props}
    >
      <ReactSortable
        handle=".draggable-content"
        list={sortingPrograms}
        setList={newSections => {
          setSortingPrograms(newSections)
        }}
      >
        {sortingPrograms.map((sortingProgram, sortingProgramIndex) => (
          <StyledDraggableItem
            key={sortingProgram.id}
            className="mb-2"
            dataId={sortingProgram.id}
            handlerClassName="draggable-content"
            actions={[
              <StyledSelect
                value={sortingProgramIndex + 1}
                showArrow={false}
                bordered={false}
                onSelect={position => {
                  const cloneData = sortingPrograms.slice()
                  cloneData.splice(Number(sortingProgramIndex), 1)
                  cloneData.splice(Number(position) - 1, 0, sortingProgram)
                  setSortingPrograms(cloneData)
                }}
                optionLabelProp="label"
                dropdownStyle={{ minWidth: '120px', borderRadius: '4px' }}
              >
                {Array.from(Array(sortingPrograms.length).keys()).map((v, i) => (
                  <Select.Option key={v} value={v + 1} label={v + 1}>
                    <span>{v + 1}</span>
                    {sortingProgramIndex === i ? `（${formatMessage(messages.current)}）` : ''}
                  </Select.Option>
                ))}
              </StyledSelect>,
            ]}
          >
            {sortingProgram.title}
          </StyledDraggableItem>
        ))}
      </ReactSortable>
    </AdminModal>
  )
}

export default ProgramCollectionStructureAdminModal
