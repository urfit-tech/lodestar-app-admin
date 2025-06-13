import { AreaChartOutlined } from '@ant-design/icons'
import { Spinner } from '@chakra-ui/spinner'
import { InputNumber } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import { useMemberPermissionGroups } from '../../hooks/member'
import { useReport } from '../../hooks/report'
import ForbiddenPage from '../ForbiddenPage'
import pageMessages from '../translation'

const StyledReportHeightBlock = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`
const StyledReportHeightText = styled.div`
  font-size: 16px;
  margin-right: 8px;
`

const ReportPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules, settings } = useApp()
  const { authToken, permissions, currentMemberId } = useAuth()
  const [isIframeLoading, setIframeLoading] = useState<boolean>(true)
  const iframeHeightSetting = Number(settings['report.iframe_height']) || 600
  const [iframeHeight, setIframeHeight] = useState(iframeHeightSetting)
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
      ).length === 0 &&
      !permissions.REPORT_ADMIN)
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
          {settings['report.resizable'] === '1' && (
            <StyledReportHeightBlock>
              <StyledReportHeightText>{formatMessage(pageMessages.ReportPage.reportHeight)}</StyledReportHeightText>
              <InputNumber
                size="middle"
                value={iframeHeight}
                onChange={e => {
                  setIframeHeight(Number(e))
                }}
              />
              <span>px</span>
            </StyledReportHeightBlock>
          )}
        </>
      )}
      <iframe
        title="question"
        src={signedUrlWithFilter}
        width="100%"
        height={`${iframeHeight}px`}
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
