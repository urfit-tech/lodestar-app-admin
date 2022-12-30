import Icon, { RadarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Card, Statistic } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import { sum, uniq } from 'ramda'
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
  const {
    recentLearningCount,
    recentLearningDuration,
    programCategoryCompleteness,
    learningStatus,
    passedMemberCount,
    exercisedMemberCount,
    totalMemberCount,
    enrolledMemberCount,
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
              value={(passedMemberCount.length / exercisedMemberCount.length) * 100}
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
                { stage: '測驗人數', count: exercisedMemberCount.length },
                { stage: '通過人數', count: passedMemberCount.length },
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
    totalMemberCount: data?.total_member.aggregate?.count || 0,
    enrolledMemberCount: data?.total_enrolled_member.aggregate?.count || 0,
    passedMemberCount: uniq(
      data?.exercise
        .filter(v => {
          const gainedScore = sum(v.answer.map((ans: { gainedScore: number }) => ans.gainedScore))
          return gainedScore >= v.program_content.metadata?.passingScore
        })
        .map(v => v.member_id) || [],
    ),
    exercisedMemberCount: uniq(data?.exercise.map(v => v.member_id) || []),
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
const GET_LEARNING_REPORT = gql`
  query GET_LEARNING_REPORT($appId: String!) {
    total_member: member_aggregate(where: { app_id: { _eq: $appId } }) {
      aggregate {
        count
      }
    }
    total_enrolled_member: member_aggregate(
      where: { app_id: { _eq: $appId }, order_logs: { order_products: { product_id: { _like: "Program%" } } } }
    ) {
      aggregate {
        count
      }
    }
    exercise(where: { member: { app_id: { _eq: $appId } } }) {
      answer
      member_id
      program_content {
        metadata
      }
    }
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
