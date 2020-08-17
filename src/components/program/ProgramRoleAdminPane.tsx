import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Modal, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { DeleteProgramProps, UpdateProgramProps } from '../../containers/program/ProgramRoleAdminPane'
import { notEmpty } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ProgramAdminProps } from '../../types/program'
import AdminCard from '../admin/AdminCard'
import RoleAdminBlock from '../admin/RoleAdminBlock'
import CreatorSelector from '../common/CreatorSelector'
import MemberAvatar from '../common/MemberAvatar'

const messages = defineMessages({
  programOwner: { id: 'program.label.programOwner', defaultMessage: '課程負責人' },
})

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const ProgramRoleAdminPane: React.FC<
  CardProps & {
    program: ProgramAdminProps | null
    onProgramUpdate: UpdateProgramProps
    onProgramDelete: DeleteProgramProps
  }
> = ({ program, onProgramUpdate, onProgramDelete }) => {
  const { formatMessage } = useIntl()
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
          ...program.roles
            .filter(role => notEmpty(role?.member?.id))
            .map(role => ({ memberId: role?.member?.id || '', name: role.name || '' })),
          { memberId: selectedMemberId, name: 'instructor' },
        ],
      },
    })
  }
  return (
    <div className="container py-3">
      <Typography.Title className="pb-3" level={3}>
        {formatMessage(commonMessages.label.roleAdmin)}
      </Typography.Title>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>{formatMessage(messages.programOwner)}</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'owner')
              .map(role => <MemberAvatar key={role.id} size="32px" memberId={role?.member?.id || ''} withName />)}
        </AdminCard>
      </div>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>{formatMessage(commonMessages.term.instructor)}</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'instructor')
              .map(role => (
                <RoleAdminBlock
                  key={role.id}
                  name={role?.member?.name || ''}
                  pictureUrl={role?.member?.pictureUrl || ''}
                  onDelete={() => {
                    onProgramDelete({
                      data: {
                        programId: program ? program.id : '',
                      },
                    })
                  }}
                />
              ))}
          {program && !program.roles.find(role => role.name === 'instructor') && (
            <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => setVisible(true)}>
              {formatMessage(commonMessages.ui.addInstructor)}
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
            <StyledModalTitle>{formatMessage(commonMessages.ui.addInstructor)}</StyledModalTitle>

            <Form
              hideRequiredMark
              colon={false}
              onSubmit={e => {
                e.preventDefault()
                handleSubmit()
              }}
            >
              <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
                <CreatorSelector value={selectedMemberId || ''} onChange={value => setSelectedMemberId(value)} />
              </Form.Item>
              <Form.Item className="text-right">
                <Button onClick={() => setVisible(false)} className="mr-2">
                  {formatMessage(commonMessages.ui.cancel)}
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {formatMessage(commonMessages.ui.add)}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </AdminCard>
      </div>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>{formatMessage(commonMessages.term.teachingAssistant)}</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'assistant')
              .map(role => <MemberAvatar key={role.id} size="32px" memberId={role?.member?.id || ''} withName />)}
        </AdminCard>
      </div>
    </div>
  )
}

export default ProgramRoleAdminPane
