import { gql, useQuery } from '@apollo/client'
import { Button, Form, Input, message, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMemberPropertyCollection, useMutateMemberNote, useMutateMemberProperty, useProperty } from '../../hooks/member'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

const messages = defineMessages({
  presentCall: { id: 'memberMessages.label.presentCall', defaultMessage: '本次通話' },
  studentInfo: { id: 'memberMessages.label.studentInfo', defaultMessage: '學員資料' },
})

const StyledTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
  color: var(--gray-darker);
`
const StyledContent = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 2;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`
const StyledLink = styled.a`
  margin-left: 5px;
  color: ${props => props.theme['@primary-color'] || '#4c5b8f'};
`

type FieldProps = {
  property: { [propertyId: string]: string }
  note: {
    status?: string
    description?: string
  }
}

const MemberPropertyModal: React.FC<
  AdminModalProps & {
    member: {
      id: string
      name: string
      categoryNames: string[]
    } | null
    manager: {
      id: string
      name: string
      email: string
    }
    onClose?: () => void
  }
> = ({ member, manager, onClose, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { loadingProperties, properties } = useProperty()
  const { loadingMemberProperties, memberProperties } = useMemberPropertyCollection(member?.id || '')
  const { updateMemberProperty } = useMutateMemberProperty()
  const { insertMemberNote } = useMutateMemberNote()
  const { loading: loadingMemberNoteStatus, data: memberNoteStatus } = useQuery<
    hasura.GET_LATEST_MEMBER_NOTE_STATUS,
    hasura.GET_LATEST_MEMBER_NOTE_STATUSVariables
  >(GET_LATEST_MEMBER_NOTE_STATUS, { variables: { memberId: member?.id || '' } })
  const [loading, setLoading] = useState(false)

  const displayProperties = [
    { name: '性別', isRequired: true },
    { name: '縣市', isRequired: false },
    { name: '有意願領域', isRequired: true },
    { name: '是否在職', isRequired: true },
    { name: '是否為相關職務', isRequired: false },
    { name: '學生程度', isRequired: true },
    { name: '學習動機', isRequired: false },
    { name: '每月學習預算', isRequired: false },
    { name: '有沒有上過其他課程', isRequired: false },
    { name: '是否有轉職意願', isRequired: true },
  ]

  const handleSubmit = () => {
    if (!member) {
      return
    }
    form
      .validateFields()
      .then(values => {
        setLoading(true)
        return Promise.allSettled([
          updateMemberProperty({
            variables: {
              memberProperties: properties.map(property => {
                const displayPropertiesName = displayProperties.map(displayProperty => displayProperty.name)
                if (displayPropertiesName.includes(property.name)) {
                  return { member_id: member.id, property_id: property.id, value: values.property[property.id] || '' }
                }

                return {
                  member_id: member.id,
                  property_id: property.id,
                  value: memberProperties.find(memberProperty => memberProperty.id === property.id)?.value || '',
                }
              }),
            },
          }),
          values.note.status &&
            values.note.description &&
            insertMemberNote({
              variables: {
                memberId: member.id,
                authorId: manager.id,
                status: values.note.status,
                description: values.note.description || '',
                duration: 0,
              },
            }),
        ])
      })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onClose?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      title={<StyledTitle>{member?.name}</StyledTitle>}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div className="mt-4">
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </div>
      )}
      {...modalProps}
    >
      {loadingProperties || loadingMemberProperties || loadingMemberNoteStatus ? (
        <Skeleton active />
      ) : (
        <>
          <StyledContent className="mt-n2 mb-4">
            <div>會員分類：{member?.categoryNames.join(', ')}</div>
            <div>
              素材：{memberProperties.find(property => property.name === '廣告素材')?.value}
              <StyledLink
                href="https://docs.google.com/presentation/d/1JA-ucGIoMpSzCh5nBW5IpSBf_QsqnY3W1c9-U5Xnk1c/edit#slide=id.p"
                target="_blank"
                rel="noreferrer"
              >
                查看
              </StyledLink>
            </div>
            <div>
              填單日期：
              {memberProperties.find(property => property.name === '填單日期')?.value &&
                moment(memberProperties.find(property => property.name === '填單日期')?.value).format('YYYY-MM-DD')}
            </div>
          </StyledContent>
          <Form
            form={form}
            layout="vertical"
            colon={false}
            initialValues={{
              note: { status: memberNoteStatus?.member_note[0]?.status },
              property: memberProperties.reduce(
                (accumulator, currentValue) => ({
                  ...accumulator,
                  [currentValue.id]: currentValue.value,
                }),
                {},
              ),
            }}
          >
            <Form.Item label={<StyledTitle>{formatMessage(messages.presentCall)}</StyledTitle>} name="note">
              <Form.Item label="接通狀況" name={['note', 'status']}>
                <Select>
                  {properties.find(property => property.name === '接通狀況')?.placeholder?.includes('/') ? (
                    properties
                      .find(property => property.name === '接通狀況')
                      ?.placeholder?.split('/')
                      .map((value: string, idx: number) => (
                        <Select.Option key={idx} value={value}>
                          {value}
                        </Select.Option>
                      ))
                  ) : (
                    <></>
                  )}
                </Select>
              </Form.Item>
              <Form.Item label="聯絡備註" name={['note', 'description']}>
                <Input.TextArea />
              </Form.Item>
            </Form.Item>
            <Form.Item label={<StyledTitle>{formatMessage(messages.studentInfo)}</StyledTitle>} name="property">
              {displayProperties.map(displayProperty => {
                const property = properties.find(v => v.name === displayProperty.name)
                if (!property) {
                  return null
                }
                return (
                  <Form.Item
                    key={property.id}
                    label={property.name}
                    name={['property', property.id]}
                    rules={[
                      {
                        required: displayProperty.isRequired,
                        message: formatMessage(errorMessages.form.isRequired, {
                          field: property.name,
                        }),
                      },
                    ]}
                  >
                    {property?.placeholder?.includes('/') ? (
                      <Select>
                        {property?.placeholder?.split('/').map((value: string, idx: number) => (
                          <Select.Option key={idx} value={value}>
                            {value}
                          </Select.Option>
                        ))}
                      </Select>
                    ) : (
                      <Input />
                    )}
                  </Form.Item>
                )
              })}
            </Form.Item>
          </Form>
        </>
      )}
    </AdminModal>
  )
}

const GET_LATEST_MEMBER_NOTE_STATUS = gql`
  query GET_LATEST_MEMBER_NOTE_STATUS($memberId: String!) {
    member_note(where: { member_id: { _eq: $memberId } }, order_by: { created_at: desc }, limit: 1) {
      id
      status
    }
  }
`

export default MemberPropertyModal
