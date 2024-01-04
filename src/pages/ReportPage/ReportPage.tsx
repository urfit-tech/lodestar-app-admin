import { AreaChartOutlined } from '@ant-design/icons'
import { Spinner } from '@chakra-ui/spinner'
import axios from 'axios'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import { useMemberPermissionGroups } from '../../hooks/member'
import { useReport } from '../../hooks/report'
import ForbiddenPage from '../ForbiddenPage'

const ReportPage: React.FC = () => {
  const { enabledModules } = useApp()
  const { authToken, permissions, currentMemberId } = useAuth()
  const [isIframeLoading, setIframeLoading] = useState<boolean>(true)
  const { reportId } = useParams<{ reportId: string }>()
  const { report } = useReport(reportId)
  const { loading: loadingMemberPermissionGroups, memberPermissionGroups } = useMemberPermissionGroups(
    currentMemberId || '',
  )
  const { signedUrl } = useReportSignedUrlById(reportId, authToken || '')
  const startedAt = dayjs(Date.now()).add(-1, 'month').format('YYYY-MM-DD')
  const endedAt = dayjs(Date.now()).format('YYYY-MM-DD')
  const signedUrlWithFilter = `${signedUrl}?startedAt=${startedAt}&endedAt=${endedAt}#titled=false`
  const handleIframeLoad = () => setIframeLoading(false)

  if (
    !enabledModules.report ||
    (!permissions.REPORT_ADMIN && !permissions.REPORT_VIEW) ||
    (report.viewingPermissions?.length !== 0 &&
      memberPermissionGroups.filter(memberPermissionGroup =>
        report.viewingPermissions
          ?.map((viewingPermission: { id: string }) => viewingPermission.id)
          .includes(memberPermissionGroup.permission_group_id),
      ).length === 0)
  )
    return <ForbiddenPage />

  return (
    <AdminBlock style={{ height: '100vh' }}>
      {isIframeLoading || loadingMemberPermissionGroups ? (
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

export default ReportPage
