import { useQuery } from '@apollo/react-hooks'
import { Card, Icon, List, Statistic, Tag, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useAuth } from '../../../components/auth/AuthContext'
import AdminCard from '../../../components/common/AdminCard'
import MemberAdminLayout from '../../../components/layout/MemberAdminLayout'
import { dateFormatter } from '../../../helpers'
import { useApp } from '../../../hooks/data'
import { useMemberPoint } from '../../../hooks/member'
import { ReactComponent as PointIcon } from '../../../images/default/point.svg'
import types from '../../../types'

const MemberPointSummarySection: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { app } = useApp()
  const { numPoints } = useMemberPoint(memberId)

  return (
    <div className="row no-gutters mb-3">
      <div className="col-12 col-sm-6">
        <Card>
          <Statistic title="目前擁有" value={numPoints} suffix="點" />
        </Card>
      </div>
      <div className="col-12 col-sm-6">
        <Card>
          <Statistic title="點數價值" value={app ? app.pointExchangeRate * numPoints : 0} precision={0} suffix="元" />
        </Card>
      </div>
    </div>
  )
}
const PointHistoryAdminPage = () => {
  const limit = undefined
  const [noMoreData, setNoMoreData] = useState()
  const { currentMemberId } = useAuth()
  const { loading, data, fetchMore } = useQuery<types.GET_POINT_HISTORY, types.GET_POINT_HISTORYVariables>(
    GET_POINT_HISTORY,
    {
      variables: { memberId: currentMemberId || '', offset: 0, limit },
    },
  )

  // const loadMore = !noMoreData ? (
  //   <div
  //     style={{
  //       textAlign: "center",
  //       marginTop: 12,
  //       height: 32,
  //       lineHeight: "32px"
  //     }}
  //   >
  //     <Button
  //       onClick={() =>
  //         fetchMore({
  //           variables: { offset: data.point_log.length },
  //           updateQuery: (prev, { fetchMoreResult }) => {
  //             if (
  //               !fetchMoreResult ||
  //               fetchMoreResult.point_log.length < limit
  //             ) {
  //               setNoMoreData(true);
  //             }
  //             return fetchMoreResult
  //               ? {
  //                   ...prev,
  //                   point_log: [...prev.point_log, ...fetchMoreResult.point_log]
  //                 }
  //               : prev;
  //           }
  //         })
  //       }
  //     >
  //       載入更多
  //     </Button>
  //   </div>
  // ) : null;

  return (
    <MemberAdminLayout>
      <Typography.Title className="mb-4" level={3}>
        <Icon component={() => <PointIcon />} className="mr-3" />
        <span>點數紀錄</span>
      </Typography.Title>

      {currentMemberId && <MemberPointSummarySection memberId={currentMemberId} />}

      <AdminCard>
        <List
          loading={loading}
          itemLayout="horizontal"
          // loadMore={loadMore}
          dataSource={(data && data.point_log) || []}
          renderItem={(item: any) => (
            <List.Item actions={[<Tag>{item.point}點</Tag>]}>
              <List.Item.Meta title={dateFormatter(item.created_at)} />
              <div>{item.description}</div>
            </List.Item>
          )}
        />
      </AdminCard>
    </MemberAdminLayout>
  )
}

const GET_POINT_HISTORY = gql`
  query GET_POINT_HISTORY($memberId: String!, $offset: Int, $limit: Int) {
    point_log(where: { member_id: { _eq: $memberId } }, offset: $offset, limit: $limit) {
      id
      created_at
      description
      point
    }
  }
`

export default PointHistoryAdminPage
