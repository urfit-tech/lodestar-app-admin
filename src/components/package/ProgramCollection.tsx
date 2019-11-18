import { Button, Typography } from 'antd'
import { uniq } from 'ramda'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'

const StyledCategoryButton = styled(Button)<{ selected?: boolean }>`
  transition: background-color 0.2s ease-in-out;

  &,
  &:active,
  &:hover,
  &:focus {
    background-color: ${props => (props.selected ? props.theme['@primary-color'] : 'transparent')};
    color: ${props => (props.selected ? 'white' : props.theme['@primary-color'])};
  }
`
const StyledProgramCover = styled.div<{ src: string }>`
  padding-top: 56.25%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: 4px;
`
const StyledProgramTitle = styled(Typography.Title)`
  && {
    height: 3rem;
    overflow: hidden;
    color: var(--gray-darker);
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
  }
`

type ProgramCollectionProps = {
  programs: {
    id: string
    title: string
    coverUrl?: string
    categories: {
      id: string
      name: string
    }[]
  }[]
}
const ProgramCollection: React.FC<ProgramCollectionProps> = ({ programs }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = uniq(programs.map(program => program.categories).flat())

  return (
    <div>
      <div className="container py-5">
        <div className="d-flex align-items-center justify-content-start flex-wrap mb-5">
          <StyledCategoryButton
            type="link"
            shape="round"
            className="mr-2"
            onClick={() => setSelectedCategory(null)}
            selected={!selectedCategory}
          >
            全部分類
          </StyledCategoryButton>

          {categories.map(category => (
            <StyledCategoryButton
              key={category.id}
              type="link"
              shape="round"
              className="mr-2"
              onClick={() => setSelectedCategory(category.id)}
              selected={selectedCategory === category.id}
            >
              {category.name}
            </StyledCategoryButton>
          ))}
        </div>

        <div className="row">
          {programs
            .filter(
              program =>
                !selectedCategory || program.categories.map(category => category.id).includes(selectedCategory),
            )
            .map(program => (
              <div key={program.id} className="col-12 col-md-6 col-lg-4 mb-4">
                <Link to={`/programs/${program.id}/contents`}>
                  <StyledProgramCover className="mb-3" src={program.coverUrl || EmptyCover} />
                  <StyledProgramTitle level={2} ellipsis={{ rows: 2 }}>
                    {program.title}
                  </StyledProgramTitle>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ProgramCollection
