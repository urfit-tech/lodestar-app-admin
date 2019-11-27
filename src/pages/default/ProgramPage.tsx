import { Button, Skeleton } from 'antd'
import React, { useEffect, useRef } from 'react'
import { Redirect } from 'react-router'
import { animateScroll } from 'react-scroll'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { useAuth } from '../../components/auth/AuthContext'
import Responsive, { BREAK_POINT } from '../../components/common/Responsive'
import { BraftContent } from '../../components/common/StyledBraftEditor'
import DefaultLayout from '../../components/layout/DefaultLayout'
import PerpetualProgramBanner from '../../components/program/ProgramBanner/PerpetualProgramBanner'
import SubscriptionProgramBanner from '../../components/program/ProgramBanner/SubscriptionProgramBanner'
import ProgramContentListSection from '../../components/program/ProgramContentListSection'
import ProgramInfoBlock from '../../components/program/ProgramInfoBlock'
import ProgramInstructorCollectionBlock from '../../components/program/ProgramInstructorCollectionBlock'
import ProgramPerpetualPlanCard from '../../components/program/ProgramPerpetualPlanCard'
import ProgramSubscriptionPlanSection from '../../components/program/ProgramSubscriptionPlanSection'
import { rgba } from '../../helpers'
import { useProgram } from '../../hooks/program'

const ProgramPageContent = styled.div``
const StyledIntroWrapper = styled.div`
  @media (min-width: ${BREAK_POINT}px) {
    order: 1;
    padding-left: 35px;
  }
`
const ProgramAbstract = styled.span`
  padding-right: 2px;
  padding-bottom: 2px;
  background-image: linear-gradient(
    to bottom,
    transparent 40%,
    ${props => rgba(props.theme['@primary-color'], 0.1)} 40%
  );
  background-repeat: no-repeat;
  font-size: 20px;
  font-weight: bold;
  white-space: pre-line;
`
const ProgramIntroBlock = styled.div`
  position: relative;
  padding-top: 2.5rem;
  padding-bottom: 6rem;
  background: white;

  @media (min-width: ${BREAK_POINT}px) {
    padding-top: 3.5rem;
    padding-bottom: 1rem;
  }
`
const FixedBottomBlock = styled.div`
  margin: auto;
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
`
const StyledButtonWrapper = styled.div`
  padding: 0.5rem 0.75rem;
  background: white;
`

const ProgramPage = () => {
  const { setCurrentUserRole, isAuthenticated, currentMemberId } = useAuth()
  const containerRef = useRef(null)
  const { match } = useRouter<{ programId: string }>()
  const { loading: loadingProgram, program } = useProgram(match.params.programId)

  useEffect(() => {
    isAuthenticated && setCurrentUserRole && setCurrentUserRole('general-member')
  }, [isAuthenticated, setCurrentUserRole])

  if (loadingProgram) {
    return (
      <DefaultLayout noFooter>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  if (!program || program.appId !== localStorage.getItem('kolable.app.id')) {
    return <Redirect to="/programs" />
  }
  return (
    <DefaultLayout noFooter>
      <ProgramPageContent ref={containerRef}>
        {program.isSubscription ? (
          <SubscriptionProgramBanner program={program} />
        ) : (
          <PerpetualProgramBanner program={program} />
        )}

        <ProgramIntroBlock>
          <div className="container">
            <div className="row">
              {!program.isSubscription && (
                <StyledIntroWrapper className="col-12 col-lg-4">
                  <ProgramInfoBlock program={program} />
                </StyledIntroWrapper>
              )}

              <div className="col-12 col-lg-8">
                <div className="mb-5">
                  <ProgramAbstract>{program.abstract}</ProgramAbstract>
                </div>

                <div className="mb-5">
                  <BraftContent>{program.description}</BraftContent>
                </div>

                {currentMemberId && (
                  <div className="mb-5">
                    <ProgramContentListSection
                      memberId={currentMemberId}
                      program={program}
                      trialOnly={program.isSubscription || false}
                    />
                  </div>
                )}
              </div>

              {program.isSubscription && (
                <StyledIntroWrapper className="col-12 col-lg-4" id="subscription-plans">
                  <div className="mb-5">
                    <ProgramSubscriptionPlanSection program={program} />
                  </div>
                </StyledIntroWrapper>
              )}
            </div>

            <div className="row">
              <div className="col-12 col-lg-8">
                <div className="mb-5">
                  <ProgramInstructorCollectionBlock program={program} />
                </div>
              </div>
            </div>
          </div>
        </ProgramIntroBlock>
      </ProgramPageContent>

      <Responsive.Default>
        <FixedBottomBlock>
          {program.isSubscription && (
            <StyledButtonWrapper>
              <Button
                type="primary"
                block
                onClick={() => {
                  const programBanner = document.getElementById('program-banner')
                  const subscriptionPlansElem = document.getElementById('subscription-plans')

                  programBanner &&
                    subscriptionPlansElem &&
                    animateScroll.scrollTo(programBanner.offsetHeight + subscriptionPlansElem.offsetTop, {
                      containerId: 'layout-content',
                      delay: 0,
                    })
                }}
              >
                查看訂閱方案
              </Button>
            </StyledButtonWrapper>
          )}
          {!program.isSubscription && currentMemberId && (
            <ProgramPerpetualPlanCard memberId={currentMemberId} program={program} />
          )}
        </FixedBottomBlock>
      </Responsive.Default>
    </DefaultLayout>
  )
}

export default ProgramPage
