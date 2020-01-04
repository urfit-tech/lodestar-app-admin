import { Button, Form, Modal, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import React, { useState } from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import CreatorSelector from '../../containers/common/CreatorSelector'
import { DeleteProgramProps, UpdateProgramProps } from '../../containers/program/ProgramRoleAdminPane'
import { programSchema } from '../../schemas/program'
import AdminCard from '../admin/AdminCard'
import MemberAvatar from '../common/MemberAvatar'
import { InstructorBlock } from '../podcast/PodcastProgramRoleAdminBlock'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

type ProgramRoleAdminPaneProps = CardProps & {
  program: InferType<typeof programSchema> | null
  onProgramUpdate: UpdateProgramProps
  onProgramDelete: DeleteProgramProps
}
const ProgramRoleAdminPane: React.FC<ProgramRoleAdminPaneProps> = ({ program, onProgramUpdate, onProgramDelete }) => {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!selectedMemberId) {
      return
    }

    if (!program) {
      return
    }

    if (!program.roles) {
      return
    }

    onProgramUpdate({
      onSuccess: () => {
        setSelectedMemberId(null)
        setLoading(false)
        setVisible(false)
      },
      data: {
        programId: program ? program.id : '',
        instructorIds: [
          ...program.roles.map(role => ({ memberId: role.memberId || '', name: role.name || '' })),
          { memberId: selectedMemberId, name: 'instructor' },
        ],
      },
    })
  }
  return (
    <div className="container py-3">
      <Typography.Title className="pb-3" level={3}>
        身份管理
      </Typography.Title>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>課程負責人</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'owner')
              .map(role => <MemberAvatar key={role.id} memberId={role.memberId} withName />)}
        </AdminCard>
      </div>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>講師</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'instructor')
              .map(role => (
                <InstructorBlock
                  key={role.id}
                  memberId={role.memberId}
                  onClick={() => {
                    onProgramDelete({
                      data: {
                        programId: program ? program.id : '',
                      },
                    })
                  }}
                />
              ))}
          {program && !program.roles.find(role => role.name === 'instructor') && (
            <Button type="link" icon="plus" size="small" onClick={() => setVisible(true)}>
              新增講師
            </Button>
          )}

          <Modal
            title={null}
            footer={null}
            centered
            destroyOnClose
            visible={visible}
            onCancel={() => setVisible(false)}
          >
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
                <CreatorSelector
                  value={selectedMemberId || ''}
                  variant="single"
                  onChange={value => setSelectedMemberId(value)}
                />
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
        </AdminCard>
      </div>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>助教</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'assistant')
              .map(role => <MemberAvatar key={role.id} memberId={role.memberId} withName />)}
        </AdminCard>
      </div>
    </div>
  )
}

export default ProgramRoleAdminPane
