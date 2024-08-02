import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useIntl } from 'react-intl'
import { Announcement } from '../../types/announcement'
import AdminModal from '../admin/AdminModal'
import announcementMessages from './translations'

export const AnnouncementPreviewModal: React.FC<{
  announcement: Announcement
  visible: boolean
  onClose: () => void
}> = ({ announcement, visible, onClose }) => {
  const { formatMessage } = useIntl()

  return (
    <AdminModal
      visible={visible}
      onCancel={onClose}
      title={formatMessage(announcementMessages.AnnouncementModal.announcement)}
      footer={null}
    >
      <BraftContent>{announcement.content}</BraftContent>
    </AdminModal>
  )
}
