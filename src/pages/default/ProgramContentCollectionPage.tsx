import { Button, Layout, PageHeader, Spin } from 'antd'
import React from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { useAuth } from '../../components/auth/AuthContext'
import AdminCard from '../../components/common/AdminCard'
import ProgramContentMenu from '../../components/program/ProgramContentMenu'
import { useProgram } from '../../hooks/program'

const StyledPCPageHeader = styled(PageHeader)`
  && {
    padding: 10px 24px;
    height: 64px;
    background: white;
  }

  .ant-page-header-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ant-page-header-heading-title {
    display: block;
    flex-grow: 1;
    overflow: hidden;
    font-size: 16px;
    line-height: 44px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-page-header-heading-extra {
    padding: 0;
  }
`

const ProgramContentCollectionPage = () => {
  const { match, history } = useRouter<{ programId: string }>()
  const { currentMemberId } = useAuth()
  const { programId } = match.params
  const { program } = useProgram(programId)

  return (
    <Layout>
      <StyledPCPageHeader
        className="d-flex align-items-center"
        title={program && program.title}
        extra={
          <Button icon="profile" type="link" onClick={() => history.push(`/programs/${programId}`)}>
            簡介
          </Button>
        }
        onBack={() => history.push(`/members/${currentMemberId}`)}
      />
      <Layout.Content style={{ height: 'calc(100vh - 64px)', overflow: 'auto' }}>
        <div className="py-5">
          <div className="container">
            <AdminCard>
              {!program || !currentMemberId ? (
                <Spin />
              ) : (
                <ProgramContentMenu program={program} memberId={currentMemberId} />
              )}
            </AdminCard>
          </div>
        </div>
      </Layout.Content>
    </Layout>
  )
}

export default ProgramContentCollectionPage
