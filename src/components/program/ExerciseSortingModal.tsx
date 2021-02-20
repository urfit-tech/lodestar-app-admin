import Icon, { DragOutlined } from '@ant-design/icons'
import { Button, Select } from 'antd'
import { adjust, move } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled from 'styled-components'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ReactComponent as AngleRightIcon } from '../../images/icon/angle-right.svg'
import AdminModal from '../admin/AdminModal'
import {
  StyledDraggableItem,
  StyledReactSortableWrapper,
  StyledSelect,
  StyledSelectOptionWrapper,
} from '../common/ItemsSortingModal'
import { BraftContent } from '../common/StyledBraftEditor'
import { QuestionBlock, StyledAction } from '../form/QuestionInput'

const StyledQuestionBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 25px 1fr;
`

type ItemProps = {
  id: string
  description: string | null
}

const ExerciseSortingModal: React.FC<{
  programContentId: string
  questions: (ItemProps & { choices: ItemProps[] })[]
  onSort: (newItems: { id: string; subItemIds: string[] }[], onClose: () => void) => void
}> = ({ programContentId, questions, onSort }) => {
  const { formatMessage } = useIntl()
  const [isLoading, setIsLoading] = useState(false)
  const [sortedQuestions, setSortedQuestions] = useState(questions)

  useEffect(() => {
    setSortedQuestions(questions)
  }, [questions])

  return (
    <AdminModal
      destroyOnClose
      renderTrigger={({ setVisible }) => (
        <Button type="link" icon={<DragOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(programMessages.ui.sortContents)}
        </Button>
      )}
      title={formatMessage(programMessages.ui.sortContents)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div className="mt-4">
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={() => {
              setIsLoading(true)
              onSort(
                sortedQuestions.map(v => ({
                  id: v.id,
                  subItemIds: v.choices.map(w => w.id),
                })),
                () => {
                  setVisible(false)
                  setIsLoading(false)
                },
              )
            }}
          >
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      )}
    >
      <StyledReactSortableWrapper>
        <ReactSortable handle=".item" list={sortedQuestions} setList={setSortedQuestions} ghostClass="hover-background">
          {sortedQuestions.map((v, i) => (
            <QuestionSortingBlock
              key={v.id}
              description={v.description}
              choices={v.choices}
              programContentId={programContentId}
              onSort={newChoices =>
                setSortedQuestions(adjust(i, question => ({ ...question, choices: newChoices }), sortedQuestions))
              }
            />
          ))}
        </ReactSortable>
      </StyledReactSortableWrapper>
    </AdminModal>
  )
}

const QuestionSortingBlock: React.FC<{
  description: string | null
  choices: ItemProps[]
  programContentId: string
  onSort: (newItems: ItemProps[]) => void
}> = ({ description, choices, onSort }) => {
  const { formatMessage } = useIntl()
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <QuestionBlock variant={isCollapsed ? 'collapsed' : undefined}>
      <StyledQuestionBlock>
        <div className="d-flex justify-content-between align-items-center">
          <span className="d-flex align-items-center">
            <Icon component={() => <DragOutlined />} className={`item mr-2 cursor-pointer`} />
            <BraftContent>{description}</BraftContent>
          </span>
          <StyledAction
            component={() => <AngleRightIcon />}
            variant="primary"
            direction={isCollapsed ? undefined : 'down'}
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </div>
        <StyledReactSortableWrapper className="pt-4 pl-4">
          <ReactSortable handle=".sub-item" list={choices} setList={onSort} ghostClass="hover-background">
            {choices.map((v, i) => (
              <StyledDraggableItem
                handlerClassName="sub-item"
                key={v.id}
                dataId={v.id}
                className="mb-2"
                actions={[
                  <StyledSelect
                    key={v.id}
                    value={i + 1}
                    showArrow={false}
                    bordered={false}
                    onSelect={position => onSort(move(i, Number(position) - 1, choices))}
                    optionLabelProp="label"
                    dropdownStyle={{ minWidth: '120px', borderRadius: '4px' }}
                    dropdownRender={menu => <StyledSelectOptionWrapper>{menu}</StyledSelectOptionWrapper>}
                  >
                    {Array.from(Array(choices.length).keys()).map((value, index) => (
                      <Select.Option
                        className={i === index ? 'active' : i > index ? 'hover-top' : 'hover-bottom'}
                        key={value}
                        value={value + 1}
                        label={value + 1}
                      >
                        <span>{value + 1}</span>
                        {i === index ? `（${formatMessage(commonMessages.label.current)}）` : ''}
                      </Select.Option>
                    ))}
                  </StyledSelect>,
                ]}
              >
                <BraftContent>{v.description}</BraftContent>
              </StyledDraggableItem>
            ))}
          </ReactSortable>
        </StyledReactSortableWrapper>
      </StyledQuestionBlock>
    </QuestionBlock>
  )
}

export default ExerciseSortingModal
