import { Button, message, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import AdminModal from '../../components/admin/AdminModal'
import { handleError } from '../../helpers'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { CraftPageAdminProps } from '../../types/craft'

const StyledConfirmation = styled.div`
  line-height: 24px;
`

const CraftPageDeletionAdminCard: React.FC<{
  page: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ page }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { updateAppPage } = useMutateAppPage()

  if (!page) {
    return <Skeleton active />
  }

  const handleArchive = (pageId: string) => {
    updateAppPage({
      pageId,
      isDeleted: true,
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyDeleted))
        history.push('/craft-page')
      })
      .catch(handleError)
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>{formatMessage(craftPageMessages.text.deletePageWarning)}</div>
      <AdminModal
        className="mb-2"
        title={formatMessage(craftPageMessages.ui.deletePage)}
        renderTrigger={({ setVisible }) => (
          <Button type="primary" danger onClick={() => setVisible(true)}>
            {formatMessage(craftPageMessages.ui.deletePage)}
          </Button>
        )}
        okText={formatMessage(commonMessages.ui.delete)}
        okButtonProps={{ danger: true }}
        cancelText={formatMessage(commonMessages.ui.back)}
        onOk={() => handleArchive(page.id)}
      >
        <StyledConfirmation>{formatMessage(craftPageMessages.text.deletePageConfirmation)}</StyledConfirmation>
      </AdminModal>
    </div>
  )
}

export default CraftPageDeletionAdminCard
