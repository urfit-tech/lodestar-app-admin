import { Button, Form, Modal, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { InferType } from 'yup'
import CreatorSelector from '../../containers/common/CreatorSelector'
import MemberAvatar from '../../containers/common/MemberAvatar'
import { DeleteProgramProps, UpdateProgramProps } from '../../containers/program/ProgramRoleAdminPane'
import { commonMessages } from '../../helpers/translation'
import { programSchema } from '../../schemas/program'
import AdminCard from '../admin/AdminCard'
import RoleAdminBlock from '../admin/RoleAdminBlock'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const messages = defineMessages({
  programOwner: { id: 'program.label.programOwner', defaultMessage: '課程負責人' },
})

const ProgramRoleAdminPane: React.FC<CardProps & {
  program: InferType<typeof programSchema> | null
  onProgramUpdate: UpdateProgramProps
  onProgramDelete: DeleteProgramProps
}> = ({ program, onProgramUpdate, onProgramDelete }) => {
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
          ...program.roles.map(role => ({ memberId: role.member.id || '', name: role.name || '' })),
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
              .map(role => <MemberAvatar key={role.id} memberId={role.member.id} withName />)}
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
                  name={role.member.name}
                  pictureUrl={role.member.pictureUrl}
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
            <Button type="link" icon="plus" size="small" onClick={() => setVisible(true)}>
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
              .map(role => <MemberAvatar key={role.id} memberId={role.member.id} withName />)}
        </AdminCard>
      </div>
    </div>
  )
}

export default ProgramRoleAdminPane
