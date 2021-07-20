import { FileAddOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { Button, Form, Input, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, craftPageMessages, errorMessages } from '../../helpers/translation'
import templateA from '../../images/default/template-1.png'
import templateB from '../../images/default/template-2.png'
import templateC from '../../images/default/template-3.png'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { StyledTips } from '../admin'
import AdminCard from '../admin/AdminCard'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { BREAK_POINT } from '../common/Responsive'

const StyledDemoUrl = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`
const StyledFormItemWrapper = styled.div<{ currentTemplate: string }>`
  .ant-card {
    padding-top: 80%;
    margin: 2px;
    border-radius: 4px;
  }
  .ant-row:nth-child(1) {
    .ant-card {
      background-image: url(${templateA});
      background-size: cover;
      border: ${props => (props.currentTemplate === 'A' ? `2px ${props.theme['@primary-color']} solid` : null)};
    }
  }
  .ant-row:nth-child(2) {
    .ant-card {
      background-image: url(${templateB});
      background-size: cover;
      border: ${props => (props.currentTemplate === 'B' ? `2px ${props.theme['@primary-color']} solid` : null)};
    }
  }
  .ant-row:nth-child(3) {
    .ant-card {
      background-image: url(${templateC});
      background-size: cover;
      border: ${props => (props.currentTemplate === 'C' ? `2px ${props.theme['@primary-color']} solid` : null)};
    }
  }
  .ant-row:last-child {
    .ant-card {
      position: relative;
      border: ${props => (props.currentTemplate === 'empty' ? `2px ${props.theme['@primary-color']} solid` : null)};
      .content {
        position: absolute;
        color: var(--gray-dark);
        top: 50%;
        left: 50%;
        text-align: center;
        transform: translate(-50%, -50%);
        :last-child {
          font-size: 14px;
          letter-spacing: 0.4px;
        }
      }
    }
  }
  @media (min-width: ${BREAK_POINT}px) {
    display: flex;
    justify-content: space-between;
  }
`
const StyledFormItem = styled(Form.Item)`
  @media (min-width: ${BREAK_POINT}px) {
    width: 23%;
  }
`

type FieldProps = {
  pageName: string
  path: string
}

const ProductCreationModal: React.VFC<
  AdminModalProps & {
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  }
> = ({ setModalVisible, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<'A' | 'B' | 'C' | 'empty'>('A')
  const [createStep, setCreateStep] = useState<'page' | 'template'>('page')

  const resetModal = () => {
    form.resetFields()
    setCreateStep('page')
    setCurrentTemplate('A')
  }
  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    //TODO: insert page
    setLoading(false)
    setModalVisible(false)
    resetModal()
  }

  return (
    <AdminModal
      title={
        createStep === 'template'
          ? formatMessage(craftPageMessages.label.choiceTemplate)
          : formatMessage(craftPageMessages.ui.createPage)
      }
      renderTrigger={() => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setModalVisible(true)}>
          {formatMessage(craftPageMessages.ui.createPage)}
        </Button>
      )}
      maskClosable={false}
      footer={null}
      onCancel={() => {
        setModalVisible(false)
        resetModal()
      }}
      {...props}
    >
      <Form form={form} layout="vertical" colon={false} hideRequiredMark initialValues={{}} onFinish={handleSubmit}>
        {createStep === 'template' ? (
          <>
            <StyledFormItemWrapper currentTemplate={currentTemplate}>
              <StyledFormItem>
                <AdminCard
                  hoverable
                  cover={''}
                  onClick={() => {
                    setCurrentTemplate('A')
                  }}
                />
              </StyledFormItem>
              <StyledFormItem>
                <AdminCard
                  hoverable
                  cover={''}
                  onClick={() => {
                    setCurrentTemplate('B')
                  }}
                />
              </StyledFormItem>
              <StyledFormItem>
                <AdminCard
                  hoverable
                  cover={''}
                  onClick={() => {
                    setCurrentTemplate('C')
                  }}
                />
              </StyledFormItem>
              <StyledFormItem>
                <AdminCard
                  hoverable
                  cover={''}
                  onClick={() => {
                    setCurrentTemplate('empty')
                  }}
                >
                  <div className="content">
                    <PlusIcon />
                    <div>{formatMessage(craftPageMessages.label.emptyPage)}</div>
                  </div>
                </AdminCard>
              </StyledFormItem>
            </StyledFormItemWrapper>
            <div className="text-right">
              <Button className="mr-2" onClick={() => setCreateStep('page')}>
                {formatMessage(commonMessages.ui.previousStep)}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {formatMessage(commonMessages.ui.create)}
              </Button>
            </div>
          </>
        ) : (
          // createStep === 'page'
          <>
            <Form.Item label={formatMessage(craftPageMessages.label.pageName)}>
              <Form.Item
                name="pageName"
                noStyle
                rules={[
                  {
                    required: true,
                    message: formatMessage(errorMessages.form.isRequired, {
                      field: formatMessage(craftPageMessages.label.pageName),
                    }),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Form.Item>
            <Form.Item
              label={
                <span>
                  {formatMessage(craftPageMessages.label.path)}
                  <Tooltip
                    placement="top"
                    title={
                      <StyledTips>
                        {
                          // TODO: fill the url tip, zeplin didn't labeled
                        }
                      </StyledTips>
                    }
                  >
                    <QuestionCircleFilled className="ml-2" />
                  </Tooltip>
                </span>
              }
            >
              <Form.Item
                name="path"
                noStyle
                rules={[
                  {
                    required: true,
                    message: formatMessage(errorMessages.form.isRequired, {
                      field: formatMessage(craftPageMessages.label.path),
                    }),
                  },
                ]}
              >
                <Input className="mb-2" />
              </Form.Item>

              <StyledDemoUrl>www.demo.com/</StyledDemoUrl>
            </Form.Item>
            <div className="text-right">
              <div>
                <Button
                  className="mr-2"
                  onClick={() => {
                    setModalVisible(false)
                    resetModal()
                  }}
                >
                  {formatMessage(commonMessages.ui.cancel)}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    form
                      .validateFields(['pageName', 'path'])
                      .then(() => setCreateStep('template'))
                      .catch(err => {
                        if (process.env.NODE_ENV === 'development') console.log(err)
                      })
                  }}
                >
                  {formatMessage(commonMessages.ui.nextStep)}
                </Button>
              </div>
            </div>
          </>
        )}
      </Form>
    </AdminModal>
  )
}

export default ProductCreationModal
