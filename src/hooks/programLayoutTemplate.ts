import { gql, useApolloClient, useMutation  } from '@apollo/client';

const UpdateTemplateCustomAttributeFormValue = gql`
  mutation UpdateTemplateCustomAttributeFormValue(
    $programId: uuid!,
    $programLayoutTemplateConfigId: uuid!,
    $moduleData: jsonb!
  ) {
    update_program_layout_template_config(
      where: {
        program_id: { _eq: $programId },
        id: { _eq: $programLayoutTemplateConfigId },
        is_active: { _eq: true }
      },
      _set: { module_data: $moduleData }
    ) {
      affected_rows
    }
  }
`


const UpdateTemplateForProgram = gql`
  mutation updateTemplateForProgram($programId: uuid, $program_layout_template_config_id: uuid) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: { program_layout_template_config_id: $program_layout_template_config_id }
    ) {
      affected_rows
    }
  }
`

const GetProgramLayoutConfigId =gql`
  query GetProgramLayoutConfigId($programId: uuid, $programLayoutTemplateId: uuid) {
  program_layout_template_config(where: { program_id: { _eq: $programId }, program_layout_template_id: { _eq: $programLayoutTemplateId } }) {
    id
  }
}
`
const InsertProgramLayoutTemplateConfig = gql`
  mutation InsertProgramLayoutTemplateConfig($program_id: uuid!, $program_layout_template_id: uuid!) {
    insert_program_layout_template_config(objects: {program_id: $program_id, program_layout_template_id: $program_layout_template_id}) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

export const useUpdateCustomAttributeFormValue = (programId: string, programLayoutTemplateConfigId: string) => {
  const [updateCustomAttributesValueGql, { loading, error, data }] = useMutation(
    UpdateTemplateCustomAttributeFormValue
  );

  const updateCustomAttributesValue = async (moduleData: Record<string, any>) => {
    try {
      const response = await updateCustomAttributesValueGql({
        variables: {
          programId,
          programLayoutTemplateConfigId,
          moduleData,
        },
      });
      return response;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { updateCustomAttributesValue, loading, error, data };
};


export const useActivatedTemplateForProgram = () => {
  const [updateTemplateForProgram] = useMutation(UpdateTemplateForProgram);
  const [insertProgramLayoutTemplateConfig] = useMutation(InsertProgramLayoutTemplateConfig)
  const queryClient = useApolloClient()

  const activatedTemplateForProgram = async (
    programId: string,
    programLayoutTemplateId: string | null
  ): Promise<{ success: boolean; configId: string | null }> => {
    if (!programLayoutTemplateId) {
      await updateTemplateForProgram({
        variables: {
          programId,
          program_layout_template_config_id: null,
        },
      });
      return { success: true, configId: null };
    }
  
    try {
      const { data } = await queryClient.query({
        query: GetProgramLayoutConfigId,
        variables: {
          programId,
          programLayoutTemplateId,
        },
      });
  
      const existConfigId = data?.program_layout_template_config?.[0]?.id;
      let configId = existConfigId;
  
      if (!existConfigId) {
        const activateResult = await insertProgramLayoutTemplateConfig({
          variables: {
            program_id: programId,
            program_layout_template_id: programLayoutTemplateId,
          },
        });
  
        const returningArray = activateResult?.data?.insert_program_layout_template_config?.returning;
  
        const insertConfigId = returningArray?.[0]?.id;
        configId = insertConfigId ?? null;
      }
  
      await updateTemplateForProgram({
        variables: {
          programId,
          program_layout_template_config_id: configId,
        },
      });
  
      return { success: true, configId };
    } catch (error) {
      console.error('Error during activation and update:', error);
      throw error;
    }
  };
  
  
  return {
    activatedTemplateForProgram,
  };
};
