import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useEffect, useState } from 'react'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import { AreaChartOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import hasura from '../../hasura'
import { ReportProps } from '../../types/report'
import { Spinner } from '@chakra-ui/spinner'
import dayjs from 'dayjs'

const ReportPage: React.FC = () => {
  const { authToken } = useAuth()
  const [isIframeLoading, setIframeLoading] = useState<boolean>(true)
  const { reportId } = useParams<{ reportId: string }>()
  const { report } = useReport(reportId)
  const { signedUrl } = useReportSignedUrlById(reportId, authToken || '')
  const startedAt = dayjs(Date.now()).add(-1, 'month').format('YYYY-MM-DD')
  const endedAt = dayjs(Date.now()).add(1, 'day').format('YYYY-MM-DD')
  const signedUrlWithFilter = `${signedUrl}?startedAt=${startedAt}&endedAt=${endedAt}#titled=false`
  const handleIframeLoad = () => setIframeLoading(false)
  return (
    <AdminBlock style={{ height: '100vh' }}>
      {isIframeLoading ? (
        <Spinner />
      ) : (
        <>
          <AdminPageTitle className="mb-4">
            <AreaChartOutlined className="mr-3" />
            <span>{report.title}</span>
          </AdminPageTitle>
        </>
      )}
      <iframe
        title="question"
        src={signedUrlWithFilter}
        width="100%"
        height="600px"
        allowTransparency
        onLoad={handleIframeLoad}
        style={{ display: isIframeLoading ? 'none' : 'block' }}
      />
    </AdminBlock>
  )
}

const useReportSignedUrlById = (reportId: string, authToken: string) => {
  const [signedUrl, setSignedUrl] = useState<any>(null)
  const [error, setError] = useState<any>('')
  const [isLoading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/report/${reportId}`, {
          headers: { authorization: `Bearer ${authToken}` },
        })
        setSignedUrl(() => response.data.result)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    })()
  }, [reportId, authToken])

  return { isLoading, signedUrl, error }
}

const useReport = (reportId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_REPORT, hasura.GET_REPORTVariables>(
    gql`
      query GET_REPORT($id: uuid!) {
        report_by_pk(id: $id) {
          id
          title
          type
          options
        }
      }
    `,
    {
      variables: {
        id: reportId,
      },
    },
  )

  const report: ReportProps = {
    id: data?.report_by_pk?.id,
    title: data?.report_by_pk?.title || '',
    type: data?.report_by_pk?.type || '',
    options: data?.report_by_pk?.options || {},
  }

  return {
    report,
    loadingReport: loading,
    errorReport: error,
    refetchReport: refetch,
  }
}

export default ReportPage
