import { render, screen } from '@testing-library/react'
import FilesTable from './FilesTable'

const rows = [
  { file: 'test1.csv', text: 'RgTya', number: 64075909, hex: '70ad29aacf0b690b0467fe2b2767f765' },
  { file: 'test2.csv', text: 'QweRty', number: 987654, hex: 'ffeeddccbbaa99887766554433221100' }
]

describe('FilesTable', () => {
  it('renders the exact required column headers', () => {
    render(<FilesTable rows={rows} />)

    expect(screen.getByRole('columnheader', { name: 'File Name' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Text' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Number' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Hex' })).toBeInTheDocument()
  })

  it('renders one row per entry in rows', () => {
    render(<FilesTable rows={rows} />)

    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1)
    expect(screen.getByText('test1.csv')).toBeInTheDocument()
    expect(screen.getByText('test2.csv')).toBeInTheDocument()
    expect(screen.getByText('64075909')).toBeInTheDocument()
  })

  it('renders only the header row when there are no rows', () => {
    render(<FilesTable rows={[]} />)

    expect(screen.getAllByRole('row')).toHaveLength(1)
  })
})
