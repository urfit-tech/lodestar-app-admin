import React from 'react'

const ImageLibraryItem: React.VFC<{ name: string }> = ({ name }) => {
  return <div className="mb-3">{name}</div>
}

export default ImageLibraryItem
