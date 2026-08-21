import PropTypes from 'prop-types'
import { Table } from 'react-bootstrap'

const SkeletonBar = ({ width }) => (
  <span className='skeleton-bar' style={{ '--skeleton-width': width }} />
)

SkeletonBar.propTypes = {
  width: PropTypes.string.isRequired
}

/**
 * Table-shaped skeleton shown while the initial or a subsequent fetch is
 * in flight. A plain spinner would work too, but the API can take a few
 * seconds and a skeleton avoids the layout jump once the real rows land.
 */
const Loader = ({ rowCount = 6 }) => (
  <div className='files-table-wrapper'>
    <span className='visually-hidden'>Cargando datos de archivos</span>
    <Table responsive className='files-table mb-0'>
      <thead>
        <tr>
          <th scope='col'>File Name</th>
          <th scope='col'>Text</th>
          <th scope='col'>Number</th>
          <th scope='col'>Hex</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rowCount }).map((_, index) => (
          <tr key={index}>
            <td><SkeletonBar width='70%' /></td>
            <td><SkeletonBar width='55%' /></td>
            <td className='cell-number'><SkeletonBar width='40%' /></td>
            <td className='cell-hex'><SkeletonBar width='90%' /></td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
)

Loader.propTypes = {
  rowCount: PropTypes.number
}

export default Loader
