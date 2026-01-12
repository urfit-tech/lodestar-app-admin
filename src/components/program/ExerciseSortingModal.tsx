import { DragOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { adjust } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled from 'styled-components'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ReactComponent as AngleRightIcon } from '../../images/icon/angle-right.svg'
import AdminModal from '../admin/AdminModal'
import DraggableItemCollectionBlock, { ItemProps, StyledReactSortableWrapper } from '../common/DraggableItemCollectionBlock'
import { QuestionBlock, StyledAction } from '../form/QuestionInput'

const StyledQuestionBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 25px 1fr;
`

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
        <ReactSortable
          handle=".item"
          list={sortedQuestions}
          setList={newState => setSortedQuestions(newState)}
          ghostClass="hover-background"
        >
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
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <QuestionBlock variant={isCollapsed ? 'collapsed' : undefined}>
      <StyledQuestionBlock>
        <div className=" d-flex justify-content-between align-items-center">
          <span className="item d-flex align-items-center mr-4">
            <DragOutlined className="mr-2 cursor-pointer" />
            <BraftContent>{description}</BraftContent>
          </span>
          <StyledAction
            component={() => <AngleRightIcon />}
            variant="primary"
            direction={isCollapsed ? undefined : 'down'}
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </div>
        <div className="pt-4 pl-4">
          <DraggableItemCollectionBlock items={choices} onSort={onSort} />
        </div>
      </StyledQuestionBlock>
    </QuestionBlock>
  )
}

export default ExerciseSortingModal
