import Icon, { RadarChartOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Card, Skeleton, Statistic } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import { sum } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import ForbiddenPage from '../ForbiddenPage'
import pageMessages from '../translation'
import LearningDualChart from './LearningDualChart'
import LearningHeatmap from './LearningHeatmap'
import LearningRadar from './LearningRadar'
import ProgressFunnel from './ProgressFunnel'

const LearningOverviewPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId, enabledModules } = useApp()
  const {
    loadingLearningStatus,
    loadingLearningOverview,
    loadingProgramCategoryCompleteness,
    recentLearningCount,
    recentLearningDuration,
    programCategoryCompleteness,
    learningStatus,
    totalMemberCount,
    enrolledMemberCount,
    exercisedMemberCount,
    passedMemberCount,
  } = useLearningReport(appId)

  if (!enabledModules.learning_statistics_advanced) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <Icon className="mr-3" component={() => <RadarChartOutlined />} />
          <span>{formatMessage(commonMessages.menu.learningOverviewAdmin)}</span>
        </AdminPageTitle>
      </div>
      <div className="row">
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="mb-3">
            {loadingLearningStatus ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={formatMessage(pageMessages.LearningOverviewPage.recentLearningCount)}
                value={recentLearningCount}
                suffix="人"
              />
            )}
          </Card>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="mb-3">
            {loadingLearningStatus ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={formatMessage(pageMessages.LearningOverviewPage.recentLearningDuration)}
                value={recentLearningDuration / 60 / 60}
                precision={0}
                suffix="小時"
              />
            )}
          </Card>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="mb-3">
            {loadingProgramCategoryCompleteness ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={formatMessage(pageMessages.LearningOverviewPage.averageCompletionRate)}
                value={(sum(programCategoryCompleteness.map(v => v.rate)) / programCategoryCompleteness.length) * 100}
                precision={2}
                suffix="%"
              />
            )}
          </Card>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="mb-3">
            {loadingLearningOverview ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={formatMessage(pageMessages.LearningOverviewPage.testPassRate)}
                value={exercisedMemberCount <= 0 ? 0 : (passedMemberCount / exercisedMemberCount) * 100}
                precision={2}
                suffix="%"
              />
            )}
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <Card
            className="mb-3"
            title={formatMessage(pageMessages.LearningOverviewPage.learningCountAndAverageDuration)}
          >
            {loadingLearningStatus ? <Skeleton active /> : <LearningDualChart values={learningStatus} />}
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-6">
          <Card className="mb-3" title={formatMessage(pageMessages.LearningOverviewPage.completionRateDistribution)}>
            <div className="mx-auto" style={{ width: '90%' }}>
              {loadingProgramCategoryCompleteness ? (
                <Skeleton active />
              ) : (
                <LearningRadar value={programCategoryCompleteness} />
              )}
            </div>
          </Card>
        </div>
        <div className="col-12 col-md-6">
          <Card className="mb-3" title={formatMessage(pageMessages.LearningOverviewPage.memberStatus)}>
            {loadingLearningOverview ? (
              <Skeleton active />
            ) : (
              <ProgressFunnel
                values={[
                  { stage: '所有人數', count: totalMemberCount },
                  { stage: '上課人數', count: enrolledMemberCount },
                  { stage: '測驗人數', count: exercisedMemberCount },
                  { stage: '通過人數', count: passedMemberCount },
                ]}
              />
            )}
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <Card className="mb-3" title={formatMessage(pageMessages.LearningOverviewPage.learningHeat)}>
            {loadingLearningStatus ? <Skeleton active /> : <LearningHeatmap values={learningStatus} />}
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

const useLearningReport = (appId: string) => {
  const {
    loading: loadingLearningStatus,
    error: errorLearningStatus,
    data: dataLearningStatus,
  } = useQuery<hasura.GET_LEARNING_STATUS, hasura.GET_LEARNING_STATUSVariables>(
    gql`
      query GET_LEARNING_STATUS($appId: String!) {
        app_learning_status(where: { app_id: { _eq: $appId } }) {
          date
          total_count
          total_duration
        }
        program_category_completeness(where: { category: { app_id: { _eq: $appId } } }) {
          category {
            name
          }
          rate
        }
      }
    `,
    { variables: { appId } },
  )

  const {
    loading: loadingLearningOverview,
    error: errorLearningOverview,
    data: dataLearningOverview,
  } = useQuery<hasura.GET_LEARNING_OVERVIEW, hasura.GET_LEARNING_OVERVIEWVariables>(
    gql`
      query GET_LEARNING_OVERVIEW($appId: String!) {
        learning_overview(where: { app_id: { _eq: $appId } }) {
          app_id
          total_member_count
          enrolled_member_count
          exercised_member_count
          passed_member_count
        }
      }
    `,
    { variables: { appId } },
  )

  const {
    loading: loadingProgramCategoryCompleteness,
    error: errorProgramCategoryCompleteness,
    data: dataProgramCategoryCompleteness,
  } = useQuery<hasura.GET_PROGRAM_CATEGORY_COMPLETENESS, hasura.GET_PROGRAM_CATEGORY_COMPLETENESSVariables>(
    gql`
      query GET_PROGRAM_CATEGORY_COMPLETENESS($appId: String!) {
        program_category_completeness(where: { category: { app_id: { _eq: $appId } } }) {
          category {
            name
          }
          rate
        }
      }
    `,
    { variables: { appId } },
  )

  return {
    loadingLearningStatus,
    loadingLearningOverview,
    loadingProgramCategoryCompleteness,
    recentLearningCount: sum(
      dataLearningStatus?.app_learning_status
        .filter(v => moment(v.date) >= moment().startOf('day').subtract(30, 'day'))
        .map(v => v.total_count) || [],
    ),
    recentLearningDuration: sum(
      dataLearningStatus?.app_learning_status
        .filter(v => moment(v.date) >= moment().startOf('day').subtract(30, 'day'))
        .map(v => v.total_duration || 0) || [],
    ),
    learningStatus:
      dataLearningStatus?.app_learning_status.map(v => ({
        date: v.date,
        count: v.total_count || 0,
        duration: v.total_duration || 0,
      })) || [],
    programCategoryCompleteness:
      dataProgramCategoryCompleteness?.program_category_completeness.map(v => ({
        name: v.category?.name || '',
        rate: v.rate,
      })) || [],
    totalMemberCount: dataLearningOverview?.learning_overview[0]?.total_member_count || 0,
    enrolledMemberCount: dataLearningOverview?.learning_overview[0]?.enrolled_member_count || 0,
    passedMemberCount: dataLearningOverview?.learning_overview[0]?.passed_member_count || 0,
    exercisedMemberCount: dataLearningOverview?.learning_overview[0]?.exercised_member_count || 0,
  }
}

export default LearningOverviewPage
