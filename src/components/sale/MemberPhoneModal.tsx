import { CheckOutlined, CloseOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, List } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CommonTitleMixin } from 'lodestar-app-element/src/components/common'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, salesMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'

const StyledModalTitle = styled.div`
  ${CommonTitleMixin}
`

const StyledDelPhone = styled.p`
  color: var(--gray);
`

const StyledNewPhoneInput = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  gap: 12px;
`
const StyledNewPhoneButton = styled(Button)`
  fontsize: 16px;
  fontweight: 500;
`

type FieldProps = {
  phone: string
}

const MemberPhoneModal: React.FC<{
  onCancel: () => void
  visible: boolean
  phones: {
    phoneNumber: string
    isValid: boolean
  }[]
  memberId: string
  onLeadRefetch: () => Promise<void>
}> = ({ onCancel, onLeadRefetch, visible, phones, memberId }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const [phoneNumbersToUpdate, setPhoneNumbersToUpdate] = useState<{ phoneNumber: string; isValid: boolean }[]>([])
  const newPhones: { phoneNumber: string }[] = form.getFieldValue('phone') || []
  const [insertMemberPhone] = useMutation(
    gql`
      mutation InsertMemberPhone($phones: [member_phone_insert_input!]!) {
        insert_member_phone(objects: $phones) {
          affected_rows
        }
      }
    `,
  )
  const [updateMemberPhone] = useMutation(gql`
    mutation UpdateMemberPhone($memberId: String!, $phoneNumber: String!, $isValid: Boolean!) {
      update_member_phone(
        where: { member_id: { _eq: $memberId }, phone: { _eq: $phoneNumber } }
        _set: { is_valid: $isValid }
      ) {
        affected_rows
      }
    }
  `)
  const [updateMemberMangerId] = useMutation(gql`
    mutation UpdateMemberMangerId($memberId: String!, $mangerId: String!) {
      update_member(where: { id: { _eq: $memberId } }, _set: { manager_id: $mangerId }) {
        affected_rows
      }
    }
  `)

  const handleCancel = () => {
    onCancel()
    setPhoneNumbersToUpdate([])
    setIsDisabled(true)
    form.resetFields()
  }

  const handleSubmit = async () => {
    await form.validateFields()
    const isValidNewPhone = newPhones.filter(phone => phone?.phoneNumber.trim()).length !== 0 || newPhones.length !== 0
    if (!isValidNewPhone && phoneNumbersToUpdate.length === 0) {
      return
    }
    if (isValidNewPhone) {
      setIsSubmitting(true)
      try {
        await insertMemberPhone({
          variables: {
            phones: newPhones
              .filter(phone => !!phone && phone?.phoneNumber.trim())
              .map(phone => ({ member_id: memberId, phone: phone.phoneNumber.trim() })),
          },
        })
        onLeadRefetch()
        handleCancel()
        setIsSubmitting(false)
        form.resetFields()
      } catch (err) {
        console.log(err)
      }
    }
    if (phoneNumbersToUpdate.length > 0) {
      setIsSubmitting(true)
      const validPhonesLength = phones.filter(p => p.isValid).length
      const inValidUpdatePhoneNumberLength = phoneNumbersToUpdate.filter(p => !p.isValid).length
      phoneNumbersToUpdate.map(async phone => {
        try {
          if (validPhonesLength - inValidUpdatePhoneNumberLength <= 0 && !isValidNewPhone) {
            await updateMemberMangerId({
              variables: { memberId, mangerId: null },
            })
          }
          await updateMemberPhone({
            variables: { memberId, phoneNumber: phone.phoneNumber, isValid: phone.isValid },
          })
          onLeadRefetch()
          handleCancel()
          setIsSubmitting(false)
          setPhoneNumbersToUpdate([])
        } catch (err) {
          console.log(err)
        }
      })
    }
  }

  return (
    <AdminModal
      width={384}
      centered
      footer={null}
      onCancel={handleCancel}
      visible={visible}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              handleCancel()
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button loading={isSubmitting} disabled={isDisabled} type="primary" onClick={handleSubmit}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
    >
      <StyledModalTitle className="mb-4"> {formatMessage(salesMessages.phoneNumberSetting)}</StyledModalTitle>
      <List
        style={{ borderBottom: '1px solid #f0f0f0' }}
        dataSource={phones}
        renderItem={phone => {
          const updatePhone = phoneNumbersToUpdate.find(v => v.phoneNumber === phone.phoneNumber)
          const updatePhoneIsValid = updatePhone ? updatePhone.isValid : undefined
          const isValid = updatePhoneIsValid !== undefined ? updatePhoneIsValid : phone.isValid
          return (
            <List.Item style={{ width: '100%' }}>
              {!isValid ? (
                <StyledDelPhone>
                  <del>{phone.phoneNumber}</del>
                </StyledDelPhone>
              ) : (
                <span>{phone.phoneNumber}</span>
              )}
              <Button
                style={{ borderRadius: '4px' }}
                icon={!isValid ? <CheckOutlined /> : <StopOutlined style={{ color: 'red' }} />}
                onClick={() => {
                  setPhoneNumbersToUpdate(prev => {
                    const existingIndex = prev.findIndex(v => v.phoneNumber === phone.phoneNumber)

                    if (existingIndex !== -1) {
                      const updatedPhoneNumbers = [...prev]
                      updatedPhoneNumbers[existingIndex] = {
                        phoneNumber: phone.phoneNumber,
                        isValid: !updatedPhoneNumbers[existingIndex].isValid,
                      }
                      return updatedPhoneNumbers
                    } else {
                      return [...prev, { phoneNumber: phone.phoneNumber, isValid: !phone.isValid }]
                    }
                  })
                  setIsDisabled(false)
                }}
              >
                {!isValid ? (
                  <span>{formatMessage(salesMessages.valid)}</span>
                ) : (
                  <span>{formatMessage(salesMessages.invalid)}</span>
                )}
              </Button>
            </List.Item>
          )
        }}
      />
      <Form style={{ marginTop: '12px' }} form={form}>
        <Form.List name="phone">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  required={false}
                  key={field.key}
                  name={[field.name, 'phoneNumber']}
                  rules={[
                    () => ({
                      validator(_, value) {
                        const existPhone = phones.some(phone => value.trim() === phone.phoneNumber)
                        if (value.trim() && !existPhone) {
                          setIsDisabled(false)
                          return Promise.resolve()
                        }
                        if (existPhone) {
                          setIsDisabled(true)
                          return Promise.reject(new Error('手機號碼不能重複'))
                        }
                      },
                    }),
                  ]}
                >
                  <StyledNewPhoneInput>
                    <Input
                      placeholder={`${formatMessage(salesMessages.addPhoneNumber)}`}
                      style={{ borderRadius: '4px' }}
                      onChange={e => {
                        const phoneNumber = e.target.value
                        if (!phoneNumber.trim()) {
                          setIsDisabled(true)
                        } else {
                          setIsDisabled(false)
                        }
                      }}
                    />
                    <CloseOutlined onClick={() => remove(index)} />
                  </StyledNewPhoneInput>
                </Form.Item>
              ))}
              <Form.Item>
                <StyledNewPhoneButton type="link" icon={<PlusOutlined />} onClick={() => add()}>
                  <span>{formatMessage(salesMessages.addNewPhone)}</span>
                </StyledNewPhoneButton>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </AdminModal>
  )
}

export default MemberPhoneModal
