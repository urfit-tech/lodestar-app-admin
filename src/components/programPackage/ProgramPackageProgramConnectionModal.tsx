import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, Icon, message, TreeSelect } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, programPackageMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPackageProgramProps } from '../../types/programPackage'
import AdminModal from '../admin/AdminModal'

type ProgramPackageProgramConnectionModalProps = { programPackageId: string } & ProgramPackageProgramProps &
  FormComponentProps

const ProgramPackageProgramConnectionModal: React.FC<ProgramPackageProgramConnectionModalProps> = ({
  programPackageId,
  programs,
  onRefetch,
  form: { getFieldDecorator, validateFields, resetFields },
}) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useContext(AppContext)
  const { perpetualPrograms } = useGetPerpetualProgramCollection(appId)
  const [isLoading, setLoading] = useState<boolean>(false)
  const updateProgramPackageProgram = useUpdateProgramPackageProgram(programPackageId)

  const handleSubmit = (onVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    validateFields((error, { programValues }) => {
      if (error) return

      setLoading(true)

      const programIds = programValues.map((value: string) => value.split('_')[0])

      updateProgramPackageProgram(programIds)
        .then(() => {
          onRefetch && onRefetch()
          onVisible(false)
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .catch(err => handleError(err))
        .finally(() => setLoading(false))
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
          {formatMessage(programPackageMessages.ui.connectProgram)}
        </Button>
      )}
      icon={<Icon type="file-add" />}
      title={formatMessage(programPackageMessages.ui.connectProgram)}
      renderFooter={({ setVisible }) => (
        <div>
          <Button
            onClick={() => {
              setVisible(false)
              resetFields()
            }}
            className="mr-2"
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      )}
    >
      <Form>
        <Form.Item>
          {getFieldDecorator('programValues', {
            initialValue: programs.map(program => `${program.id}_${program.title}`),
          })(
            <TreeSelect
              treeCheckable
              multiple
              allowClear
              showSearch
              treeData={[
                {
                  key: 'allPerpetualPrograms',
                  title: '所有單次課程',
                  children: perpetualPrograms.map(program => ({
                    key: program.id,
                    title: program.title,
                    value: `${program.id}_${program.title}`,
                  })),
                },
              ]}
            />,
          )}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const useGetPerpetualProgramCollection = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PERPETUAL_PROGRAM_COLLECTION,
    types.GET_PERPETUAL_PROGRAM_COLLECTIONVariables
  >(
    gql`
      query GET_PERPETUAL_PROGRAM_COLLECTION($appId: String!) {
        program(where: { _and: [{ is_subscription: { _eq: false } }, { app_id: { _eq: $appId } }] }) {
          id
          title
        }
      }
    `,
    { variables: { appId } },
  )

  const perpetualPrograms: {
    id: string
    title: string | null
  }[] =
    loading || error || !data
      ? []
      : data?.program.map(program => ({
          id: program.id,
          title: program.title,
        }))

  return {
    loading,
    error,
    perpetualPrograms,
    refetch,
  }
}

const useUpdateProgramPackageProgram = (programPackageId: string) => {
  const [updateProgramPackageProgramHandler] = useMutation(gql`
    mutation UPDATE_PROGRAM_PACKAGE_PROGRAM(
      $programPackageId: uuid!
      $programs: [program_package_program_insert_input!]!
    ) {
      delete_program_package_program(where: { program_package_id: { _eq: $programPackageId } }) {
        affected_rows
      }
      insert_program_package_program(objects: $programs) {
        affected_rows
      }
    }
  `)

  const updateProgramPackageProgram = (programIds: String[]) => {
    return updateProgramPackageProgramHandler({
      variables: {
        programPackageId,
        programs: programIds.map((programId, index) => ({
          program_package_id: programPackageId,
          program_id: programId,
          position: index,
        })),
      },
    })
  }

  return updateProgramPackageProgram
}

export default Form.create<ProgramPackageProgramConnectionModalProps>()(ProgramPackageProgramConnectionModal)
