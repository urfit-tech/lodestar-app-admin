import { Button, Form, Icon, Modal } from 'antd'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import CreatorSelector from '../../containers/common/CreatorSelector'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { usePublicMember } from '../../hooks/member'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle } from '../admin'
import { AvatarImage } from '../common/Image'

const StyledName = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledInstructorBlock = styled.div`
  margin-bottom: 0.75rem;
  padding: 1.25rem;
  border-radius: 4px;
  background-color: var(--gray-lighter);

  :last-child {
    margin-bottom: 2rem;
  }
`
const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const PodcastProgramRoleAdminBlock: React.FC = () => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)
  const { member: creator } = usePublicMember(podcastProgramAdmin.creatorId)

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!selectedMemberId) {
      return
    }

    setLoading(true)

    updatePodcastProgram({
      onSuccess: () => {
        setSelectedMemberId(null)
        setLoading(false)
        setVisible(false)
      },
      data: {
        instructorIds: [...podcastProgramAdmin.instructorIds, selectedMemberId],
      },
    })
  }

  return (
    <div className="container py-5">
      <AdminPaneTitle>身份管理</AdminPaneTitle>

      <AdminBlock>
        <AdminBlockTitle className="mb-4">建立者</AdminBlockTitle>

        {!!creator && (
          <div className="d-flex align-items-center justify-content-center">
            <AvatarImage src={creator.pictureUrl} size={36} className="mr-3" />
            <StyledName className="flex-grow-1">{creator.name}</StyledName>
          </div>
        )}
      </AdminBlock>

      <AdminBlock>
        <AdminBlockTitle className="mb-4">講師</AdminBlockTitle>
        {/* <StyledSubTitle className="mb-4">最多設定三位講師</StyledSubTitle> */}

        {podcastProgramAdmin.instructorIds.map(instructorId => (
          <InstructorBlock
            key={instructorId}
            memberId={instructorId}
            onClick={() =>
              updatePodcastProgram({
                data: {
                  instructorIds: podcastProgramAdmin.instructorIds.filter(v => v !== instructorId),
                },
              })
            }
          />
        ))}

        {podcastProgramAdmin.instructorIds.length < 1 && (
          <Button type="link" icon="plus" size="small" onClick={() => setVisible(true)}>
            新增講師
          </Button>
        )}
      </AdminBlock>

      <Modal title={null} footer={null} centered destroyOnClose visible={visible} onCancel={() => setVisible(false)}>
        <StyledModalTitle>新增講師</StyledModalTitle>

        <Form
          hideRequiredMark
          colon={false}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Form.Item label="選擇講師">
            <CreatorSelector value={selectedMemberId || ''} onChange={value => setSelectedMemberId(value)} />
          </Form.Item>
          <Form.Item className="text-right">
            <Button onClick={() => setVisible(false)} className="mr-2">
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              新增
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

const InstructorBlock: React.FC<{
  memberId: string
  onClick?: () => void
}> = ({ memberId, onClick }) => {
  const { member } = usePublicMember(memberId)

  return (
    <StyledInstructorBlock className="d-flex align-items-center justify-content-center">
      <AvatarImage src={member ? member.pictureUrl : null} size={36} className="mr-3" />
      <StyledName className="flex-grow-1">{member ? member.name : ''}</StyledName>
      <Icon type="delete" onClick={() => onClick && onClick()} />
    </StyledInstructorBlock>
  )
}

export default PodcastProgramRoleAdminBlock
