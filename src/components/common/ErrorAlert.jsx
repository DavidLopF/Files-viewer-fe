import PropTypes from 'prop-types'
import { Alert, Button } from 'react-bootstrap'

const ErrorAlert = ({ message, onRetry }) => (
  <Alert variant='danger' className='files-alert'>
    <Alert.Heading as='h2' className='h5'>Algo salió mal</Alert.Heading>
    <p>{message}</p>
    <Button variant='danger' className='btn-retry' onClick={onRetry}>
      Reintentar
    </Button>
  </Alert>
)

ErrorAlert.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired
}

export default ErrorAlert
