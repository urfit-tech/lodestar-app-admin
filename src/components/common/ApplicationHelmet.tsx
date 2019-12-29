import React from 'react'
import { Helmet } from 'react-helmet'
import settings from '../../settings'

const ApplicationHelmet = () => {
  return (
    <Helmet>
      <title>{settings.title}</title>
    </Helmet>
  )
}

export default ApplicationHelmet
