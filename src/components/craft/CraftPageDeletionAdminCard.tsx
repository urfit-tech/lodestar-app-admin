import { Button, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftPageAdminProps } from '../../types/craft'
import AdminModal from '../admin/AdminModal'

const StyledConfirmation = styled.div`
  line-height: 24px;
`

const CraftPageDeletionAdminCard: React.FC<{
  page: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ page }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  //TODO: app_page create is_deleted column
  //   const [archivePage] = useMutation<hasura.UPDATE_PAGE_IS_DELETED, hasura.UPDATE_PAGE_IS_DELETEDVariables>(
  //     UPDATE_PAGE_IS_DELETED,
  //   )
  if (!page) {
    return <Skeleton active />
  }

  const handleArchive = (PageId: string) => {
    // archivePage({
    //   variables: { pageId },
    // })
    //   .then(() => {
    //     message.success(formatMessage(commonMessages.event.successfullyDeleted))
    //     history.push('/craft_page')
    //   })
    //   .catch(handleError)
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>{formatMessage(craftPageMessages.text.deletePageWarning)}</div>
      <AdminModal
        className="mb-2"
        title={formatMessage(craftPageMessages.ui.deletePage)}
        renderTrigger={({ setVisible }) => (
          //   page.isDeleted ? (
          // <Button disabled>{formatMessage(commonMessages.status.deleted)}</Button>
          //   )
          //   ) : (
          <Button type="primary" danger onClick={() => setVisible(true)}>
            {formatMessage(craftPageMessages.ui.deletePage)}
          </Button>
        )}
        okText={formatMessage(commonMessages.ui.delete)}
        okButtonProps={{ danger: true }}
        cancelText={formatMessage(commonMessages.ui.back)}
        // onOk={() => handleArchive(page.id)}
      >
        <StyledConfirmation>{formatMessage(craftPageMessages.text.deletePageConfirmation)}</StyledConfirmation>
      </AdminModal>
    </div>
  )
}

// const UPDATE_PAGE_IS_DELETED = gql`
//   mutation UPDATE_PAGE_IS_DELETED($pageId: uuid) {
//     update_app_page(
//       # where: { id: { _eq: $pageId } } # , _set: { is_deleted: true }
//     ) {
//       affected_rows
//     }
//   }
// `

export default CraftPageDeletionAdminCard
