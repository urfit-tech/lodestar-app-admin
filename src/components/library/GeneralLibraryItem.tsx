import React from 'react'

const GeneralLibraryItem: React.VFC<{ name: string }> = ({ name }) => {
  return <div className="mb-3">{name}</div>
}

export default GeneralLibraryItem
