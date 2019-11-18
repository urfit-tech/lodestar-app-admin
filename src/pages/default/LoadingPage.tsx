import { Skeleton } from 'antd'
import React from 'react'
import DefaultLayout from '../../components/layout/DefaultLayout'

const LoadingPage = () => {
  return (
    <DefaultLayout noFooter>
      <div className="container">
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </div>
    </DefaultLayout>
  )
}

export default LoadingPage
