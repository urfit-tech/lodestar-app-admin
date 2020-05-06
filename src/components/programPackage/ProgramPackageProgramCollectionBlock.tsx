import { useMutation } from '@apollo/react-hooks'
import { Button, Icon, Popover, Typography } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { ReactComponent as MoveIcon } from '../../images/icon/move.svg'
import types from '../../types'
import { ProgramPackageProgramProps } from '../../types/programPackage'
import PositionAdminLayout, {
  OverlayBlock,
  OverlayList,
  OverlayListContent,
  OverlayListItem,
  OverlayWrapper,
} from '../common/PositionAdminLayout'

const StyledButton = styled(Button)`
  && {
    background: none;
    border: 1px solid white;
    color: white;
  }
`
const StyledCover = styled.div<{ src?: string | null }>`
  position: relative;
  padding-top: ${900 / 16}%;
  background-image: url(${props => props.src || EmptyCover});
  background-size: cover;
  background-position: center;
  border-radius: 4px;
`
const StyledTitle = styled(Typography.Title)`
  && {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
    color: var(--gray-darker);
  }
`

const ProgramPackageProgramCollectionBlock: React.FC<{
  programPackageId: string
  programs: ProgramPackageProgramProps[]
  onRefetch?: () => void
}> = ({ programPackageId, programs, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updatePosition] = useMutation<
    types.UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTION,
    types.UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTIONVariables
  >(UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTION)

  return (
    <div className="row py-5">
      <PositionAdminLayout<ProgramPackageProgramProps>
        value={programs}
        onChange={value =>
          updatePosition({
            variables: {
              data: value.map((program, index) => ({
                id: program.id,
                program_id: program.program.id,
                program_package_id: programPackageId,
                position: index,
              })),
            },
          }).then(() => onRefetch && onRefetch())
        }
        renderItem={(program, currentIndex, moveTarget) => (
          <div key={program.id} className="col-md-6 col-lg-4 col-12 mb-5">
            <OverlayWrapper>
              <StyledCover src={program.program.coverUrl} className="mb-3" />
              <OverlayBlock>
                <div>
                  <Popover
                    placement="bottomLeft"
                    content={
                      <OverlayList
                        header={formatMessage(commonMessages.label.currentPosition, {
                          position: currentIndex + 1,
                        })}
                      >
                        <OverlayListContent>
                          {programs.map((program, index) => (
                            <OverlayListItem
                              key={program.id}
                              className={currentIndex === index ? 'active' : ''}
                              onClick={() => moveTarget(currentIndex, index)}
                            >
                              <span className="flex-shrink-0">{index + 1}</span>
                              <span>{program.program.title}</span>
                            </OverlayListItem>
                          ))}
                        </OverlayListContent>
                      </OverlayList>
                    }
                  >
                    <StyledButton block>
                      <Icon component={() => <MoveIcon />} />
                      {formatMessage(commonMessages.ui.changePosition)}
                    </StyledButton>
                  </Popover>
                </div>
              </OverlayBlock>
            </OverlayWrapper>

            <StyledTitle level={3} ellipsis={{ rows: 2 }}>
              {program.program.title}
            </StyledTitle>
          </div>
        )}
      />
    </div>
  )
}

const UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTION = gql`
  mutation UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTION($data: [program_package_program_insert_input!]!) {
    insert_program_package_program(
      objects: $data
      on_conflict: { constraint: program_package_program_pkey, update_columns: position }
    ) {
      affected_rows
    }
  }
`

export default ProgramPackageProgramCollectionBlock
