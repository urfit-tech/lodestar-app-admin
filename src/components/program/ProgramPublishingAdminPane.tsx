import { useMutation } from '@apollo/react-hooks'
import { Button, Icon, Modal, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ThemeContext } from 'styled-components'
import { InferType } from 'yup'
import { handleError } from '../../helpers'
import { programSchema } from '../../schemas/program'
import types from '../../types'
import AdminCard from '../admin/AdminCard'

type ProgramPublishingAdminPaneProps = CardProps & {
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}
const ProgramPublishingAdminPane: React.FC<ProgramPublishingAdminPaneProps> = ({ program, onRefetch }) => {
  const theme = useContext(ThemeContext)

  const [publishProgram] = useMutation<types.PUBLISH_PROGRAM, types.PUBLISH_PROGRAMVariables>(PUBLISH_PROGRAM)

  const isPublished = (program && program.publishedAt) || false
  const { isValidate, errors } = (program && validateProgram(program)) || {
    isValidate: false,
    errors: [],
  }

  const handlePublish = () => {
    program &&
      publishProgram({
        variables: { programId: program.id, publishedAt: new Date() },
      })
        .then(() => onRefetch && onRefetch())
        .catch(handleError)
  }
  const handleUnPublish = () => {
    program &&
      Modal.confirm({
        title: '你確定要取消發佈？',
        content: '課程將下架且不會出現在課程列表，已購買的學生仍然可以看到課程內容。',
        onOk: () => {
          publishProgram({
            variables: { programId: program.id, publishedAt: null },
          })
            .then(() => onRefetch && onRefetch())
            .catch(handleError)
        },
        onCancel: () => {},
      })
  }
  return (
    <div className="py-3">
      <div className="container">
        <Typography.Title className="pb-3" level={3}>
          發佈設定
        </Typography.Title>
        <AdminCard loading={!program}>
          {program && (
            <div className="d-flex flex-column align-items-center py-3  ">
              <div className="mb-3">
                <Icon
                  type={isPublished ? 'check-circle' : isValidate ? 'warning' : 'close-circle'}
                  style={{ fontSize: 64, color: theme['@primary-color'] }}
                />
              </div>
              <div className="mb-2">
                <Typography.Title level={4}>
                  {isPublished ? '已發佈課程' : isValidate ? '尚未發佈課程' : '尚有未完成項目'}
                </Typography.Title>
              </div>
              <div className="mb-3">
                <Typography.Paragraph>
                  {isPublished
                    ? '現在你的課程已經發佈，此課程並會出現在頁面上，學生將能購買此課程。'
                    : isValidate
                    ? '因你的課程未發佈，此課程並不會顯示在頁面上，學生也不能購買此課程。'
                    : '請填寫以下必填資料，填寫完畢即可由此發佈'}
                </Typography.Paragraph>
              </div>
              {!isValidate && (
                <div className="px-5 py-4 mb-3" style={{ backgroundColor: '#f7f8f8', width: '100%' }}>
                  {errors.map((error, idx) => {
                    return (
                      <div key={idx} className="d-flex align-items-center mb-2">
                        <Icon type="exclamation-circle" className="mr-1" />
                        <span className="mr-1">{error.message}</span>
                        <span>
                          <Link to={error.to}>
                            前往填寫 <Icon type="right" />
                          </Link>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
              {isPublished ? (
                <Button onClick={handleUnPublish}>取消發佈</Button>
              ) : (
                <Button type="primary" disabled={!isValidate} onClick={handlePublish}>
                  立即發佈
                </Button>
              )}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  )
}

const validateProgram = (program: InferType<typeof programSchema>) => {
  const errors: Array<{ message: string; to: string }> = []
  if (!program.abstract) {
    errors.push({
      message: `尚未填寫課程摘要`,
      to: `/studio/programs/${program.id}?active=general`,
    })
  }
  if (!program.description) {
    errors.push({
      message: `尚未填寫課程描述`,
      to: `/studio/programs/${program.id}?active=general`,
    })
  }
  if (program.contentSections.map(v => v.programContents.length).reduce((a, b) => a + b, 0) === 0) {
    errors.push({
      message: `尚未新增任何內容`,
      to: `/studio/programs/${program.id}?active=content`,
    })
  }
  if (program.isSubscription) {
    if (program.plans.length === 0) {
      errors.push({
        message: `尚未訂定售價`,
        to: `/studio/programs/${program.id}?active=plan`,
      })
    }
  } else {
    if (program.listPrice === null) {
      errors.push({
        message: `尚未訂定售價`,
        to: `/studio/programs/${program.id}?active=plan`,
      })
    }
  }
  return {
    isValidate: errors.length === 0,
    errors,
  }
}

const PUBLISH_PROGRAM = gql`
  mutation PUBLISH_PROGRAM($programId: uuid!, $publishedAt: timestamptz) {
    update_program(_set: { published_at: $publishedAt }, where: { id: { _eq: $programId } }) {
      affected_rows
    }
  }
`

export default ProgramPublishingAdminPane
