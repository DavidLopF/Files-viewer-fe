import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileFilterBar from './FileFilterBar'

const renderFilterBar = (overrides = {}) => {
  const props = {
    searchText: '',
    onSearchTextChange: jest.fn(),
    onSearchSubmit: jest.fn(),
    availableFiles: ['test1.csv', 'test2.csv'],
    activeFileName: '',
    onFileNameSelect: jest.fn(),
    onClear: jest.fn(),
    ...overrides
  }

  render(<FileFilterBar {...props} />)
  return props
}

describe('FileFilterBar', () => {
  it('reports every keystroke typed into the text filter', async () => {
    const user = userEvent.setup()
    const props = renderFilterBar()

    await user.type(screen.getByLabelText('Filtrar por nombre de archivo'), 'test1')

    expect(props.onSearchTextChange).toHaveBeenCalledTimes(5)
    expect(props.onSearchTextChange).toHaveBeenLastCalledWith('1')
  })

  it('calls onSearchSubmit when Enter is pressed in the text filter', async () => {
    const user = userEvent.setup()
    const props = renderFilterBar({ searchText: 'test1.csv' })

    await user.type(screen.getByLabelText('Filtrar por nombre de archivo'), '{Enter}')

    expect(props.onSearchSubmit).toHaveBeenCalledTimes(1)
  })

  it('lists the available files in the server-side select', () => {
    renderFilterBar()

    const select = screen.getByLabelText('Cargar un archivo específico del servidor')
    expect(screen.getByRole('option', { name: 'Todos los archivos' })).toBeInTheDocument()
    expect(select).toHaveTextContent('test1.csv')
    expect(select).toHaveTextContent('test2.csv')
  })

  it('calls onFileNameSelect when a file is chosen from the select', async () => {
    const user = userEvent.setup()
    const props = renderFilterBar()

    await user.selectOptions(screen.getByLabelText('Cargar un archivo específico del servidor'), 'test1.csv')

    expect(props.onFileNameSelect).toHaveBeenCalledWith('test1.csv')
  })

  it('calls onClear when the clear button is pressed', async () => {
    const user = userEvent.setup()
    const props = renderFilterBar()

    await user.click(screen.getByRole('button', { name: 'Limpiar' }))

    expect(props.onClear).toHaveBeenCalledTimes(1)
  })
})
