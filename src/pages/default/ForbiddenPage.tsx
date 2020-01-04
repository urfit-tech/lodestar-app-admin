import { Button } from 'antd'
import React from 'react'
import useRouter from 'use-react-router'
import DefaultLayout from '../../components/layout/DefaultLayout'

const ForbiddenPage: React.FC = () => {
  const { history } = useRouter()
  return (
    <DefaultLayout>
      <div className="vw-100 pt-5 text-center">
        <div className="mb-3">你沒有此頁面的讀取權限</div>
        <Button type="primary" onClick={() => history.goBack()}>
          返回上頁
        </Button>
      </div>
    </DefaultLayout>
  )
}

export default ForbiddenPage
