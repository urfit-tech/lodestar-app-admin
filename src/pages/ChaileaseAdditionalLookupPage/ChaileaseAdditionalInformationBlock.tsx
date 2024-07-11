import { Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
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
          {additionalProfile?.card?.imageId && (
            <StyledInfoItem>
              <p>學生證、工作證、軍公教證</p>
              <FileItem
                fileName={`${additionalProfile.card.fileName}`}
                onDownload={async () => {
                  const cardImageLink = await getFileDownloadableLink(
                    `chailease/additional_form/${appId}/${additionalProfile?.card.imageId}`,
                    authToken,
                  )
                  await downloadFile(`${additionalProfile.card.fileName}`, {
                    url: cardImageLink,
                  })
                }}
              />
            </StyledInfoItem>
          )}
          {additionalProfile?.credential?.imageId && (
            <StyledInfoItem>
              <p>勞保、在職證明、在學證明、畢業證書</p>
              <FileItem
                fileName={`${additionalProfile.credential.fileName}`}
                onDownload={async () => {
                  const credentialImageLink = await getFileDownloadableLink(
                    `chailease/additional_form/${appId}/${additionalProfile?.credential.imageId}`,
                    authToken,
                  )
                  await downloadFile(`${additionalProfile.credential.fileName}`, {
                    url: credentialImageLink,
                  })
                }}
              />
            </StyledInfoItem>
          )}
          {additionalProfile?.bankBook?.imageId && (
            <StyledInfoItem>
              <p>存摺封面</p>
              <FileItem
                fileName={`${additionalProfile.bankBook.fileName}`}
                onDownload={async () => {
                  const bankBookImageLink = await getFileDownloadableLink(
                    `chailease/additional_form/${appId}/${additionalProfile?.bankBook.imageId}`,
                    authToken,
                  )
                  await downloadFile(`${additionalProfile.bankBook.fileName}`, {
                    url: bankBookImageLink,
                  })
                }}
              />
            </StyledInfoItem>
          )}
          {additionalProfile?.bankBook?.imageId && (
            <StyledInfoItem>
              <p>存摺封面</p>
              <FileItem
                fileName={`${additionalProfile.bankBook.fileName}`}
                onDownload={async () => {
                  const bankBookImageLink = await getFileDownloadableLink(
                    `chailease/additional_form/${appId}/${additionalProfile?.bankBook.imageId}`,
                    authToken,
                  )
                  await downloadFile(`${additionalProfile.bankBook.fileName}`, {
                    url: bankBookImageLink,
                  })
                }}
              />
            </StyledInfoItem>
          )}
          {additionalProfile?.fileImages.length !== 0 && (
            <StyledInfoItem>
              <p>財力證明電子對帳單、交易明細</p>
              <StyledFileItem>
                {additionalProfile.fileImages.map((fileImage: { imageId: string; fileName: string }) => (
                  <FileItem
                    fileName={`${fileImage.fileName}`}
                    onDownload={async () => {
                      const fileImageLink = await getFileDownloadableLink(
                        `chailease/additional_form/${appId}/${fileImage.imageId}`,
                        authToken,
                      )
                      await downloadFile(`${fileImage.fileName}`, {
                        url: fileImageLink,
                      })
                    }}
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
