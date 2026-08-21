import PropTypes from 'prop-types'
import { Container } from 'react-bootstrap'

const AppLayout = ({ children }) => (
  <>
    <header className='app-header'>
      <Container fluid='md'>
        <h1 className='app-header__title'>Visor de Archivos</h1>
        <p className='app-header__subtitle'>Explora y filtra los datos extraídos de los archivos procesados</p>
      </Container>
    </header>
    <Container fluid='md' className='app-content'>
      {children}
    </Container>
  </>
)

AppLayout.propTypes = {
  children: PropTypes.node.isRequired
}

export default AppLayout
