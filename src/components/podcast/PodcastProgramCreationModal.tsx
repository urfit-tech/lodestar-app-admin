import { Button, Form, Input, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import styled from 'styled-components'
import { CreatePodcastProgramProps } from '../../containers/podcast/PodcastProgramCreationModal'
import ProgramCategorySelector from '../program/ProgramCategorySelector'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

type PodcastProgramCreationModalProps = FormComponentProps & {
  onCreate?: CreatePodcastProgramProps
}
const PodcastProgramCreationModal: React.FC<PodcastProgramCreationModalProps> = ({ form, onCreate }) => {
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
            categoryIds: values.categoryIds,
          },
        })
      }
    })
  }

  return (
    <>
      <Button icon="file-add" type="primary" loading={loading} onClick={() => setVisible(true)}>
        建立廣播
      </Button>

      <Modal title={null} footer={null} destroyOnClose centered visible={visible} onCancel={() => setVisible(false)}>
        <StyledTitle>建立廣播</StyledTitle>
        <Form hideRequiredMark>
          <Form.Item label="名稱">
            {form.getFieldDecorator('title', {
              initialValue: '未命名的廣播',
              rules: [{ required: true, message: '請輸入名稱' }],
            })(<Input type="text" />)}
          </Form.Item>
          <Form.Item label="類別">{form.getFieldDecorator('categoryIds')(<ProgramCategorySelector />)}</Form.Item>
        </Form>

        <div className="text-right">
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => handleSubmit()}>
            建立
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default Form.create<PodcastProgramCreationModalProps>()(PodcastProgramCreationModal)
