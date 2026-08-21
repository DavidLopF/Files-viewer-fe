import { memo } from 'react'
import PropTypes from 'prop-types'

const FileRow = ({ row }) => (
  <tr>
    <td>{row.file}</td>
    <td>{row.text}</td>
    <td className='cell-number'>{row.number}</td>
    <td className='cell-hex'>{row.hex}</td>
  </tr>
)

FileRow.propTypes = {
  row: PropTypes.shape({
    file: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    number: PropTypes.number.isRequired,
    hex: PropTypes.string.isRequired
  }).isRequired
}

export default memo(FileRow)
