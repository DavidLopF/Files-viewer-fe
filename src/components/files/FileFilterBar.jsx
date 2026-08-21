import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'

const FileFilterBar = ({
  searchText,
  onSearchTextChange,
  onSearchSubmit,
  availableFiles,
  activeFileName,
  onFileNameSelect,
  onClear
}) => (
  <Form className='files-toolbar'>
    <Row className='g-3 align-items-end'>
      <Col xs={12} md={5}>
        <Form.Group controlId='fileNameSearch'>
          <Form.Label>Filtrar por nombre de archivo</Form.Label>
          <Form.Control
            type='text'
            autoComplete='off'
            placeholder='ej. test1.csv'
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSearchSubmit()
              }
            }}
          />
        </Form.Group>
      </Col>
      <Col xs={12} md={5}>
        <Form.Group controlId='fileNameSelect'>
          <Form.Label>Cargar un archivo específico del servidor</Form.Label>
          <Form.Select
            value={activeFileName}
            onChange={(event) => onFileNameSelect(event.target.value)}
          >
            <option value=''>Todos los archivos</option>
            {availableFiles.map((fileName) => (
              <option key={fileName} value={fileName}>{fileName}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col xs={12} md={2}>
        <Button type='button' variant='outline-secondary' className='btn-clear w-100' onClick={onClear}>
          Limpiar
        </Button>
      </Col>
    </Row>
  </Form>
)

FileFilterBar.propTypes = {
  searchText: PropTypes.string.isRequired,
  onSearchTextChange: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  availableFiles: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeFileName: PropTypes.string.isRequired,
  onFileNameSelect: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
}

export default FileFilterBar
