import { Button, Divider, Skeleton } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock } from '../../components/admin'
import FileItem from '../../components/common/FileItem'
import { downloadFile, getFileDownloadableLink } from '../../helpers/index'
import { commonMessages, errorMessages, salesMessages } from '../../helpers/translation'
import { useMemberMetadataByEmailAndKey } from '../../hooks/member'
import ChaileaseApplyModal from './ChaileaseApplyModal'
import MemberDataAdminModal from './MemberDataAdminModal'

const StyledMemberName = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledLabel = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
  margin-bottom: 1rem;
  letter-spacing: 0.2px;
`
const StyledIdImage = styled.img`
  height: 200px;
  border-radius: 5px;
`
const StyledInfoBlock = styled.div`
  padding-left: 15px;
  margin-bottom: 1rem;
`
const StyledInfoItem = styled.div`
  display: flex;
  p {
    width: 20%;
  }
`
const StyledChaileaseRecordBlock = styled.div`
  border: 1px solid var(--gray);
  padding: 15px;
  margin-bottom: 1rem;
`
const StyledChaileaseRecordTag = styled.span<{ variant?: 'SUCCESS' | 'FAILED' }>`
  color: ${props =>
    props.variant === 'SUCCESS' ? 'var(--success);' : props.variant === 'FAILED' ? 'var(--error);' : 'var(--warning)'};
`

const ChaileaseInformationBlock: React.FC<{ email: string }> = ({ email }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const [attachmentsLink, setAttachmentsLink] = useState<{
    idImageFront?: string
    idImageBack?: string
    ownSignature?: string
    contactSignature?: string
  }>({})
  const { loadingMember, errorMember, member, refetchMember } = useMemberMetadataByEmailAndKey(email, 'profile')

  useEffect(() => {
    if (member?.metadata?.profile?.imageId) {
      const { profile } = member.metadata
      const getLink = async () => {
        const frontIdImageLink = await getFileDownloadableLink(`chailease/${profile?.imageId}-01`, authToken)
        const backIdImageLink = await getFileDownloadableLink(`chailease/${profile?.imageId}-02`, authToken)
        const ownSignatureLink = await getFileDownloadableLink(`chailease/${profile?.imageId}-03`, authToken)
        const contactSignatureLink = await getFileDownloadableLink(`chailease/${profile?.imageId}-04`, authToken)
        setAttachmentsLink({
          idImageFront: frontIdImageLink,
          idImageBack: backIdImageLink,
          ownSignature: ownSignatureLink,
          contactSignature: contactSignatureLink,
        })
      }
      getLink()
    } else {
      setAttachmentsLink({})
    }
  }, [email, member?.metadata, authToken])
  if (loadingMember) {
    return <Skeleton active />
  }
  if (errorMember) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }
  if (!member) {
    return <div>查無資料</div>
  }
  const {
    chailease,
    profile,
  }: {
    chailease: { orderId: string; productName: string; infoReserve: { [key: string]: any }; status?: string }[]
    profile: { [key: string]: any }
  } = member.metadata

  return (
    <AdminBlock className="p-4" key={member.id}>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <StyledMemberName>{member.name}</StyledMemberName>
        <div>
          <MemberDataAdminModal
            memberId={member.id}
            profile={profile}
            renderTrigger={({ setVisible }) => (
              <Button className="mr-2" onClick={() => setVisible(true)}>
                {formatMessage(commonMessages.ui.edit)}
              </Button>
            )}
            onSuccess={refetchMember}
          />
          <ChaileaseApplyModal
            memberId={member.id}
            email={member.email}
            createdAt={member.createdAt}
            idNumber={profile?.idNumber || ''}
            chailease={chailease || []}
            renderTrigger={({ setVisible }) => (
              <Button onClick={() => setVisible(true)}>{formatMessage(salesMessages.chaileaseApply)}</Button>
            )}
            onSuccess={refetchMember}
          />
        </div>
      </div>
      <div>
        {chailease?.map(order => (
          <StyledChaileaseRecordBlock
            className="d-flex justify-content-between align-items-center"
            key={order?.orderId}
          >
            <div className="col-2">{order?.productName}</div>
            <StyledChaileaseRecordTag variant={order?.status as 'SUCCESS' | 'FAILED'}>
              {order?.status === 'SUCCESS' ? '審核成功' : order.status === 'FAILED' ? '審核失敗' : '待提交/審核中'}
            </StyledChaileaseRecordTag>
            <div>
              連結失效時間：
              {order?.infoReserve?.expire_date}
            </div>
            {moment() <= moment(order?.infoReserve?.expire_date) ? (
              <Button className="mr-1" onClick={() => window.open(order?.infoReserve?.payment_url_web)}>
                融資連結
              </Button>
            ) : (
              <Button className="mr-1" disabled>
                連結失效
              </Button>
            )}
          </StyledChaileaseRecordBlock>
        ))}
      </div>
      <Divider />
      <div>
        <StyledLabel>基本資訊</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem className="align-items-center mb-2">
            <p>身分證（ 正 / 反 ）</p>
            <StyledIdImage src={attachmentsLink.idImageFront} alt="" className="mr-4" />
            <StyledIdImage src={attachmentsLink.idImageBack} alt="" />
          </StyledInfoItem>
          <StyledInfoItem>
            <p>Email</p>
            {member.email}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>身分證字號</p>
            {profile?.idNumber}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>手機</p>
            {profile?.phone}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>婚姻狀況</p>
            {profile.marriage}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>生日</p>
            {profile?.birthday && moment(profile.birthday).format('YYYY-MM-DD')}
          </StyledInfoItem>
        </StyledInfoBlock>
      </div>
      <div>
        <StyledLabel>地址資訊</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem>
            <p>戶籍地址</p>
            {profile?.residence?.address}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>住家地址</p>
            {profile?.home?.address}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>住家電話</p>
            {profile?.home?.phone}
          </StyledInfoItem>
        </StyledInfoBlock>
      </div>
      <div>
        <StyledLabel>就業資訊</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem>
            <p>就業狀況</p>
            {profile?.company?.status}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>公司名稱</p>
            {profile?.company?.name}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>公司電話</p>
            {profile?.company?.phone}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>工作電話</p>
            {profile?.company?.telephone}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>學校名稱</p>
            {profile?.school?.name}
          </StyledInfoItem>
        </StyledInfoBlock>
      </div>
      <div>
        <StyledLabel>信用卡資訊</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem>
            <p>信用卡狀態</p>
            {profile?.creditCard?.own}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>發卡銀行</p>
            {profile?.creditCard?.bank}
          </StyledInfoItem>
        </StyledInfoBlock>
      </div>
      <div>
        <StyledLabel>聯絡人資訊</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem>
            <p>聯絡人姓名</p>
            {profile?.contact?.name}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>聯絡人關係</p>
            {profile?.contact?.relationship}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>聯絡人電話</p>
            {profile?.contact?.phone}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>聯絡人身分證字號</p>
            {profile?.contact?.idNumber}
          </StyledInfoItem>
        </StyledInfoBlock>
      </div>
      <div>
        <StyledLabel>親簽文件</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem>
            <p>本人親簽</p>
            {profile?.signature?.own && (
              <FileItem
                fileName={`${profile?.signature?.own}`}
                onDownload={() =>
                  downloadFile(`${profile?.signature?.own}`, {
                    url: attachmentsLink.ownSignature,
                  })
                }
              />
            )}
          </StyledInfoItem>
          {profile?.signature?.contact && (
            <StyledInfoItem>
              <p>聯絡人親簽</p>
              <FileItem
                fileName={`${profile?.signature?.contact}`}
                onDownload={() =>
                  downloadFile(`${profile?.signature?.contact}`, {
                    url: attachmentsLink.contactSignature,
                  })
                }
              />
            </StyledInfoItem>
          )}
        </StyledInfoBlock>
      </div>
      <div>
        <StyledLabel>帳單資訊</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem>
            <p>寄送地址</p>
            {profile?.bill?.address}
          </StyledInfoItem>
          <StyledInfoItem>
            <p>Email</p>
            {profile?.bill?.email}
          </StyledInfoItem>
        </StyledInfoBlock>
      </div>
    </AdminBlock>
  )
}

export default ChaileaseInformationBlock
