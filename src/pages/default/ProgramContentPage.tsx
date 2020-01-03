import { Button, Layout, PageHeader } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { BREAK_POINT } from '../../components/common/Responsive'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import ProgramContentBlock from '../../components/program/ProgramContentBlock'
import ProgramContentMenu from '../../components/program/ProgramContentMenu'
import { useAuth } from '../../contexts/AuthContext'
import { useProgram } from '../../hooks/program'

const StyledPageHeader = styled(PageHeader)`
  && {
    padding: 1rem 1.5rem;
    height: 4rem;
    background: white;
  }

  .ant-page-header-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ant-page-header-heading-title,
  .ant-divider {
    display: none;
  }

  .ant-page-header-heading-extra {
    width: auto;
    padding: 0;
  }

  @media (min-width: ${BREAK_POINT}px) {
    .ant-page-header-heading-title {
      display: block;
      flex-grow: 1;
      font-size: 16px;
      line-height: 32px;
    }
  }
`
const StyledSideBar = styled.div`
  height: calc(100vh - 64px);
  overflow-y: auto;
  box-shadow: rgba(0, 0, 0, 0.1) -3px 10px 10px 0px;
`

const ProgramContentPage = () => {
  const { match, history } = useRouter<{
    programId: string
    programContentId: string
  }>()
  const { currentMemberId } = useAuth()
  const { programId, programContentId } = match.params
  const { loading: loadingProgram, program } = useProgram(programId)
  const [menuVisible, setMenuVisible] = useState(window.innerWidth >= BREAK_POINT)

  if (loadingProgram || !program || !currentMemberId) {
    return (
      <Layout>
        <StyledPageHeader
          title=""
          extra={
            <div>
              <Button type="link" size="small" icon="profile" onClick={() => window.open(`/programs/${programId}`)}>
                簡介
              </Button>
              <Button type="link" size="small" icon="unordered-list" onClick={() => setMenuVisible(!menuVisible)}>
                列表
              </Button>
            </div>
          }
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <StyledPageHeader
        title={program.title}
        onBack={() => history.push(`/members/${currentMemberId}`)}
        extra={
          <div>
            <Button type="link" size="small" icon="profile" onClick={() => window.open(`/programs/${programId}`)}>
              簡介
            </Button>
            <Button type="link" size="small" icon="unordered-list" onClick={() => setMenuVisible(!menuVisible)}>
              列表
            </Button>
          </div>
        }
      />
      <StyledLayoutContent>
        <div className="row no-gutters">
          <div className={menuVisible ? 'd-none d-lg-block col-lg-9' : 'col-12'}>
            <StyledLayoutContent>
              <ProgramContentBlock program={program} programContentId={programContentId} />
            </StyledLayoutContent>
          </div>
          <div className={menuVisible ? 'col-12 col-lg-3' : 'd-none'}>
            <StyledSideBar className="bg-white">
              <ProgramContentMenu
                program={program}
                memberId={currentMemberId}
                activeProgramContentId={programContentId}
                onSelect={() => {
                  if (window.innerWidth < BREAK_POINT) {
                    setMenuVisible(false)
                  }
                }}
              />
            </StyledSideBar>
          </div>
        </div>
      </StyledLayoutContent>
    </Layout>
  )
}

export default ProgramContentPage
