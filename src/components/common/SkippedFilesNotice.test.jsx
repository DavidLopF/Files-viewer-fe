import { render, screen } from '@testing-library/react'
import SkippedFilesNotice from './SkippedFilesNotice'

describe('SkippedFilesNotice', () => {
  it('renders nothing when count is zero', () => {
    const { container } = render(<SkippedFilesNotice count={0} names={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('names every skipped file', () => {
    render(<SkippedFilesNotice count={2} names={['test4.csv', 'test5.csv']} />)

    expect(
      screen.getByText('2 archivos no se pudieron descargar del proveedor: test4.csv, test5.csv.')
    ).toBeInTheDocument()
  })

  it('uses singular wording for exactly one skipped file', () => {
    render(<SkippedFilesNotice count={1} names={['test4.csv']} />)

    expect(
      screen.getByText('1 archivo no se pudo descargar del proveedor: test4.csv.')
    ).toBeInTheDocument()
  })

  it('falls back to a plain count when no names are available', () => {
    render(<SkippedFilesNotice count={2} names={[]} />)

    expect(
      screen.getByText('2 archivos no se pudieron descargar del proveedor.')
    ).toBeInTheDocument()
  })
})
