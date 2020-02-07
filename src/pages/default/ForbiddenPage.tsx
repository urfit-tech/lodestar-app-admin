import { Button } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { commonMessages, errorMessages } from '../../helpers/translation'

const ForbiddenPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { history } = useRouter()

  return (
    <DefaultLayout>
      <div className="vw-100 pt-5 text-center">
        <div className="mb-3">{formatMessage(errorMessages.text.forbidden)}</div>
        <Button type="primary" onClick={() => history.goBack()}>
          {formatMessage(commonMessages.ui.back)}
        </Button>
      </div>
    </DefaultLayout>
  )
}

export default ForbiddenPage
