import { Button, Input } from 'antd'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, salesMessages } from '../../helpers/translation'
import { TrashOIcon } from '../../images/icon'
import { SalesLeadMember } from '../../types/sales'
import AdminModal from '../admin/AdminModal'
import { StyledModalTitle } from '../common'
import { StyledInputTitle } from './AddListModal'
import saleMessages from './translation'

const ManagerListModal: React.VFC<{
  visible: boolean
  handleClose: () => void
  handleManagerLeadStatusCategory: (deletedLeadStatusCategoryIds: string[], memberIds: string[]) => Promise<void>
  leadStatusCategories: {
    id: any
    memberId: string
    status: string
    categoryName: string
    categoryId: string
  }[]
  leads: SalesLeadMember[]
}> = ({ visible, handleClose, handleManagerLeadStatusCategory, leadStatusCategories, leads }) => {
  const { formatMessage } = useIntl()
  const [tempLeadStatusCategories, setTempLeadStatusCategories] = useState<
    {
      id: string
      memberId: string
      status: string
      categoryName: string
    }[]
  >(leadStatusCategories)

  useEffect(() => {
    setTempLeadStatusCategories(leadStatusCategories)
  }, [leadStatusCategories])

  const deletedLeadStatusCategoryIds = leadStatusCategories
    .filter(lead => !tempLeadStatusCategories.map(c => c.id).includes(lead.id))
    .map(c => c.id)

  const onCancel = () => {
    handleClose()
    setTempLeadStatusCategories(leadStatusCategories)
  }

  const removeCategory = (categoryId: string) => {
    setTempLeadStatusCategories(tempLeadStatusCategories.filter(c => c.id !== categoryId))
  }
  return (
    <AdminModal
      width={384}
      centered
      footer={null}
      onCancel={onCancel}
      visible={visible}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              onCancel()
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              handleManagerLeadStatusCategory(
                deletedLeadStatusCategoryIds,
                leads
                  .filter(lead => deletedLeadStatusCategoryIds.includes(lead.leadStatusCategoryId))
                  .map(lead => lead.id),
              ).then(onCancel)
            }}
          >
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
    >
      <StyledModalTitle className="mb-4"> {formatMessage(salesMessages.managerList)}</StyledModalTitle>
      <div style={{ overflow: 'auto', maxHeight: 500 }}>
        {tempLeadStatusCategories.map(c => (
          <div key={c.id}>
            <StyledInputTitle>
              {formatMessage(salesMessages.listName)}
              <span className="ml-2">
                ({leads.filter(lead => lead.leadStatusCategoryId === c.id).length}
                {formatMessage(saleMessages.ManagerListModal.leadCount)})
              </span>
            </StyledInputTitle>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Input value={c.categoryName} disabled />
              <TrashOIcon
                className="cursor-pointer ml-4"
                onClick={() => {
                  removeCategory(c.id)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </AdminModal>
  )
}

export default ManagerListModal
