import PropTypes from 'prop-types'
import { Alert } from 'react-bootstrap'

const SkippedFilesNotice = ({ count, names = [] }) => {
  if (count <= 0) return null

  const isSingular = count === 1
  const noun = isSingular ? 'archivo' : 'archivos'
  const verb = isSingular ? 'pudo' : 'pudieron'

  return (
    <Alert variant='warning' className='files-alert py-2'>
      {count} {noun} no se {verb} descargar del proveedor
      {names.length > 0 ? `: ${names.join(', ')}.` : '.'}
    </Alert>
  )
}

SkippedFilesNotice.propTypes = {
  count: PropTypes.number.isRequired,
  names: PropTypes.arrayOf(PropTypes.string)
}

export default SkippedFilesNotice
