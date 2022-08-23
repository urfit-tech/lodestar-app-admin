import { Button } from '@chakra-ui/react'
import DefaultLayout from '../../components/layout/DefaultLayout'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import ForbiddenPageMessages from './translation'

const ForbiddenPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()

  return (
    <DefaultLayout>
      <div className="vw-100 pt-5 text-center">
        <div className="mb-3">{formatMessage(ForbiddenPageMessages['*'].noAuthority)}</div>
        <Button variant="outline" className="mr-2" onClick={() => history.goBack()}>
          {formatMessage(ForbiddenPageMessages['*'].previousPage)}
        </Button>
        <Button colorScheme="primary" onClick={() => history.push('/')}>
          {formatMessage(ForbiddenPageMessages['*'].home)}
        </Button>
      </div>
    </DefaultLayout>
  )
}

export default ForbiddenPage
