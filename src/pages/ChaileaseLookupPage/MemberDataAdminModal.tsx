import { UploadOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, DatePicker, Form, Input, message, Radio, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import AdminModal, { AdminModalProps } from 'lodestar-app-admin/src/components/admin/AdminModal'
import FileUploader from 'lodestar-app-admin/src/components/common/FileUploader'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { getFileDownloadableLink, handleError, uploadFile } from 'lodestar-app-admin/src/helpers/index'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'

type MemberDataFieldProps = {
  name: string
  idNumber: string
  marriage: string
  phone: string
  birthday: Moment | null
  residence: {
    address: string
  }
  home: {
    address: string
    phone: string
  }
  company: {
    status: string
    name: string
    phone: string
    telephone: string
  }
  school: {
    name: string
  }
  creditCard: {
    own: string
    bank: string
  }
  contact: {
    name: string
    relationship: string
    phone: string
    idNumber: string
  }
  bill: {
    address: string
    email: string
  }
}

const MemberDataAdminModal: React.FC<
  {
    memberId: string
    profile: any
    onSuccess?: () => void
  } & AdminModalProps
> = ({ memberId, profile, onSuccess, ...props }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [idImage, setIdImage] = useState<{ front: File | null; back: File | null }>({ front: null, back: null })
  const [form] = useForm<MemberDataFieldProps>()
  const { authToken, apiHost } = useAuth()
  const [updateMember] = useMutation<hasura.UPDATE_MEMBER, hasura.UPDATE_MEMBERVariables>(UPDATE_MEMBER)
  const { formatMessage } = useIntl()

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(async () => {
        setIsLoading(true)
        const imageId = profile.imageId || uuid()
        idImage.front && (await uploadFile(`chailease/${imageId}-01`, idImage.front, authToken, apiHost))
        idImage.back && (await uploadFile(`chailease/${imageId}-02`, idImage.back, authToken, apiHost))
        return imageId
      })
      .then(async imageId => {
        setIsLoading(true)
        const values = form.getFieldsValue()

        try {
          await updateMember({
            variables: {
              memberId,
              metadata: {
                profile: {
                  ...profile,
                  ...values,
                  imageId,
                  idImage: {
                    front: idImage.front
                      ? await getFileDownloadableLink(`chailease/${imageId}-01`, authToken, apiHost)
                      : profile.idImage?.front,
                    back: idImage.back
                      ? await getFileDownloadableLink(`chailease/${imageId}-02`, authToken, apiHost)
                      : profile.idImage?.back,
                  },
                },
              },
              phone: { member_id: memberId, phone: values.phone },
            },
          })
          message.success('更新成功')
          setVisible(false)
          onSuccess?.()
        } catch (error) {
          handleError(error)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <AdminModal
      title={'編輯使用者資料'}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
      {...props}
    >
      <Form
        form={form}
        colon={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={
          profile
            ? {
                name: profile.name,
                idNumber: profile.idNumber,
                marriage: profile.marriage,
                phone: profile.phone,
                birthday: profile.birthday ? moment(profile.birthday) : null,
                residence: {
                  address: profile.residence?.address,
                },
                home: {
                  address: profile.home?.address,
                  phone: profile.home?.phone,
                },
                company: {
                  status: profile.company?.status,
                  name: profile.company?.name,
                  phone: profile.company?.phone,
                },
                creditCard: {
                  own: profile.creditCard?.own,
                  bank: profile.creditCard?.bank,
                },
                contact: {
                  name: profile.contact?.name,
                  relationship: profile.contact?.relationship,
                  phone: profile.contact?.phone,
                  idNumber: profile.contact?.idNumber,
                },
                bill: {
                  address: profile.bill?.address,
                  email: profile.bill?.email,
                },
              }
            : {}
        }
      >
        <Form.Item label={'姓名'} name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'身分證字號'} name="idNumber" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'婚姻狀況'} name="marriage" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="已婚">已婚</Select.Option>
            <Select.Option value="未婚">未婚</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label={'生日'} name="birthday" rules={[{ required: true }]}>
          <DatePicker />
        </Form.Item>
        <Form.Item label={'戶籍地址'} name={['residence', 'address']} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'手機'} name="phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'身分證'} name="idImages">
          <>
            <FileUploader
              showUploadList
              fileList={idImage.front ? [idImage.front] : []}
              onChange={files => setIdImage(prev => ({ ...prev, front: files[0] }))}
              renderTrigger={({ onClick }) => (
                <Button icon={<UploadOutlined />} onClick={onClick}>
                  正面
                </Button>
              )}
            />
            <FileUploader
              showUploadList
              fileList={idImage.back ? [idImage.back] : []}
              onChange={files => setIdImage(prev => ({ ...prev, back: files[0] }))}
              renderTrigger={({ onClick }) => (
                <Button icon={<UploadOutlined />} onClick={onClick}>
                  反面
                </Button>
              )}
            />
          </>
        </Form.Item>
        <Form.Item label={'住家地址'} name={['home', 'address']} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'住家電話'} name={['home', 'phone']} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'就業狀況'} name={['company', 'status']} rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={'就業中'}>就業中</Radio>
            <Radio value={'學生'}>學生</Radio>
            <Radio value={'其他'}>其他</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={'公司名稱'} name={['company', 'name']}>
          <Input />
        </Form.Item>
        <Form.Item label={'公司電話'} name={['company', 'phone']}>
          <Input />
        </Form.Item>
        <Form.Item label={'工作電話'} name={['company', 'telephone']}>
          <Input />
        </Form.Item>
        <Form.Item label={'學校名稱'} name={['school', 'name']}>
          <Input />
        </Form.Item>
        <Form.Item label={'信用卡狀態'} name={['creditCard', 'own']} rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={'有卡'}>有卡</Radio>
            <Radio value={'無卡'}>無卡</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={'發卡銀行'} name={['creditCard', 'bank']}>
          <Input />
        </Form.Item>
        <Form.Item label={'聯絡人姓名'} name={['contact', 'name']} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'聯絡人關係'} name={['contact', 'relationship']} rules={[{ required: true }]}>
          <Select>
            <Select.Option value={'配偶'}>配偶</Select.Option>
            <Select.Option value={'父母'}>父母</Select.Option>
            <Select.Option value={'兄弟姊妹'}>兄弟姊妹</Select.Option>
            <Select.Option value={'其他親戚'}>其他親戚</Select.Option>
            <Select.Option value={'同事'}>同事</Select.Option>
            <Select.Option value={'朋友'}>朋友</Select.Option>
            <Select.Option value={'子女'}>子女</Select.Option>
            <Select.Option value={'其他'}>其他</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label={'聯絡人電話'} name={['contact', 'phone']} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'聯絡人身分證號'} name={['contact', 'idNumber']}>
          <Input />
        </Form.Item>
        <Form.Item label={'帳單寄送地址'} name={['bill', 'address']}>
          <Input />
        </Form.Item>
        <Form.Item label={'帳單寄送Email'} name={['bill', 'email']}>
          <Input />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const UPDATE_MEMBER = gql`
  mutation UPDATE_MEMBER($memberId: String!, $metadata: jsonb, $phone: member_phone_insert_input!) {
    update_member_by_pk(pk_columns: { id: $memberId }, _append: { metadata: $metadata }) {
      id
    }
    insert_member_phone_one(
      object: $phone
      on_conflict: { constraint: member_phone_member_id_phone_key, update_columns: [] }
    ) {
      id
    }
  }
`

export default MemberDataAdminModal
