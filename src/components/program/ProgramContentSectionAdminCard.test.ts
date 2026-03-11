import fs from 'fs'
import path from 'path'

const source = fs.readFileSync(path.resolve(__dirname, 'ProgramContentSectionAdminCard.tsx'), 'utf8')

const mutationMatch = source.match(/const DELETE_PROGRAM_CONTENT_SECTION = gql`([\s\S]*?)`/)

describe('DELETE_PROGRAM_CONTENT_SECTION mutation', () => {
  it('deletes program content dependencies before deleting the section contents', () => {
    expect(mutationMatch).not.toBeNull()

    const mutation = mutationMatch?.[1] || ''
    const deleteProgramContentIndex = mutation.indexOf('delete_program_content(where:')
    const dependentDeletes = [
      'delete_program_content_plan',
      'delete_program_content_video',
      'delete_program_content_audio',
      'delete_program_content_material',
      'delete_practice',
      'delete_program_content_progress',
      'delete_program_content_log',
      'delete_program_content_ebook_toc_progress',
      'delete_program_content_ebook_toc',
      'delete_program_content_ebook',
      'delete_exercise',
    ]

    dependentDeletes.forEach(operationName => {
      const operationIndex = mutation.indexOf(operationName)
      expect(operationIndex).toBeGreaterThanOrEqual(0)
      expect(operationIndex).toBeLessThan(deleteProgramContentIndex)
    })
  })
})
