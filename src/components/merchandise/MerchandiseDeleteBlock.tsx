import { useMutation } from '@apollo/react-hooks'
import { Button, Modal } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'

const StyledModal = styled(Modal)`
  .ant-modal-body {
    padding: 2rem;
  }
  .ant-modal-footer {
    border-top: 0;
  }
`
const StyledTitle = styled.h1`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledDescription = styled.div`
  font-size: 16px;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
  line-height: 1.5;
`

const messages = defineMessages({
  deleteDescription: {
    id: 'merchandise.text.deleteDescription',
    defaultMessage: '請仔細確認是否真的要刪除，因為一旦刪除就無法恢復。',
  },
  deleteWarning: {
    id: 'merchandise.text.deleteWarning',
    defaultMessage: '一經刪除即不可恢復，確定要刪除嗎？',
  },
})

const MerchandiseDeleteBlock: React.FC<{
  merchandiseId: string
  refetch?: () => Promise<any>
}> = ({ merchandiseId, refetch }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const [deleteMerchandise] = useMutation<types.DELETE_MERCHANDISE, types.DELETE_MERCHANDISEVariables>(
    DELETE_MERCHANDISE,
  )
  const [visible, setVisible] = useState(false)

  const handleDelete = () => {
    deleteMerchandise({
      variables: {
        merchandiseId,
      },
    })
      .then(() => {
        refetch && refetch().then(() => history.push('/merchandises'))
      })
      .catch(handleError)
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>{formatMessage(messages.deleteDescription)}</div>
      <Button type="primary" onClick={() => setVisible(true)}>
        {formatMessage(merchandiseMessages.ui.deleteMerchandise)}
      </Button>

      <StyledModal
        visible={visible}
        title={null}
        okText={formatMessage(commonMessages.ui.delete)}
        onOk={() => handleDelete()}
        cancelText={formatMessage(commonMessages.ui.back)}
        onCancel={() => setVisible(false)}
      >
        <StyledTitle className="mb-4">{formatMessage(merchandiseMessages.label.delete)}</StyledTitle>
        <StyledDescription>{formatMessage(messages.deleteWarning)}</StyledDescription>
      </StyledModal>
    </div>
  )
}

const DELETE_MERCHANDISE = gql`
  mutation DELETE_MERCHANDISE($merchandiseId: uuid!) {
    update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { is_deleted: true }) {
      affected_rows
    }
  }
`

export default MerchandiseDeleteBlock
