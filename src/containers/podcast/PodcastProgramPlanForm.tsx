import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, Icon, InputNumber, message, Skeleton } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { handleError } from '../../helpers'
import types from '../../types'

const StyledIcon = styled(Icon)`
  color: #ff7d62;
`

const PodcastProgramPlanForm: React.FC<FormComponentProps> = ({ form }) => {
  const { loadingPodcastProgram, errorPodcastProgram, podcastProgram, refetchPodcastProgram } = useContext(
    PodcastProgramContext,
  )
  const [withSalePrice, setWithSalePrice] = useState(false)
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramPlan] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_PLAN,
    types.UPDATE_PODCAST_PROGRAM_PLANVariables
  >(UPDATE_PODCAST_PROGRAM_PLAN)

  useEffect(() => {
    setWithSalePrice(!!podcastProgram && typeof podcastProgram.salePrice === 'number')
  }, [podcastProgram])

  if (loadingPodcastProgram) {
    return <Skeleton active />
  }

  if (errorPodcastProgram || !podcastProgram) {
    return <div>讀取錯誤</div>
  }

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updatePodcastProgramPlan({
        variables: {
          updatedAt: new Date(),
          podcastProgramId: podcastProgram.id,
          listPrice: values.listPrice,
          salePrice: withSalePrice ? values.salePrice || 0 : null,
          soldAt: withSalePrice && values.soldAt ? moment(values.soldAt).toDate() : null,
        },
      })
        .then(() => {
          refetchPodcastProgram && refetchPodcastProgram()
          message.success('儲存成功')
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
    <Form
      hideRequiredMark
      colon={false}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label="定價">
        {form.getFieldDecorator('listPrice', {
          initialValue: podcastProgram.listPrice,
        })(
          <InputNumber
            min={0}
            formatter={value => `NT$ ${value}`}
            parser={value => (value ? value.replace(/\D/g, '') : '')}
          />,
        )}
      </Form.Item>
      <div className="mb-4">
        <Checkbox checked={withSalePrice} onChange={e => setWithSalePrice(e.target.checked)}>
          優惠價
        </Checkbox>
      </div>
      <Form.Item className={withSalePrice ? 'm-0' : 'd-none'}>
        <Form.Item className="d-inline-block mr-2">
          {form.getFieldDecorator('salePrice', {
            initialValue: podcastProgram.salePrice || 0,
          })(
            <InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
            />,
          )}
        </Form.Item>
        <Form.Item className="d-inline-block mr-2">
          {form.getFieldDecorator('soldAt', {
            initialValue: podcastProgram && podcastProgram.soldAt ? moment(podcastProgram.soldAt) : null,
            rules: [{ required: withSalePrice, message: '請選擇日期' }],
          })(<DatePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />)}
        </Form.Item>
        {form.getFieldValue('soldAt') && moment(form.getFieldValue('soldAt')).isBefore(moment()) ? (
          <div className="d-inline-block">
            <StyledIcon type="exclamation-circle" theme="filled" className="mr-1" />
            <span>已過期</span>
          </div>
        ) : null}
      </Form.Item>
      <Form.Item>
        <Button onClick={() => form.resetFields()} className="mr-2">
          取消
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          儲存
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_PODCAST_PROGRAM_PLAN = gql`
  mutation UPDATE_PODCAST_PROGRAM_PLAN(
    $podcastProgramId: uuid!
    $listPrice: numeric
    $salePrice: numeric
    $soldAt: timestamptz
    $updatedAt: timestamptz!
  ) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { list_price: $listPrice, sale_price: $salePrice, sold_at: $soldAt, updated_at: $updatedAt }
    ) {
      affected_rows
    }
  }
`

export default Form.create()(PodcastProgramPlanForm)
