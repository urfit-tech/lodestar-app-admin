import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Form, Input, message, Radio, Select, Skeleton, TimePicker } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { AdminBlock, AdminBlockTitle } from 'lodestar-app-admin/src/components/admin'
import { useApp } from 'lodestar-app-admin/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { handleError, notEmpty } from 'lodestar-app-admin/src/helpers'
import { commonMessages, errorMessages } from 'lodestar-app-admin/src/helpers/translation'
import { ReactComponent as CallOutIcon } from 'lodestar-app-admin/src/images/icon/call-out.svg'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { call, memberPropertyFields } from '../../helpers'
import { useFirstAssignedMember } from '../../hooks'
import types from '../../types'

const AssignedMemberName = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const AssignedMemberEmail = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledLabel = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledButton = styled(Button)<{ $iconSize?: string }>`
  padding: 0 1rem;
  height: 36px;
  line-height: 1;
  font-size: ${props => props.$iconSize};
`

type memberNoteFieldProps = {
  status: 'not-answered' | 'rejected' | 'willing'
  duration: Moment
  description: string
}
type memberPropertyFieldProps = {
  [PropertyName: string]: string
}

const AssignedMemberContactBlock: React.FC<{ salesId: string }> = ({ salesId }) => {
  const { formatMessage } = useIntl()
  const { apiHost, authToken } = useAuth()
  const { id: appId } = useApp()

  const [memberNoteForm] = useForm<memberNoteFieldProps>()
  const [memberPropertyForm] = useForm<memberPropertyFieldProps>()

  const {
    loadingAssignedMember,
    errorAssignedMember,
    sales,
    properties,
    assignedMember,
    refetchAssignedMember,
  } = useFirstAssignedMember(salesId)
  const [markInvalidMember] = useMutation<types.MARK_INVALID_MEMBER, types.MARK_INVALID_MEMBERVariables>(
    MARK_INVALID_MEMBER,
  )
  const [updateMemberPhone] = useMutation<types.UPDATE_MEMBER_PHONE, types.UPDATE_MEMBER_PHONEVariables>(
    UPDATE_MEMBER_PHONE,
  )
  const [insertMemberNote] = useMutation<types.INSERT_MEMBER_NOTE, types.INSERT_MEMBER_NOTEVariables>(
    INSERT_MEMBER_NOTE,
  )
  const [updateMemberProperties] = useMutation<types.UPDATE_MEMBER_PROPERTIES, types.UPDATE_MEMBER_PROPERTIESVariables>(
    UPDATE_MEMBER_PROPERTIES,
  )

  const [selectedPhone, setSelectedPhone] = useState('')
  const [disabledPhones, setDisabledPhones] = useState<string[]>([])
  const [customPhoneNumber, setCustomPhoneNumber] = useState('')
  const [memberNoteStatus, setMemberNoteStatus] = useState<memberNoteFieldProps['status']>('not-answered')
  const [loading, setLoading] = useState(false)

  if (loadingAssignedMember) {
    return <Skeleton active />
  }

  if (errorAssignedMember) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  if (!assignedMember) {
    return <div>目前無待開發名單</div>
  }

  const withDurationInput = !sales?.telephone.startsWith('8')
  const primaryPhoneNumber = selectedPhone === 'custom-phone' ? customPhoneNumber : selectedPhone

  const resetForms = async () => {
    memberNoteForm.resetFields()
    setSelectedPhone('')
    setDisabledPhones([])
    setMemberNoteStatus('not-answered')
    refetchAssignedMember().then(({ data }) => {
      memberPropertyForm.setFieldsValue(
        properties.reduce(
          (accumulator, property) => ({
            ...accumulator,
            [property.id]: data.member[0]?.member_properties.find(v => v.property.id === property.id)?.value || '',
          }),
          {} as { [PropertyID: string]: string },
        ),
      )
    })
    message.success('儲存成功')
  }

  const handleSubmit = async () => {
    if (!primaryPhoneNumber) {
      if (assignedMember.phones.every(phone => disabledPhones.includes(phone))) {
        setLoading(true)
        await markInvalidMember({
          variables: {
            memberId: assignedMember.id,
          },
        }).catch(handleError)
        setLoading(false)
        resetForms()
        return
      }

      message.error('請選取主要電話')
      return
    }

    setLoading(true)
    try {
      await memberNoteForm.validateFields()
      await memberPropertyForm.validateFields()
    } catch (error) {
      process.env.NODE_ENV === 'development' && console.error(error)
      message.error('請確實填寫必填欄位')
      setLoading(false)
      return
    }

    try {
      const noteValues = memberNoteForm.getFieldsValue()
      const propertyValues = memberPropertyForm.getFieldsValue()
      await updateMemberPhone({
        variables: {
          data: [
            ...assignedMember.phones.map(phone => ({
              member_id: assignedMember.id,
              phone,
              is_primary: phone === primaryPhoneNumber,
              is_valid: disabledPhones.includes(phone),
            })),
            selectedPhone === 'custom-phone'
              ? {
                  member_id: assignedMember.id,
                  phone: primaryPhoneNumber,
                  is_primary: true,
                }
              : undefined,
          ].filter(notEmpty),
        },
      })
      await insertMemberNote({
        variables: {
          data: {
            member_id: assignedMember.id,
            author_id: salesId,
            type: 'outbound',
            status: memberNoteStatus === 'not-answered' ? 'missed' : 'answered',
            duration: withDurationInput
              ? noteValues.duration.hour() * 3600 + noteValues.duration.minute() * 60 + noteValues.duration.second()
              : 0,
            description: noteValues.description,
            rejected_at: memberNoteStatus === 'rejected' ? new Date() : undefined,
          },
        },
      })
      await updateMemberProperties({
        variables: {
          data: properties
            .filter(property => propertyValues[property.id])
            .map(property => ({
              member_id: assignedMember.id,
              property_id: property.id,
              value: propertyValues[property.id],
            })),
        },
      })
      resetForms()
    } catch (error) {
      handleError(error)
    }
    setLoading(false)
  }

  return (
    <AdminBlock className="p-4">
      <div className="row">
        <div className="col-5">
          <AssignedMemberName className="mb-2">{assignedMember.name}</AssignedMemberName>
          <AssignedMemberEmail>{assignedMember.email}</AssignedMemberEmail>
        </div>
        <div className="col-7">
          <div>會員分類：{assignedMember.categories.map(category => category.name).join(', ')}</div>
          <div>
            <span className="mr-2">
              素材：{assignedMember.properties.find(property => property.name === '廣告素材')?.value}
            </span>
            <a
              href="https://docs.google.com/presentation/d/1JA-ucGIoMpSzCh5nBW5IpSBf_QsqnY3W1c9-U5Xnk1c/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
            >
              查看
            </a>
          </div>
          <div>
            填單日期：
            {assignedMember.properties
              .find(property => property.name === '填單日期')
              ?.value.split(',')
              .map(date => moment(date).format('YYYY-MM-DD'))
              .join(', ')}
          </div>
        </div>
      </div>
      <Divider />
      <div className="row mb-4">
        <div className="col-5">
          <AdminBlockTitle className="mb-4">聯絡紀錄</AdminBlockTitle>
          <StyledLabel className="mb-3">選取主要電話</StyledLabel>
          <Radio.Group
            value={selectedPhone}
            onChange={e => {
              setSelectedPhone(e.target.value)
              setCustomPhoneNumber('')
            }}
            className="mb-5"
          >
            {assignedMember.phones.map(phone => {
              const isDisabled = disabledPhones.includes(phone)

              return (
                <Radio
                  key={phone}
                  value={phone}
                  disabled={disabledPhones.includes(phone)}
                  className="d-flex align-items-center mb-3"
                >
                  <div className="d-flex align-items-center">
                    <div className="mr-2">{phone}</div>
                    <StyledButton
                      type="primary"
                      disabled={isDisabled}
                      className="mr-2"
                      $iconSize="20px"
                      onClick={() =>
                        call({
                          appId,
                          apiHost,
                          authToken,
                          phone,
                          salesTelephone: sales?.telephone || '',
                        })
                      }
                    >
                      <CallOutIcon />
                    </StyledButton>
                    <StyledButton
                      size="small"
                      onClick={() => {
                        setSelectedPhone('')
                        isDisabled
                          ? setDisabledPhones(disabledPhones.filter(disabledPhone => disabledPhone !== phone))
                          : setDisabledPhones([...disabledPhones, phone])
                      }}
                    >
                      {isDisabled ? '恢復' : '空號'}
                    </StyledButton>
                  </div>
                </Radio>
              )
            })}
            <Radio value="custom-phone" className="d-flex align-items-center">
              <div className="d-flex align-items-center">
                <div className="mr-2">新增其他號碼</div>
                {selectedPhone === 'custom-phone' && (
                  <div className="flex-grow-1">
                    <Input
                      value={customPhoneNumber}
                      onChange={e => setCustomPhoneNumber(e.target.value.replace(/[^\d+\-()]/g, ''))}
                    />
                  </div>
                )}
              </div>
            </Radio>
          </Radio.Group>

          <Form
            form={memberNoteForm}
            layout="vertical"
            initialValues={{
              status: 'not-answered',
              duration: moment('00:00:00', 'HH:mm:ss'),
            }}
            onValuesChange={(_, values) => {
              setMemberNoteStatus(values.status)
            }}
          >
            <Form.Item name="status" label={<StyledLabel>通話狀態</StyledLabel>}>
              <Select disabled={!primaryPhoneNumber}>
                <Select.Option value="not-answered">未接</Select.Option>
                <Select.Option value="rejected">拒絕/一接就掛</Select.Option>
                <Select.Option value="willing">有意願再聊</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="duration"
              label={<StyledLabel>通時（時：分：秒）</StyledLabel>}
              className={withDurationInput ? '' : 'd-none'}
            >
              <TimePicker showNow={false} disabled={!primaryPhoneNumber || memberNoteStatus === 'not-answered'} />
            </Form.Item>
            <Form.Item
              name="description"
              label={<StyledLabel>本次聯絡備註</StyledLabel>}
              rules={[{ required: memberNoteStatus !== 'not-answered', message: '請填寫備註' }]}
            >
              <Input.TextArea disabled={!primaryPhoneNumber} />
            </Form.Item>
          </Form>
        </div>
        <div className="col-7">
          <Form
            form={memberPropertyForm}
            colon={false}
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={assignedMember.properties.reduce(
              (accumulator, property) => ({
                ...accumulator,
                [property.id]: property.value,
              }),
              {} as { [PropertyID: string]: string },
            )}
          >
            {memberPropertyFields.map(propertyField => {
              const property = properties.find(property => property.name === propertyField.name)
              if (!property) {
                return null
              }

              return (
                <Form.Item
                  key={property.id}
                  name={property.id}
                  label={property.name}
                  rules={[{ required: memberNoteStatus === 'willing' && propertyField.required }]}
                >
                  {property.options ? (
                    <Select disabled={!primaryPhoneNumber}>
                      {property.options.map(option => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <Input disabled={!primaryPhoneNumber} />
                  )}
                </Form.Item>
              )
            })}
          </Form>
        </div>
      </div>
      <Button type="primary" loading={loading} block onClick={() => handleSubmit()}>
        {formatMessage(commonMessages.ui.save)}
      </Button>
    </AdminBlock>
  )
}

const UPDATE_MEMBER_PHONE = gql`
  mutation UPDATE_MEMBER_PHONE($data: [member_phone_insert_input!]!) {
    insert_member_phone(
      objects: $data
      on_conflict: { constraint: member_phone_member_id_phone_key, update_columns: [is_primary, is_valid] }
    ) {
      affected_rows
    }
  }
`
const MARK_INVALID_MEMBER = gql`
  mutation MARK_INVALID_MEMBER($memberId: String!) {
    update_member(where: { id: { _eq: $memberId } }, _set: { manager_id: null }) {
      affected_rows
    }
    update_member_phone(where: { member_id: { _eq: $memberId } }, _set: { is_valid: false }) {
      affected_rows
    }
  }
`
const INSERT_MEMBER_NOTE = gql`
  mutation INSERT_MEMBER_NOTE($data: member_note_insert_input!) {
    insert_member_note_one(object: $data) {
      id
    }
  }
`
const UPDATE_MEMBER_PROPERTIES = gql`
  mutation UPDATE_MEMBER_PROPERTIES($data: [member_property_insert_input!]!) {
    insert_member_property(
      objects: $data
      on_conflict: { constraint: member_property_member_id_property_id_key, update_columns: [value] }
    ) {
      returning {
        id
      }
    }
  }
`

export default AssignedMemberContactBlock
