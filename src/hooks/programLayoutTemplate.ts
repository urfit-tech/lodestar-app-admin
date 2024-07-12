import { useQuery, gql, useMutation } from '@apollo/client';
import { first } from 'lodash';
import moment, { MomentInput } from 'moment';

const GetProgramTemplateLayoutFormAndValue = gql`
  query GetProgramTemplateLayoutFormAndValue($id: uuid!) {
    program_layout_template_config(where: { id: { _eq: $id } }) {
      module_data
      id
      program_layout_template {
        id
        module_name
      }
    }
  }
`;

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

type CustomAttribute = {
  id: string;
  name: string;
  type: "Number" | "Date" | "Text";
};

type LayoutTemplateCustomAttribute = {
  id: string;
  customAttributes: CustomAttribute[];
};

type ProgramLayoutTemplateConfig = {
  id: string;
  customAttributeValue: Record<string, any>;
};

export const useProgramLayoutTemplate = (id: string) => {
  const {
    loading: layoutTemplateLoading,
    error,
    data,
    refetch
  } = useQuery(GetProgramTemplateLayoutFormAndValue, {
    variables: { id },
  });

  const rawLayoutTemplateDefinition = data?.program_layout_template_config?.length
    ? (first(data.program_layout_template_config) as any).program_layout_template
    : null;
  const rawLayoutTemplateFormValue = data?.program_layout_template_config?.length
    ? first(data.program_layout_template_config) as any
    : null;

    const customAttributesDefinitions: LayoutTemplateCustomAttribute | null = rawLayoutTemplateDefinition
    ? {
        id: rawLayoutTemplateDefinition.id,
        customAttributes: rawLayoutTemplateDefinition.module_name.map((v: { id: string; name: string; type: string }) => ({
          id: v.id,
          name: v.name,
          type: v.type === 'Number' || v.type === 'Date' || v.type === 'Text' ? v.type : 'Text',
        })),
      }
    : null;
    
    const isMomentInput = (value: any): value is MomentInput => {
      return moment(value).isValid();
    };
    
    const customAttributesFormValue: ProgramLayoutTemplateConfig | null = rawLayoutTemplateFormValue
      ? {
          id: rawLayoutTemplateFormValue.id,
          customAttributeValue: Object.fromEntries(
            Object.entries(rawLayoutTemplateFormValue.module_data).map(([key, value]) => {
              const attributeDefinition = customAttributesDefinitions?.customAttributes.find(attr => attr.id === key);
              if (attributeDefinition && attributeDefinition.type === 'Date' && isMomentInput(value)) {
                return [key, moment(value)];
              }
              return [key, value];
            })
          ),
        }
      : null;
    
  

  return { layoutTemplateLoading, error, customAttributesDefinitions, customAttributesFormValue, refetchLayoutTemplate: refetch };
};


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

