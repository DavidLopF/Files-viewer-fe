import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { rest } from 'msw'
import App from '../src/App'
import filesReducer from '../src/store/filesSlice'
import { server } from './mocks/server'
import { fullDataset } from './fixtures/filesData'

const API_BASE_URL = 'http://localhost:3000'

const renderApp = () => {
  const store = configureStore({ reducer: { files: filesReducer } })
  render(
    <Provider store={store}>
      <App />
    </Provider>
  )
}

describe('App integration', () => {
  it('shows a loading state and then the populated table', async () => {
    renderApp()

    expect(screen.getAllByRole('row').length).toBeGreaterThan(1)

    await waitFor(() => expect(screen.getByRole('cell', { name: 'RgTya' })).toBeInTheDocument())
    expect(screen.getAllByRole('cell', { name: 'test1.csv' })).toHaveLength(2)
  })

  it('shows an error alert when the API responds with 502', async () => {
    server.use(
      rest.get(`${API_BASE_URL}/files/data`, (req, res, ctx) =>
        res(
          ctx.status(502),
          ctx.json({ error: { code: 'UPSTREAM_ERROR', message: 'Upstream failed to respond' } })
        )
      )
    )

    renderApp()

    expect(await screen.findByText('Upstream failed to respond')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('shows the skipped files notice, naming which files failed', async () => {
    server.use(
      rest.get(`${API_BASE_URL}/files/data`, (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.set('X-Skipped-Files', '2'),
          ctx.set('X-Skipped-File-Names', JSON.stringify(['test4.csv', 'test5.csv'])),
          ctx.json([])
        )
      )
    )

    renderApp()

    expect(
      await screen.findByText('2 archivos no se pudieron descargar del proveedor: test4.csv, test5.csv.')
    ).toBeInTheDocument()
  })

  it('shows an error alert, not an empty state, when a requested file 404s', async () => {
    server.use(
      rest.get(`${API_BASE_URL}/files/data`, (req, res, ctx) => {
        const fileName = req.url.searchParams.get('fileName')
        if (fileName === 'missing.csv') {
          return res(
            ctx.status(404),
            ctx.json({ error: { code: 'FILE_NOT_FOUND', message: "File 'missing.csv' was not found" } })
          )
        }
        return res(ctx.status(200), ctx.set('X-Skipped-Files', '0'), ctx.json([]))
      }),
      rest.get(`${API_BASE_URL}/files/list`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ files: ['missing.csv'] }))
      )
    )

    renderApp()

    await screen.findByRole('option', { name: 'missing.csv' })
    const select = screen.getByLabelText('Cargar un archivo específico del servidor')
    await userEvent.setup().selectOptions(select, 'missing.csv')

    expect(await screen.findByText("File 'missing.csv' was not found")).toBeInTheDocument()
    expect(screen.queryByText('Ningún archivo coincide con el filtro actual.')).not.toBeInTheDocument()
  })

  it('searches the server for a substring once typing settles, returning every match', async () => {
    server.use(
      rest.get(`${API_BASE_URL}/files/data`, (req, res, ctx) => {
        const fileName = req.url.searchParams.get('fileName')
        if (fileName === 'rep') {
          return res(
            ctx.status(200),
            ctx.set('X-Skipped-Files', '0'),
            ctx.json([
              { file: 'report-a.csv', lines: [{ text: 'Alpha', number: 1, hex: 'aa' }] },
              { file: 'report-b.csv', lines: [{ text: 'Beta', number: 2, hex: 'bb' }] }
            ])
          )
        }
        return res(ctx.status(200), ctx.set('X-Skipped-Files', '0'), ctx.json(fullDataset))
      })
    )

    renderApp()

    await waitFor(() => expect(screen.getByRole('cell', { name: 'RgTya' })).toBeInTheDocument())

    const input = screen.getByLabelText('Filtrar por nombre de archivo')
    await userEvent.setup().type(input, 'rep')

    expect(await screen.findByRole('cell', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Beta' })).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'RgTya' })).not.toBeInTheDocument()
  })

  it('narrows to a single file once the typed substring only matches one', async () => {
    renderApp()

    await waitFor(() => expect(screen.getByRole('cell', { name: 'RgTya' })).toBeInTheDocument())

    const input = screen.getByLabelText('Filtrar por nombre de archivo')
    await userEvent.setup().type(input, 'test2')

    await waitFor(() => expect(screen.queryByRole('cell', { name: 'test1.csv' })).not.toBeInTheDocument())
    expect(screen.getByRole('cell', { name: 'test2.csv' })).toBeInTheDocument()
  })

  it('shows a not-found error when the typed search matches no file', async () => {
    renderApp()

    await waitFor(() => expect(screen.getByRole('cell', { name: 'RgTya' })).toBeInTheDocument())

    const input = screen.getByLabelText('Filtrar por nombre de archivo')
    await userEvent.setup().type(input, 'zzz')

    expect(await screen.findByText("File 'zzz' was not found")).toBeInTheDocument()
  })

  it('searches immediately when Enter is pressed, bypassing the debounce', async () => {
    renderApp()

    await waitFor(() => expect(screen.getByRole('cell', { name: 'RgTya' })).toBeInTheDocument())

    const input = screen.getByLabelText('Filtrar por nombre de archivo')
    await userEvent.setup().type(input, 'test2{Enter}')

    await waitFor(() => expect(screen.queryByRole('cell', { name: 'test1.csv' })).not.toBeInTheDocument())
    expect(screen.getByRole('cell', { name: 'test2.csv' })).toBeInTheDocument()
  })
})
