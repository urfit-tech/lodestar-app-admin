import { gql, useMutation } from '@apollo/client';

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

