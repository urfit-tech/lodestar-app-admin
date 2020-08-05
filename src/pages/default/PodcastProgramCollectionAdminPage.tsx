import Icon from '@ant-design/icons'
import { Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import PodcastProgramCollectionAdminTable from '../../components/podcast/PodcastProgramCollectionAdminTable'
import PodcastProgramCreationModal from '../../components/podcast/PodcastProgramCreationModal'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as MicrophoneOIcon } from '../../images/icon/microphone-o.svg'

const PodcastProgramCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentUserRole, currentMemberId } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <MicrophoneOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.podcastPrograms)}</span>
      </AdminPageTitle>

      {!currentMemberId ? (
        <Skeleton active />
      ) : (
        <>
          <div className="mb-5">
            <PodcastProgramCreationModal memberId={currentMemberId} />
          </div>

          <AdminPageBlock>
            <PodcastProgramCollectionAdminTable
              memberId={currentUserRole === 'content-creator' ? currentMemberId : undefined}
            />
          </AdminPageBlock>
        </>
      )}
    </AdminLayout>
  )
}

export default PodcastProgramCollectionAdminPage
