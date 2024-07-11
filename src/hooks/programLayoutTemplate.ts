import { useQuery, gql } from '@apollo/client';
import { first } from 'lodash';

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

type CustomAttribute = {
  id: string;
  name: string;
  type: string;
};

type LayoutTemplateCustomAttribute = {
  id: string;
  customAttributes: CustomAttribute[];
};

type ProgramLayoutTemplateConfig = {
  id: string;
  customAttributeValue: Record<string, any>;
};

const useProgramLayoutTemplate = (id: string) => {
  const {
    loading: layoutTemplateLoading,
    error,
    data,
  } = useQuery(GetProgramTemplateLayoutFormAndValue, {
    variables: { id },
  });

  // Ensure data is present and has the expected structure
  const rawLayoutTemplateDefinition = data?.program_layout_template_config?.length
    ? (first(data.program_layout_template_config) as any).program_layout_template
    : null;
  const rawLayoutTemplateFormValue = data?.program_layout_template_config?.length
    ? first(data.program_layout_template_config) as any
    : null;

  const customAttributesDefinitions: LayoutTemplateCustomAttribute | null = rawLayoutTemplateDefinition
    ? {
        id: rawLayoutTemplateDefinition.id,
        customAttributes: rawLayoutTemplateDefinition.module_name.map(
          (v: { id: string; name: string; type: string }) => ({
            id: v.id,
            name: v.name,
            type: v.type,
          })
        ),
      }
    : null;

  const customAttributesFormValue: ProgramLayoutTemplateConfig | null = rawLayoutTemplateFormValue
    ? {
        id: rawLayoutTemplateFormValue.id,
        customAttributeValue: rawLayoutTemplateFormValue.module_data as Record<string, any>,
      }
    : null;

  return { layoutTemplateLoading, error, customAttributesDefinitions, customAttributesFormValue };
};

export default useProgramLayoutTemplate;
