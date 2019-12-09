import { Icon, Tabs } from 'antd'
import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import CheckoutProductModal from '../../components/checkout/CheckoutProductModal'
import CreatorIntroBlock from '../../components/common/CreatorIntroBlock'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { currencyFormatter } from '../../helpers'
import { usePublicMember } from '../../hooks/member'
import { ReactComponent as ArrowRight } from '../../images/default/angle-right.svg'

const StyledImage = styled.img`
  width: 114px;
  height: 70px;
  object-fit: cover;
`
const StyledTitle = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  padding-left: 20px;
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  overflow: hidden;
`
const StyledTab = styled.div`
  margin-bottom: 30px;
  border-radius: 4px;
  border: solid 1px var(--gray-light);
  height: 104px;
  padding: 16px;
  user-select: none;
  cursor: pointer;
  transition: .3s;

  &.active, &:hover {
    border: solid 1px ${props => props.theme['@primary-color']};
  }
  
  > .info {
    margin: 0;
    color: ${props => props.theme['@primary-color']};
    font-size: 14px;
    letter-spacing: 0.18px;
  }
`
const StyledScheduleTitle = styled.h3`
  display: block;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`
const StyledSnippet = styled.div`
  border-radius: 18px;
  margin-bottom: 16px;
  height: 38px;
  line-height: 38px;
  color: var(--gray-darker);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.2px;
  transition-duration: .3s;

  &:hover {
    cursor: pointer;
    background-color: ${props => props.theme['@primary-color']};
  }

  &.disable {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.2px;
    color: var(--gray);
    user-select: disabled;
    
    &:hover {
      cursor: no-drop;
      background: initial;
    }
  }
`
const StyledSection = styled.section`
  display: none;
  
  &.active {
    display: block;
  }
`
const StyledSideBarBlock = styled.div`
  padding: 20px 20px 30px;
`
const StyledLink = styled.div`
  color: ${props => props.theme['@primary-color']};
  cursor: pointer;
  user-select: none;
  transition: .5s;

  &:hover {
    opacity: .7;
  }
`
const CreatorPage: React.FC = () => {
  const { match } = useRouter<{ memberId: string }>()
  const memberId = match.params.memberId
  const { member, loadingMember: isLoading } = usePublicMember(memberId)
  const [activeService, switchActiveService] = useState(0)
  const [defaultActivekey, setDefaultActivekey] = useQueryParam('tabkey', StringParam)
  const [activeKey, setActiveKey] = useState(defaultActivekey || 'settings')

  if (!isLoading) {
    if (!member) return <Redirect to={{ pathname: `/` }} />
    if (!member.roles.includes('content-creator')) {
      return <Redirect to={{ pathname: `/members/${member.id}` }} />
    }
  }
  const services = [
    {
      title: "模擬面試",
      period: 30,
      price: 600,
      schedules: [
        {
          date: "2019-11-30(四) ",
          sessions: [
            { startedAt: "13:00", state: 'onsale' },
            { startedAt: "13:30", state: 'sold' },
            { startedAt: "14:00", state: 'sold' },
            { startedAt: "15:00", state: 'onsale' },
            { startedAt: "15:00", state: 'onsale' },
            { startedAt: "15:00", state: 'onsale' },
            { startedAt: "15:00", state: 'onsale' },
            { startedAt: "15:00", state: 'onsale' },
            { startedAt: "15:00", state: 'onsale' },
          ]
        },
        {
          date: "2019-11-31(五) ",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        },
        {
          date: "new Date3",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        }
      ]
    },
    {
      title: "模擬面試",
      period: 30,
      price: 600,
      schedules: [
        {
          date: "new Date4",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        },
        {
          date: "new Date5",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        },
        {
          date: "new Date6",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        }
      ]
    },
    {
      title: "模擬面試",
      period: 30,
      price: 600,
      schedules: [
        {
          date: "new Date7",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        },
        {
          date: "new Date8",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        },
        {
          date: "new Date9",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        }
      ]
    },
    {
      title: "模擬面試",
      period: 30,
      price: 600,
      schedules: [
        {
          date: "new Date",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        },
        {
          date: "new Date",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        },
        {
          date: "new Date",
          sessions: [
            { startedAt: "new Date", state: 'onsale' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'sold' },
            { startedAt: "new Date", state: 'onsale' }
          ]
        }
      ]
    },
  ]
  const programs = [
    {
      featureUrl: "https://fakeimg.pl/250x100/",
      title: "扭轉直覺偏誤"
    },
    {
      featureUrl: "https://fakeimg.pl/666x333/",
      title: "扭轉直覺偏誤，發現世界扭轉直覺偏誤，發現世界扭轉直覺偏誤，發現世界扭轉直覺偏誤，發現世界扭轉直覺偏誤，發現世界扭轉直覺偏誤，發現世界扭轉直覺偏誤，發現世界"
    },
    {
      featureUrl: "https://fakeimg.pl/333x1000/",
      title: "扭轉直覺偏誤，發現世界"
    },
  ]
  return <DefaultLayout white>
    {member &&
      <CreatorIntroBlock
        avatarUrl={member.pictureUrl}
        title={member.name || "title title title title title title title title"}
        subTitle="subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle subtitle"
        description={member.description || "description description description description description description description description description description description description description description description description description description description description"}
      />
    }
    <div className="container">
      <Tabs
        defaultActiveKey="programs"
        activeKey={activeKey}
        onChange={key => {
          setActiveKey(key)
          setDefaultActivekey(key)
        }}>
        <Tabs.TabPane tab="開設課程" key="programs">
          開設課程
        </Tabs.TabPane>
        <Tabs.TabPane tab="廣播頻道" key="podcasts">
          廣播頻道
        </Tabs.TabPane>
        <Tabs.TabPane tab="預約時段" key="reservations">
          <div className="row">
            <div className="col-lg-8 col-12">
              <div className="row">
                {services.map((service, i) =>
                  <>
                    <div className="col-lg-4 col-6">
                      <StyledTab
                        key={i}
                        className={`d-flex flex-column justify-content-between ${activeService === i && "active"}`}
                        onClick={() => switchActiveService(i)}
                      >
                        <div>{service.title}</div>
                        <div className="info">每 {service.period} 分鐘 {currencyFormatter(service.price)}</div>
                      </StyledTab>
                    </div>
                  </>
                )}
              </div>
              {services.map((service, i) =>
                <StyledSection key={i} className={`${activeService === i && 'active'}`}>
                  {service.schedules.map(schedule =>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <StyledScheduleTitle>{schedule.date}</StyledScheduleTitle>
                        <div className="row">
                          {schedule.sessions.map(session =>
                            <div className="col-3 col-lg-2">
                              <CheckoutProductModal
                                type="perpetual"
                                productId={`ReservationServicePlan_`}
                                requiredFields={['name', 'email', 'phone']}
                                renderTrigger={({ setVisible }) => (
                                  <StyledSnippet
                                    className={`${session.state === 'sold' && "disable"}`}
                                    onClick={() => setVisible(true)}
                                  >{session.startedAt}</StyledSnippet>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </StyledSection>
              )}
            </div>
            <div className="col-lg-4 col-12">
              <StyledSideBarBlock>
                <h4>開設課程</h4>
                {programs.map(program => <div className="d-flex align-items-center mb-3">
                  <StyledImage src={program.featureUrl} alt={program.title} />
                  <StyledTitle>{program.title}</StyledTitle>
                </div>)}
                <StyledLink onClick={() => {
                  setActiveKey("programs")
                  setDefaultActivekey("programs")
                }}>
                  瀏覽全部
                  <Icon component={() => <ArrowRight />} className="ml-2" />
                </StyledLink>
              </StyledSideBarBlock>
              <StyledSideBarBlock>
                <h4>廣播頻道</h4>
                {programs.map(program => <div className="d-flex align-items-center mb-3">
                  <StyledImage src={program.featureUrl} alt={program.title} />
                  <StyledTitle>{program.title}</StyledTitle>
                </div>)}
                <StyledLink onClick={() => {
                  setActiveKey("podcasts")
                  setDefaultActivekey("podcasts")
                }}>
                  瀏覽全部
                  <Icon component={() => <ArrowRight />} className="ml-2" />
                </StyledLink>
              </StyledSideBarBlock>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </DefaultLayout>
}

export default CreatorPage
