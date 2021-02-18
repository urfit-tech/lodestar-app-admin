import { Button, Divider, Form, Input, message, Radio, Select, Skeleton, TimePicker } from 'antd'
import { useForm } from 'antd/lib/form/Form'
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
import { useLead } from '../../hooks'

const CurrentLeadName = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const CurrentLeadEmail = styled.div`
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

const CurrentLeadContactBlock: React.FC<{ salesId: string }> = ({ salesId }) => {
  const { formatMessage } = useIntl()
  const { apiHost, authToken } = useAuth()
  const { id: appId } = useApp()

  const [memberNoteForm] = useForm<memberNoteFieldProps>()
  const [memberPropertyForm] = useForm<memberPropertyFieldProps>()

  const {
    loadingCurrentLead,
    errorCurrentLead,
    sales,
    properties,
    currentLead,
    refetchCurrentLead,
    updatePhones,
    insertNote,
    updateProperties,
    markInvalid,
  } = useLead(salesId)

  const [selectedPhone, setSelectedPhone] = useState('')
  const [disabledPhones, setDisabledPhones] = useState<string[]>([])
  const [customPhoneNumber, setCustomPhoneNumber] = useState('')
  const [memberNoteStatus, setMemberNoteStatus] = useState<memberNoteFieldProps['status']>('not-answered')
  const [loading, setLoading] = useState(false)

  if (loadingCurrentLead) {
    return <Skeleton active />
  }

  if (errorCurrentLead) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  if (!currentLead) {
    return <div>等待新名單中...</div>
  }

  const withDurationInput = !sales?.telephone.startsWith('8')
  const primaryPhoneNumber = selectedPhone === 'custom-phone' ? customPhoneNumber : selectedPhone

  const resetForms = async () => {
    memberNoteForm.resetFields()
    setSelectedPhone('')
    setDisabledPhones([])
    setMemberNoteStatus('not-answered')
    refetchCurrentLead().then(({ data }) => {
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
      if (currentLead.phones.every(phone => disabledPhones.includes(phone))) {
        setLoading(true)
        await markInvalid().catch(handleError)
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
      await updatePhones(
        [
          ...currentLead.phones.map(phone => ({
            phone,
            isPrimary: phone === primaryPhoneNumber,
            isValid: disabledPhones.includes(phone),
          })),
          selectedPhone === 'custom-phone'
            ? {
                phone: primaryPhoneNumber,
                isPrimary: true,
              }
            : undefined,
        ].filter(notEmpty),
      )
      await insertNote({
        status: memberNoteStatus === 'not-answered' ? 'missed' : 'answered',
        duration: withDurationInput
          ? noteValues.duration.hour() * 3600 + noteValues.duration.minute() * 60 + noteValues.duration.second()
          : 0,
        description: noteValues.description,
      })
      await updateProperties(
        properties
          .filter(property => propertyValues[property.id])
          .map(property => ({
            propertyId: property.id,
            value: propertyValues[property.id],
          })),
      )
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
          <CurrentLeadName className="mb-2">{currentLead.name}</CurrentLeadName>
          <CurrentLeadEmail>{currentLead.email}</CurrentLeadEmail>
        </div>
        <div className="col-7">
          <div>會員分類：{currentLead.categories.map(category => category.name).join(', ')}</div>
          <div>
            <span className="mr-2">
              素材：{currentLead.properties.find(property => property.name === '廣告素材')?.value}
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
            {currentLead.properties
              .find(property => property.name === '填單日期')
              ?.value.split(',')
              .filter(date => moment(date).isValid())
              .map(date => moment(date).fromNow())
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
            {currentLead.phones.map(phone => {
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
            initialValues={currentLead.properties.reduce(
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

export default CurrentLeadContactBlock
