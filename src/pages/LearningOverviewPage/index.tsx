import Icon, { RadarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Card, Statistic } from 'antd'
import gql from 'graphql-tag'
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
import LearningDualChart from './LearningDualChart'
import LearningHeatmap from './LearningHeatmap'
import LearningRadar from './LearningRadar'
import ProgressFunnel from './ProgressFunnel'

const LearningOverviewPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId, enabledModules } = useApp()
  const { recentLearningCount, recentLearningDuration, programCategoryCompleteness, learningStatus } =
    useLearningReport(appId)

  const { loading, error, totalMemberCount, enrolledMemberCount, exercisedMemberCount, passedMemberCount } =
    useLearningOverview(appId)

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
            <Statistic title="近七天學習人數" value={recentLearningCount} suffix="人" />
          </Card>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="mb-3">
            <Statistic title="近七天學習時數" value={recentLearningDuration / 60 / 60} precision={0} suffix="小時" />
          </Card>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="mb-3">
            <Statistic
              title="平均完課率"
              value={(sum(programCategoryCompleteness.map(v => v.rate)) / programCategoryCompleteness.length) * 100}
              precision={2}
              suffix="%"
            />
          </Card>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="mb-3">
            <Statistic
              title="測驗通過率"
              value={(passedMemberCount / exercisedMemberCount) * 100}
              precision={2}
              suffix="%"
            />
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <Card className="mb-3" title="學習人數與平均時數">
            <LearningDualChart values={learningStatus} />
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-6">
          <Card className="mb-3" title="完課率分佈">
            <div className="mx-auto" style={{ width: '90%' }}>
              <LearningRadar value={programCategoryCompleteness} />
            </div>
          </Card>
        </div>
        <div className="col-12 col-md-6">
          <Card className="mb-3" title="學員狀況">
            <ProgressFunnel
              values={[
                { stage: '所有人數', count: totalMemberCount },
                { stage: '上課人數', count: enrolledMemberCount },
                { stage: '測驗人數', count: exercisedMemberCount },
                { stage: '通過人數', count: passedMemberCount },
              ]}
            />
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <Card className="mb-3" title="學習熱度">
            <LearningHeatmap values={learningStatus} />
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

const useLearningReport = (appId: string) => {
  const { data, loading } = useQuery<hasura.GET_LEARNING_REPORT, hasura.GET_LEARNING_REPORTVariables>(
    GET_LEARNING_REPORT,
    { variables: { appId } },
  )
  return {
    loading,
    recentLearningCount: sum(
      data?.app_learning_status
        .filter(v => moment(v.date) >= moment().startOf('day').subtract(1, 'week'))
        .map(v => v.total_count) || [],
    ),
    recentLearningDuration: sum(
      data?.app_learning_status
        .filter(v => moment(v.date) >= moment().startOf('day').subtract(1, 'week'))
        .map(v => v.total_duration || 0) || [],
    ),
    learningStatus:
      data?.app_learning_status.map(v => ({
        date: v.date,
        count: v.total_count || 0,
        duration: v.total_duration || 0,
      })) || [],
    programCategoryCompleteness:
      data?.program_category_completeness.map(v => ({
        name: v.category?.name || '',
        rate: v.rate,
      })) || [],
  }
}
const useLearningOverview = (appId: string) => {
  const { loading, error, data } = useQuery<hasura.GET_LEARNING_OVERVIEW, hasura.GET_LEARNING_OVERVIEWVariables>(
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

  return {
    loading,
    error,
    totalMemberCount: data?.learning_overview[0]?.total_member_count || 0,
    enrolledMemberCount: data?.learning_overview[0]?.enrolled_member_count || 0,
    passedMemberCount: data?.learning_overview[0]?.passed_member_count || 0,
    exercisedMemberCount: data?.learning_overview[0]?.exercised_member_count || 0,
  }
}
const GET_LEARNING_REPORT = gql`
  query GET_LEARNING_REPORT($appId: String!) {
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
`
export default LearningOverviewPage
