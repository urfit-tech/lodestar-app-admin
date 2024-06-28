import { Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock } from '../../components/admin'
import FileItem from '../../components/common/FileItem'
import { downloadFile, getFileDownloadableLink } from '../../helpers/index'
import { errorMessages } from '../../helpers/translation'
import { useMemberMetadataByEmailAndKey } from '../../hooks/member'

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

const StyledFileItem = styled.div`
  display: flex;
  flex-direction: column;
  p {
    width: 20%;
  }
`

const ChaileaseAdditionalInformationBlock: React.FC<{ email: string }> = ({ email }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const { loadingMember, errorMember, member } = useMemberMetadataByEmailAndKey(email, 'additionalProfile')
  const [attachmentsLink, setAttachmentsLink] = useState<{
    cardImageLink?: string
    bankBookImageLink?: string
    credentialImageLink?: string
    fileLinks?: { name: string; link: string }[]
  }>({})

  useEffect(() => {
    if (member?.metadata?.additionalProfile?.cardImageId) {
      const { additionalProfile } = member.metadata
      const getLink = async () => {
        const cardImageLink = await getFileDownloadableLink(
          `chailease/additional_form/${appId}/${additionalProfile?.cardImageId}`,
          authToken,
        )
        const bankBookImageLink = await getFileDownloadableLink(
          `chailease/additional_form/${appId}/${additionalProfile?.bankBookImageId}`,
          authToken,
        )
        const credentialImageLink = await getFileDownloadableLink(
          `chailease/additional_form/${appId}/${additionalProfile?.credentialImageId}`,
          authToken,
        )
        const fileLinks: { name: string; link: string }[] = await Promise.all(
          additionalProfile?.fileIds.map(async (fileId: string) => {
            const link = await getFileDownloadableLink(`chailease/additional_form/${appId}/${fileId}`, authToken)
            return {
              name: fileId,
              link,
            }
          }),
        )
        setAttachmentsLink({
          cardImageLink,
          bankBookImageLink,
          credentialImageLink,
          fileLinks,
        })
      }
      getLink()
    } else {
      setAttachmentsLink({})
    }
  }, [email, member?.metadata, authToken, appId])

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
    additionalProfile,
  }: {
    additionalProfile: { [key: string]: any }
  } = member.metadata
  return (
    <AdminBlock className="p-4" key={member.id}>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <StyledMemberName>{member.name}</StyledMemberName>
      </div>
      <div>
        <StyledLabel>基本資訊</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem>
            <p>Email</p>
            {member.email}
          </StyledInfoItem>
        </StyledInfoBlock>
      </div>
      <div>
        <StyledLabel>文件</StyledLabel>
        <StyledInfoBlock>
          {additionalProfile?.cardImageId && (
            <StyledInfoItem>
              <p>學生證、工作證、軍公教證</p>
              <FileItem
                fileName={`${additionalProfile.cardImageId}`}
                onDownload={() =>
                  downloadFile(`${additionalProfile.cardImageId}`, {
                    url: attachmentsLink?.cardImageLink,
                  })
                }
              />
            </StyledInfoItem>
          )}
          {additionalProfile?.credentialImageId && (
            <StyledInfoItem>
              <p>存摺封面</p>
              <FileItem
                fileName={`${additionalProfile.credentialImageId}`}
                onDownload={() =>
                  downloadFile(`${additionalProfile.credentialImageId}`, {
                    url: attachmentsLink?.credentialImageLink,
                  })
                }
              />
            </StyledInfoItem>
          )}
          {additionalProfile?.bankBookImageId && (
            <StyledInfoItem>
              <p>勞保、在職證明、在學證明、畢業證書</p>
              <FileItem
                fileName={`${additionalProfile.bankBookImageId}`}
                onDownload={() =>
                  downloadFile(`${additionalProfile.bankBookImageId}`, {
                    url: attachmentsLink?.bankBookImageLink,
                  })
                }
              />
            </StyledInfoItem>
          )}
          {attachmentsLink?.fileLinks?.length !== 0 && (
            <StyledInfoItem>
              <p>財力證明電子對帳單、交易明細</p>
              <StyledFileItem>
                {attachmentsLink?.fileLinks &&
                  attachmentsLink.fileLinks.map(fileLink => (
                    <FileItem
                      fileName={`${fileLink.name}`}
                      onDownload={() =>
                        downloadFile(`${fileLink.name}`, {
                          url: fileLink.link,
                        })
                      }
                    />
                  ))}
              </StyledFileItem>
            </StyledInfoItem>
          )}
        </StyledInfoBlock>
      </div>
      <div>
        <StyledLabel>其他資訊</StyledLabel>
        <StyledInfoBlock>
          <StyledInfoItem>
            <p>備註</p>
            {additionalProfile?.notes}
          </StyledInfoItem>
        </StyledInfoBlock>
      </div>
    </AdminBlock>
  )
}

export default ChaileaseAdditionalInformationBlock
