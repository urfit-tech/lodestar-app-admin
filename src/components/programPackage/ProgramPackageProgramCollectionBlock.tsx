import { EyeOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, programPackageMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProgramPackageProgramProps } from '../../types/programPackage'
import { OverlayBlock, OverlayWrapper } from '../admin/PositionAdminLayout'

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
}> = ({ programPackageId, programs }) => {
  const { formatMessage } = useIntl()

  return (
    <div className="row py-5">
      {programs.map(program => (
        <div key={program.id} className="col-md-6 col-lg-4 col-12 mb-5">
          <OverlayWrapper>
            <StyledCover src={program.program.coverThumbnailUrl || program.program.coverUrl} className="mb-3" />
            <OverlayBlock>
              <div>
                <a href={`/programs/${program.program.id}`} target="_blank" rel="noopener noreferrer">
                  <StyledButton block icon={<EyeOutlined />}>
                    {formatMessage(commonMessages.ui.check)}
                  </StyledButton>
                </a>
              </div>
            </OverlayBlock>
          </OverlayWrapper>

          <StyledTitle level={3} ellipsis={{ rows: 2 }}>
            {program.program.publishedAt
              ? program.program.title
              : `( ${formatMessage(programPackageMessages.status.unpublished)} ) ${program.program.title}`}
          </StyledTitle>
        </div>
      ))}
    </div>
  )
}

export default ProgramPackageProgramCollectionBlock
