import PropTypes from 'prop-types'
import { Table } from 'react-bootstrap'
import FileRow from './FileRow'

const defaultRenderRow = (row, key) => <FileRow key={key} row={row} />

/**
 * Purely presentational table. Row rendering is injected via `renderRow`
 * so callers can customize it without threading extra boolean props
 * through the component.
 */
const FilesTable = ({ rows, renderRow = defaultRenderRow }) => (
  <div className='files-table-wrapper'>
    <Table responsive className='files-table files-table--striped mb-0'>
      <thead>
        <tr>
          <th scope='col'>File Name</th>
          <th scope='col'>Text</th>
          <th scope='col'>Number</th>
          <th scope='col'>Hex</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => renderRow(row, `${row.file}-${index}`))}
      </tbody>
    </Table>
  </div>
)

FilesTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      file: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      number: PropTypes.number.isRequired,
      hex: PropTypes.string.isRequired
    })
  ).isRequired,
  renderRow: PropTypes.func
}

export default FilesTable
