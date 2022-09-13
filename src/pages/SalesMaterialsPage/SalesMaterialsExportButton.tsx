import { ExportOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { downloadCSV, handleError, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'

const SalesMaterialsExportButton: React.FC<{
  selectedMaterialName: string
  allMaterialNames: string[]
  salesMaterials: {
    calledMembersCount: {
      [index: string]: number
    }
    contactedMembersCount: {
      [index: string]: number
    }
    demoInvitedMembersCount: {
      [index: string]: number
    }
    demonstratedMembersCount: {
      [index: string]: number
    }
    dealtMembersCount: {
      [index: string]: number
    }
    rejectedMembersCount: {
      [index: string]: number
    }
  }
}> = ({ selectedMaterialName, allMaterialNames, salesMaterials }) => {
  const { formatMessage } = useIntl()
  const [loadingSalesMaterials, setSalesMaterials] = useState(false)

  const exportSalesMaterials = async () => {
    try {
      setSalesMaterials(true)
      const csvColumns = [selectedMaterialName, '已撥打', '已開發', '已邀約', '已示範', '已成交', '已拒絕']

      const csvRows: string[][] = Object.keys(salesMaterials.calledMembersCount).map(key => [
        key,
        salesMaterials?.calledMembersCount[key].toString(),
        salesMaterials?.contactedMembersCount[key] ? salesMaterials.contactedMembersCount[key].toString() : '0',
        salesMaterials?.demoInvitedMembersCount[key] ? salesMaterials.demoInvitedMembersCount[key].toString() : '0',
        salesMaterials?.demonstratedMembersCount[key] ? salesMaterials.demonstratedMembersCount[key].toString() : '0',
        salesMaterials?.dealtMembersCount[key] ? salesMaterials.dealtMembersCount[key].toString() : '0',
        salesMaterials?.rejectedMembersCount[key] ? salesMaterials.rejectedMembersCount[key].toString() : '0',
      ])

      downloadCSV(`${selectedMaterialName}.csv`, toCSV([csvColumns, ...csvRows]))
    } catch (error) {
      handleError(error)
    }
    setSalesMaterials(false)
  }

  return (
    <Button icon={<ExportOutlined />} loading={loadingSalesMaterials} onClick={() => exportSalesMaterials()}>
      {formatMessage(commonMessages.ui.export)}
    </Button>
  )
}

export default SalesMaterialsExportButton
