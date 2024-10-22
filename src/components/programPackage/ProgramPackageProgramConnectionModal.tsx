import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Form, message, TreeSelect } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, programPackageMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'

type FieldProps = {
  programValues: string[]
}

const ProgramPackageProgramConnectionModal: React.FC<{
  programPackageId: string
  programs: {
    id: string
    title: string
    programPackageProgramId: string
  }[]
  onRefetch?: () => void
}> = ({ programPackageId, programs, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const { availablePrograms } = useGetAvailableProgramCollection(appId)
  const [insertProgramPackageProgram] = useMutation<
    hasura.INSERT_PROGRAM_PACKAGE_PROGRAM,
    hasura.INSERT_PROGRAM_PACKAGE_PROGRAMVariables
  >(INSERT_PROGRAM_PACKAGE_PROGRAM)

  const [isLoading, setLoading] = useState<boolean>(false)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        const programsId = values.programValues.map((value: string) => value.split('_')[0])
        insertProgramPackageProgram({
          variables: {
            programs: programsId.map((programId: string, index: number) => ({
              program_package_id: programPackageId,
              program_id: programId,
              position: index,
            })),
            delete_program_package_programs_id: programs
              .filter(program => !programsId.includes(program.id))
              .map(program => program.programPackageProgramId),
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            setVisible(false)
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(programPackageMessages.ui.connectProgram)}
        </Button>
      )}
      icon={<FileAddOutlined />}
      title={formatMessage(programPackageMessages.ui.connectProgram)}
      footer={null}
      destroyOnClose
      maskClosable={false}
      renderFooter={({ setVisible }) => (
        <div>
          <Button onClick={() => setVisible(false)} className="mr-2">
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          programValues: programs.map(program => `${program.id}_${program.title}`),
        }}
      >
        <Form.Item name="programValues">
          <TreeSelect
            treeCheckable
            multiple
            allowClear
            showSearch
            treeData={[
              {
                key: 'allPerpetualPrograms',
                title: formatMessage(programPackageMessages.form.allPerpetualPrograms),
                children: availablePrograms
                  .filter(program => !program.isSubscription)
                  .map(program => ({
                    key: program.id,
                    title: program.publishedAt
                      ? program.title
                      : `( ${formatMessage(programPackageMessages.status.unpublished)} ) ${program.title}`,
                    value: `${program.id}_${program.title}`,
                  })),
              },
              {
                key: 'allSubscriptionPrograms',
                title: formatMessage(programPackageMessages.form.allSubscriptionPrograms),
                children: availablePrograms
                  .filter(program => program.isSubscription)
                  .map(program => ({
                    key: program.id,
                    title: program.publishedAt
                      ? program.title
                      : `( ${formatMessage(programPackageMessages.status.unpublished)} ) ${program.title}`,
                    value: `${program.id}_${program.title}`,
                  })),
              },
            ]}
          />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const useGetAvailableProgramCollection = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_AVAILABLE_PROGRAM_COLLECTION,
    hasura.GET_AVAILABLE_PROGRAM_COLLECTIONVariables
  >(
    gql`
      query GET_AVAILABLE_PROGRAM_COLLECTION($appId: String!) {
        program(where: { is_deleted: { _eq: false }, app_id: { _eq: $appId } }) {
          id
          title
          is_subscription
          published_at
        }
      }
    `,
    { variables: { appId } },
  )

  const availablePrograms: {
    id: string
    title: string | null
    isSubscription: boolean
    publishedAt: string
  }[] =
    loading || error || !data
      ? []
      : data?.program.map(program => ({
          id: program.id,
          title: program.title || '',
          isSubscription: program.is_subscription,
          publishedAt: program.published_at,
        }))

  return {
    loading,
    error,
    availablePrograms,
    refetch,
  }
}

const INSERT_PROGRAM_PACKAGE_PROGRAM = gql`
  mutation INSERT_PROGRAM_PACKAGE_PROGRAM(
    $programs: [program_package_program_insert_input!]!
    $delete_program_package_programs_id: [uuid!]!
  ) {
    delete_program_tempo_delivery(where: { program_package_program_id: { _in: $delete_program_package_programs_id } }) {
      affected_rows
    }
    delete_program_package_program(where: { id: { _in: $delete_program_package_programs_id } }) {
      affected_rows
    }
    insert_program_package_program(
      objects: $programs
      on_conflict: {
        constraint: program_package_program_program_package_id_program_id_key
        update_columns: [program_package_id, position]
      }
    ) {
      affected_rows
    }
  }
`

export default ProgramPackageProgramConnectionModal
