import { Button, InputNumber } from 'antd'
import { useIntl } from 'react-intl'
import { ProjectPlanProduct } from '../../types/project'
import ProductSelector from '../form/ProductSelector'
import projectMessages from './translation'

type ProjectPlanProductSelectorProps = {
  value?: ProjectPlanProduct[]
  onChange?: (value: ProjectPlanProduct[]) => void
}
const ProjectPlanProductSelector: React.FC<ProjectPlanProductSelectorProps> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const projectPlanProducts = value || []
  return (
    <div>
      {projectPlanProducts.map((projectPlanProduct, idx) => {
        return (
          <div className="d-flex mb-1">
            <ProductSelector
              value={projectPlanProduct.id ? [projectPlanProduct.id] : []}
              onChange={products =>
                onChange?.([
                  ...projectPlanProducts.slice(0, idx),
                  { id: products[0] || '', options: projectPlanProduct.options },
                  ...projectPlanProducts.slice(idx + 1),
                ])
              }
              allowTypes={['ProgramPlan', 'ProgramPackagePlan', 'ActivityTicket', 'PodcastProgram', 'Card']}
            />
            <InputNumber
              className="ml-1"
              value={projectPlanProduct.options.quantity || 1}
              onChange={v =>
                onChange?.([
                  ...projectPlanProducts.slice(0, idx),
                  { id: projectPlanProduct.id, options: { quantity: Number(v) } },
                  ...projectPlanProducts.slice(idx + 1),
                ])
              }
            />
          </div>
        )
      })}
      <Button type="link" onClick={() => onChange?.([...(value || []), { id: '', options: {} }])}>
        {formatMessage(projectMessages.ProjectPlanAdminModal.addDeliverables)}
      </Button>
    </div>
  )
}

export default ProjectPlanProductSelector
