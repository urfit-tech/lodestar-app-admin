import { Button, Form, Icon, Modal } from 'antd'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import CreatorSelector from '../../containers/common/CreatorSelector'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { AvatarImage } from '../common/Image'
import { StyledAdminBlock, StyledAdminBlockTitle, StyledAdminPaneTitle } from './PodcastProgramAdminBlock'

const StyledSubTitle = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
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
        setLoading(false)
        setVisible(false)
      },
      data: {
        instructorIds: [...podcastProgramAdmin.instructors.map(instructor => instructor.id), selectedMemberId],
      },
    })
  }

  return (
    <div className="container py-5">
      <StyledAdminPaneTitle>身份管理</StyledAdminPaneTitle>

      <StyledAdminBlock>
        <StyledAdminBlockTitle className="mb-4">建立者</StyledAdminBlockTitle>

        <div className="d-flex align-items-center justify-content-center">
          <AvatarImage src={podcastProgramAdmin.owner.avatarUrl} size={36} className="mr-3" />
          <StyledName className="flex-grow-1">{podcastProgramAdmin.owner.name}</StyledName>
        </div>
      </StyledAdminBlock>

      <StyledAdminBlock>
        <StyledAdminBlockTitle className="mb-4">講師</StyledAdminBlockTitle>
        {/* <StyledSubTitle className="mb-4">最多設定三位講師</StyledSubTitle> */}

        {podcastProgramAdmin.instructors.map(instructor => (
          <StyledInstructorBlock key={instructor.id} className="d-flex align-items-center justify-content-center">
            <AvatarImage src={podcastProgramAdmin.owner.avatarUrl} size={36} className="mr-3" />
            <StyledName className="flex-grow-1">{podcastProgramAdmin.owner.name}</StyledName>
            <Icon
              type="delete"
              onClick={() =>
                updatePodcastProgram({
                  data: {
                    instructorIds: podcastProgramAdmin.instructors.filter(v => v.id !== instructor.id).map(v => v.id),
                  },
                })
              }
            />
          </StyledInstructorBlock>
        ))}

        {podcastProgramAdmin.instructors.length < 1 && (
          <Button type="link" icon="plus" size="small" onClick={() => setVisible(true)}>
            新增講師
          </Button>
        )}
      </StyledAdminBlock>

      <Modal title={null} footer={null} centered destroyOnClose visible={visible} onCancel={() => setVisible(false)}>
        <StyledModalTitle>新增講師</StyledModalTitle>

        <Form
          hideRequiredMark
          colon={false}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
            setSelectedMemberId(null)
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

export default PodcastProgramRoleAdminBlock
