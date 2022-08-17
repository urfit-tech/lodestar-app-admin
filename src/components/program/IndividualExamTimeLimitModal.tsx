import { EditOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, DatePicker, Form, Spin } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { gql } from 'graphql-tag'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { Fragment, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { PlusIcon, TrashOIcon } from '../../images/icon'
import AdminModal from '../admin/AdminModal'
import { AllMemberSelector } from '../form/MemberSelector'
import programMessages from './translation'

type IndividualExamTimeLimit = { memberId: string | null; expiredAt: Date | null }
type FieldProps = { timeLimitList: { memberId: string; expiredAt: Date | null }[] }

const StyledTimeLimitModal = styled.div`
  cursor: pointer;
  color: ${props => props.theme['@primary-color']};
  font-weight: 500;
`

const IndividualExamTimeLimitModal: React.VFC<{ examId: string }> = ({ examId }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState<boolean>(false)
  const {
    loading: loadingTimeLimitList,
    error,
    timeLimitList: defaultTimeLimitList,
    refetch,
  } = useTimeLimitList(examId)
  const [timeLimitList, setTimeLimitList] = useState<IndividualExamTimeLimit[]>(defaultTimeLimitList)
  const [upsertExamMemberTimeLimit] = useMutation<
    hasura.UPSERT_EXAM_MEMBER_TIME_LIMIT,
    hasura.UPSERT_EXAM_MEMBER_TIME_LIMITVariables
  >(UPSERT_EXAM_MEMBER_TIME_LIMIT)

  if (loadingTimeLimitList) return <Spin />
  if (error) return <div>fetch data error</div>

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        upsertExamMemberTimeLimit({
          variables: {
            examId,
            toDeleteMemberList: defaultTimeLimitList.filter(v =>
              values.timeLimitList.map(v => v.memberId).find(x => x !== v.memberId),
            ),
            timeLimitList: values.timeLimitList.map(v => ({
              exam_id: examId,
              member_id: v.memberId,
              expired_at: v.expiredAt,
              editor_id: currentMemberId,
            })),
          },
        })
        form.resetFields()
        refetch()
        onSuccess()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      width="600px"
      title={formatMessage(programMessages.IndividualExamTimeLimitModal.editIndividualTimeLimit)}
      maskClosable={false}
      renderTrigger={({ setVisible }) => (
        <StyledTimeLimitModal className="d-flex align-items-center" onClick={() => setVisible(true)}>
          <EditOutlined className="mr-2" />
          <div>{formatMessage(programMessages.IndividualExamTimeLimitModal.editIndividualTimeLimit)}</div>
        </StyledTimeLimitModal>
      )}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(programMessages['*'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(programMessages['*'].save)}
          </Button>
        </>
      )}
    >
      <div className="mb-2">{formatMessage(programMessages.IndividualExamTimeLimitModal.extendedValidity)}</div>
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          timeLimitList: defaultTimeLimitList.map(v => ({
            ...v,
            expiredAt: moment(v.expiredAt),
          })),
        }}
      >
        <Form.List name="timeLimitList">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Fragment key={field.fieldKey}>
                  <div className="d-flex">
                    <Form.Item
                      className="mr-2"
                      name={[field.name, 'memberId']}
                      style={{ width: '450px' }}
                      rules={[
                        {
                          required: true,
                          message: formatMessage(programMessages['*'].isRequired),
                        },
                      ]}
                    >
                      <AllMemberSelector allowClear />
                    </Form.Item>
                    <Form.Item
                      className="mr-2"
                      name={[field.name, 'expiredAt']}
                      rules={[
                        {
                          required: true,
                          message: formatMessage(programMessages['*'].isRequired),
                        },
                      ]}
                    >
                      <DatePicker
                        format="YYYY-MM-DD HH:mm"
                        showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
                        placeholder={formatMessage(programMessages.IndividualExamTimeLimitModal.expiredAt)}
                        style={{ width: '200px' }}
                      />
                    </Form.Item>
                    <div className="flex-grow-1 text-right">
                      <Button
                        type="link"
                        icon={<TrashOIcon />}
                        onClick={() => {
                          remove(field.name)
                          setTimeLimitList(timeLimitList?.filter((_, i) => i !== index))
                        }}
                      />
                    </div>
                  </div>
                </Fragment>
              ))}

              <Button
                type="link"
                icon={<PlusIcon className="mr-2" />}
                className="d-flex align-items-center"
                onClick={() => {
                  add({ listPrice: 0 })
                  setTimeLimitList([...timeLimitList, { memberId: null, expiredAt: null }])
                }}
              >
                {formatMessage(programMessages.IndividualExamTimeLimitModal.addMember)}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </AdminModal>
  )
}

const useTimeLimitList = (examId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_EXAM_TIME_LIMIT_LIST,
    hasura.GET_EXAM_TIME_LIMIT_LISTVariables
  >(
    gql`
      query GET_EXAM_TIME_LIMIT_LIST($examId: uuid!) {
        exam_member_time_limit(where: { exam_id: { _eq: $examId } }) {
          id
          expired_at
          member_id
        }
      }
    `,
    { variables: { examId } },
  )

  const timeLimitList: IndividualExamTimeLimit[] =
    data?.exam_member_time_limit.map(v => ({
      memberId: v.member_id,
      expiredAt: new Date(v.expired_at),
    })) || []

  return {
    loading,
    error,
    timeLimitList,
    refetch,
  }
}

const UPSERT_EXAM_MEMBER_TIME_LIMIT = gql`
  mutation UPSERT_EXAM_MEMBER_TIME_LIMIT(
    $examId: uuid!
    $toDeleteMemberList: [uuid!]!
    $timeLimitList: [exam_member_time_limit_insert_input!]!
  ) {
    delete_exam_member_time_limit(where: { exam_id: { _eq: $examId }, member_id: { _in: $toDeleteMemberList } }) {
      affected_rows
    }
    insert_exam_member_time_limit(
      objects: $timeLimitList
      on_conflict: { constraint: exam_member_time_limit_exam_id_member_id_key, update_columns: [] }
    ) {
      affected_rows
    }
  }
`

export default IndividualExamTimeLimitModal
