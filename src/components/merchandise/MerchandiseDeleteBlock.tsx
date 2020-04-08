import { useMutation } from '@apollo/react-hooks'
import { Button } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import { handleError } from '../../helpers'
import { merchandiseMessages } from '../../helpers/translation'
import types from '../../types'

const messages = defineMessages({
  deleteDescription: {
    id: 'merchandise.text.deleteDescription',
    defaultMessage: '請仔細確認是否真的要刪除，因為一旦刪除就無法恢復。',
  },
})

const MerchandiseDeleteBlock: React.FC<{ merchandiseId: string }> = ({ merchandiseId }) => {
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const [deleteMerchandise] = useMutation<types.DELETE_MERCHANDISE, types.DELETE_MERCHANDISEVariables>(
    DELETE_MERCHANDISE,
  )

  const handleDelete = () => {
    deleteMerchandise({
      variables: {
        merchandiseId,
      },
    })
      .then(() => {
        history.push('/merchandises')
      })
      .catch(handleError)
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>{formatMessage(messages.deleteDescription)}</div>
      <Button type="primary" onClick={handleDelete}>
        {formatMessage(merchandiseMessages.ui.deleteMerchandise)}
      </Button>
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
