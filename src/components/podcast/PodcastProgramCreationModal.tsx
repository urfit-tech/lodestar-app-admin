import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { FileAddOutlined } from '@ant-design/icons'
import { Button, Input, Modal } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { CreatePodcastProgramProps } from '../../containers/podcast/PodcastProgramCreationModal'
import { commonMessages, errorMessages } from '../../helpers/translation'
import CategorySelector from '../common/CategorySelector'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const messages = defineMessages({
  createPodcastProgram: { id: 'podcast.ui.createPodcastProgram', defaultMessage: '建立廣播' },
})

type PodcastProgramCreationModalProps = FormComponentProps & {
  onCreate?: CreatePodcastProgramProps
}
const PodcastProgramCreationModal: React.FC<PodcastProgramCreationModalProps> = ({ form, onCreate }) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onCreate) {
        setLoading(true)

        onCreate({
          onError: () => setLoading(false),
          data: {
            title: values.title,
            categoryIds: values.categoryIds || [],
          },
        })
      }
    })
  }

  return (
    <>
      <Button icon={<FileAddOutlined />} type="primary" loading={loading} onClick={() => setVisible(true)}>
        {formatMessage(messages.createPodcastProgram)}
      </Button>

      <Modal title={null} footer={null} destroyOnClose centered visible={visible} onCancel={() => setVisible(false)}>
        <StyledTitle>{formatMessage(messages.createPodcastProgram)}</StyledTitle>
        <Form hideRequiredMark>
          <Form.Item label={formatMessage(commonMessages.term.title)}>
            {form.getFieldDecorator('title', {
              initialValue: 'Untitled',
              rules: [
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.title),
                  }),
                },
              ],
            })(<Input type="text" />)}
          </Form.Item>
          <Form.Item label={formatMessage(commonMessages.term.category)}>
            {form.getFieldDecorator('categoryIds')(<CategorySelector classType="podcastProgram" />)}
          </Form.Item>
        </Form>

        <div className="text-right">
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.ui.create)}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default Form.create<PodcastProgramCreationModalProps>()(PodcastProgramCreationModal)
