import { EditOutlined, LoadingOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Divider, Dropdown, Form, InputNumber, Menu, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateProgramContent } from '../../hooks/program'
import types from '../../types'
import { ProgramContentProps, ProgramProps } from '../../types/program'
import { AdminPageTitle } from '../admin'
import ItemsSortingModal from '../common/ItemsSortingModal'

type FieldProps = {
  isTrial: boolean
  isVisible: boolean
  isAvailableToGoBack: boolean
  isAvailableToRetry: boolean
  isNotifyUpdate: boolean
  baseline: number
}

type ExerciseProblemProps = {
  id: string
  title: string
  points: number
  description: string
  options: {
    id: string
    title: string
    description: string
  }[]
}

const ExerciseAdminModal: React.FC<{
  program: ProgramProps
  programContent: ProgramContentProps
  onRefetch?: () => void
}> = ({ program, programContent, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { deleteProgramContent } = useMutateProgramContent()

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalPoints, setTotalPoints] = useState(0)

  return (
    <>
      <EditOutlined onClick={() => setVisible(true)} />

      <Modal
        width="70vw"
        footer={null}
        maskStyle={{ background: 'rgba(255, 255, 255, 0.8)' }}
        maskClosable={false}
        closable={false}
        visible={visible}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isTrial: false,
            isVisible: true,
            isAvailableToGoBack: true,
            isAvailableToRetry: true,
            isNotifyUpdate: false,
            baseline: 0,
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <Checkbox className="mr-2">{formatMessage(commonMessages.ui.trial)}</Checkbox>
              <Checkbox className="mr-2">{formatMessage(programMessages.label.show)}</Checkbox>
              <Checkbox className="mr-2">{formatMessage(programMessages.label.availableToGoBack)}</Checkbox>
              <Checkbox className="mr-2">{formatMessage(programMessages.label.availableToRetry)}</Checkbox>
              <Checkbox className="mr-2">{formatMessage(programMessages.label.notifyUpdate)}</Checkbox>
            </div>
            <div>
              <Button disabled={loading} onClick={() => setVisible(false)} className="mr-2">
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" loading={loading} className="mr-2">
                {formatMessage(commonMessages.ui.save)}
              </Button>
              <Dropdown
                trigger={['click']}
                placement="bottomRight"
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() =>
                        window.confirm(formatMessage(programMessages.text.deleteContentWarning)) &&
                        deleteProgramContent({
                          variables: { programContentId: programContent.id },
                        })
                          .then(() => onRefetch?.())
                          .catch(handleError)
                      }
                    >
                      {formatMessage(programMessages.ui.deleteContent)}
                    </Menu.Item>
                  </Menu>
                }
              >
                <MoreOutlined />
              </Dropdown>
            </div>
          </div>

          <AdminPageTitle className="mb-4">{formatMessage(programMessages.label.exercise)}</AdminPageTitle>
          <div className="d-flex align-items-center justify-content-between">
            <Form.Item name="baseline" label={formatMessage(programMessages.label.baseline)}>
              <InputNumber min={0} max={totalPoints} /> / {totalPoints}
            </Form.Item>

            <ItemsSortingModal<ExerciseProblemProps>
              items={[]}
              triggerText={formatMessage(programMessages.ui.sortContents)}
            />
          </div>

          <Divider>
            <Button type="link" icon={loading ? <LoadingOutlined /> : <PlusOutlined />} loading={loading}>
              {formatMessage(programMessages.ui.createExerciseProblem)}
            </Button>
          </Divider>
        </Form>
      </Modal>
    </>
  )
}

export default ExerciseAdminModal
