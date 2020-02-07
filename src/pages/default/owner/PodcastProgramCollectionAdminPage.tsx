import { Icon, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import PodcastProgramCollectionAdminTable from '../../../containers/podcast/PodcastProgramCollectionAdminTable'
import PodcastProgramCreationModal from '../../../containers/podcast/PodcastProgramCreationModal'
import { useAuth } from '../../../contexts/AuthContext'
import { commonMessages } from '../../../helpers/translation'
import { ReactComponent as MicrophoneOIcon } from '../../../images/icon/microphone-o.svg'

const StyledTitle = styled.h1`
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledWrapper = styled.div`
  overflow: auto;
  padding: 2.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`

const PodcastProgramCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()

  return (
    <OwnerAdminLayout>
      <StyledTitle className="mb-4">
        <Icon component={() => <MicrophoneOIcon />} className="mr-2" />
        <span>{formatMessage(commonMessages.menu.podcastPrograms)}</span>
      </StyledTitle>

      {!currentMemberId ? (
        <Skeleton active />
      ) : (
        <>
          <div className="mb-5">
            <PodcastProgramCreationModal memberId={currentMemberId} />
          </div>

          <StyledWrapper>
            <PodcastProgramCollectionAdminTable />
          </StyledWrapper>
        </>
      )}
    </OwnerAdminLayout>
  )
}

export default PodcastProgramCollectionAdminPage
