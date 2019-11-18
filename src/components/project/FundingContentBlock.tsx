import { Affix, Badge, Button, Tabs } from 'antd'
import React, { useContext, useRef, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { BREAK_POINT } from '../common/Responsive'
import FundingCommentsPane from './FundingCommentsPane'
import FundingContentsPane from './FundingContentsPane'
import FundingCoverBlock from './FundingCoverBlock'
import FundingIntroductionPane from './FundingIntroductionPane'
import FundingPlansPane from './FundingPlansPane'
import FundingSummaryBlock from './FundingSummaryBlock'
import FundingUpdatesPane from './FundingUpdatesPane'
import { ProjectContentProps } from './ProjectContent'

const StyledCover = styled.div`
  padding-top: 2.5rem;
`
const StyledTabs = styled(Tabs)`
  .ant-tabs-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin: 0;
    border: 0;

    .ant-tabs-extra-content {
      float: none !important;
      order: 1;
      padding-left: 18px;
      width: 33.333333%;
    }

    .ant-tabs-tab.ant-tabs-tab {
      padding: 1.5rem 1rem;
    }
  }
  .ant-tabs-content {
    padding-top: 2.5rem;
  }
`
const StyledSupportButtonWrapper = styled.div`
  @media (max-width: ${BREAK_POINT - 1}px) {
    z-index: 1000;
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 1rem 0.75rem;
    background: white;
  }
`
const StyledTabBarWrapper = styled.div`
  border-bottom: 1px solid #e8e8e8;
  background: white;
`

const FundingContentBlock: React.FC<ProjectContentProps> = ({
  id,
  type,
  expiredAt,
  coverType,
  coverUrl,
  title,
  abstract,
  targetAmount,
  introduction,
  contents,
  updates,
  comments,
  projectPlans,
}) => {
  const theme = useContext(ThemeContext)
  const [defaultTabKey, setDefaultTabKey] = useQueryParam('tabkey', StringParam)
  const [activeKey, setActiveKey] = useState(defaultTabKey || 'introduction')
  const tabRef = useRef<HTMLDivElement>(null)

  const handleTabsChange = (activeKey: string) => {
    if (tabRef.current) {
      tabRef.current.scrollIntoView()
    }

    setDefaultTabKey(activeKey)
    setActiveKey(activeKey)
  }

  return (
    <>
      <StyledCover className="container mb-4">
        <div className="row">
          <div className="col-12 col-lg-8">
            <FundingCoverBlock coverType={coverType} coverUrl={coverUrl} />
          </div>
          <div className="col-12 col-lg-4">
            <FundingSummaryBlock
              projectId={id}
              title={title}
              abstract={abstract}
              targetAmount={targetAmount}
              expiredAt={expiredAt}
              type={type}
            />
          </div>
        </div>
      </StyledCover>

      <div ref={tabRef}>
        <StyledTabs
          activeKey={activeKey}
          onChange={handleTabsChange}
          size="large"
          tabBarExtraContent={
            <StyledSupportButtonWrapper>
              {expiredAt && expiredAt.getTime() < Date.now() ? (
                <Button size="large" block disabled>
                  專案已結束
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => {
                    handleTabsChange('plans')
                  }}
                >
                  支持專案
                </Button>
              )}
            </StyledSupportButtonWrapper>
          }
          renderTabBar={(props, DefaultTabBar) => {
            const TabBar = DefaultTabBar
            return (
              <Affix target={() => document.getElementById('layout-content')}>
                <StyledTabBarWrapper>
                  <div className="container">
                    <TabBar {...props} />
                  </div>
                </StyledTabBarWrapper>
              </Affix>
            )
          }}
        >
          <Tabs.TabPane tab="計畫內容" key="introduction">
            <FundingIntroductionPane introduction={introduction} projectPlans={projectPlans} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="課程章節" key="contents">
            <FundingContentsPane contents={contents} projectPlans={projectPlans} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <Badge
                count={updates.length}
                style={{ background: 'none', color: theme['@primary-color'], top: '-6px', right: '-6px' }}
              >
                計畫更新
              </Badge>
            }
            key="updates"
          >
            <FundingUpdatesPane updates={updates} projectPlans={projectPlans} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="學員推薦" key="comments">
            <FundingCommentsPane comments={comments} projectPlans={projectPlans} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="方案項目" key="plans">
            <FundingPlansPane projectPlans={projectPlans} />
          </Tabs.TabPane>
        </StyledTabs>
      </div>
    </>
  )
}

export default FundingContentBlock
