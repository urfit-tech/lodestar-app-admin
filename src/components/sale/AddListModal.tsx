import { Button, Input } from 'antd'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, salesMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'
import { StyledModalTitle } from '../common'

export const StyledInputTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  color: var(--gray-darker);
  margin-bottom: 4px;
`

const AddListModal: React.VFC<{
  visible: boolean
  handleClose: () => void
  handleAddLeadStatusCategory: (listName: string) => Promise<void>
}> = ({ visible, handleClose, handleAddLeadStatusCategory }) => {
  const { formatMessage } = useIntl()
  const [listName, setListName] = useState('')

  const onCancel = () => {
    handleClose()
    setListName('')
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
          <Button type="primary" onClick={() => handleAddLeadStatusCategory(listName).then(onCancel)}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
    >
      <StyledModalTitle className="mb-4"> {formatMessage(salesMessages.addList)}</StyledModalTitle>
      <StyledInputTitle>{formatMessage(salesMessages.listName)}</StyledInputTitle>
      <Input
        className="mb-4"
        value={listName}
        onChange={e => setListName(e.target.value)}
        placeholder={formatMessage(salesMessages.listName)}
      />
    </AdminModal>
  )
}

export default AddListModal
