import { Button, Typography } from 'antd'
import React, { useCallback, useContext, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { useAuth } from '../../components/auth/AuthContext'
import AuthModal, { AuthModalContext } from '../../components/auth/AuthModal'

const HomePage = () => {
  const [visible, setVisible] = useState(false)
  const { isAuthenticated, currentUserRole } = useAuth()
  if (isAuthenticated) {
    switch (currentUserRole) {
      case 'app-owner':
        return <Redirect to="/admin"></Redirect>
      case 'content-creator':
        return <Redirect to="/studio"></Redirect>
    }
  }
  return (
    <AuthModalContext.Provider value={{ visible, setVisible }}>
      <AuthModal></AuthModal>
      <div className="container">
        <div className="d-flex justify-content-center">
          <Typography.Title>KOLABLE 管理後台</Typography.Title>
        </div>
        <div className="row">
          <div className="col-12 col-md-4 offset-md-2">
            <RoleButton role="app-owner" title="我是管理員" icon="user"></RoleButton>
          </div>
          <div className="col-12 col-md-4">
            <RoleButton role="content-creator" title="我是創作者" icon="user"></RoleButton>
          </div>
        </div>
      </div>
    </AuthModalContext.Provider>
  )
}

type RoleButtonProps = {
  role: 'app-owner' | 'content-creator'
  title: string
  icon: string
}
const RoleButton: React.FC<RoleButtonProps> = ({ role, title, icon }) => {
  const { setCurrentUserRole } = useAuth()
  const { setVisible: setAuthModalVisible } = useContext(AuthModalContext)
  const handleClick = useCallback(() => {
    setCurrentUserRole && setCurrentUserRole(role)
    setAuthModalVisible && setAuthModalVisible(true)
  }, [])
  return (
    <Button className="mb-3" type="primary" size="large" block icon={icon} onClick={handleClick}>
      {title}
    </Button>
  )
}

export default HomePage
