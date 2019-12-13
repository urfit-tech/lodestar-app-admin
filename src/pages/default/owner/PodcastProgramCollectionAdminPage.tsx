import { Icon, Skeleton } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useAuth } from '../../../components/auth/AuthContext'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import PodcastProgramCollectionAdminTable from '../../../containers/podcast/PodcastProgramCollectionAdminTable'
import PodcastProgramCreationModal from '../../../containers/podcast/PodcastProgramCreationModal'
import { ReactComponent as MicrophoneIcon } from '../../../images/default/microphone.svg'

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
  const { currentMemberId } = useAuth()

  return (
    <OwnerAdminLayout>
      <StyledTitle className="mb-4">
        <Icon component={() => <MicrophoneIcon />} className="mr-2" />
        <span>廣播管理</span>
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
