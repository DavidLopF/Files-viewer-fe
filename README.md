# Files Viewer — Frontend

Cliente web de la prueba técnica: una SPA en React que consume el API REST del backend, aplana la respuesta en una tabla y permite filtrarla por nombre de archivo.

## 1. Cómo levantarlo

### Con npm

Requiere Node.js 16 (fijado en `.nvmrc`). El API debe estar corriendo en `http://localhost:3000` — no hace falta ninguna variable de entorno.

```bash
nvm use
npm ci
npm start
```

La app queda disponible en `http://localhost:8080`.

Otros scripts:

```bash
npm run build   # bundle de producción en dist/
npm test        # suite de Jest, sin red
npm run lint    # StandardJS
```

### Con Docker

```bash
docker build -t files-viewer-web .
docker run -p 8080:8080 files-viewer-web
```

El API debe seguir corriendo en `localhost:3000` del host: `API_BASE_URL` se hornea en el bundle en tiempo de build (ver sección 3.9) y apunta ahí por defecto, así que basta con que el contenedor del backend publique ese puerto.

## 2. Flujo de datos

```
filesApi.js  →  fetchFilesData (thunk)  →  filesSlice  →  selectors  →  FilesTableContainer  →  FilesTable / FileRow
```

- **`services/filesApi.js`** es la única frontera con la red: configura axios, aplica timeout y normaliza cualquier error (de la API o de red) a `{ code, message }`.
- **`filesSlice`** guarda la última respuesta cruda del API, el `fileName` activo (el último filtro efectivamente aplicado) y el `searchText` (el texto que el usuario está escribiendo en ese momento), y expone una máquina de estados `idle / loading / success / error`.
- **`selectors.js`** deriva las filas visibles aplanando la respuesta anidada (`flattenFilesData`). No vuelve a filtrar nada: el propio API ya devuelve exactamente el conjunto solicitado. Nada derivable vive en el store.
- **`FilesTableContainer`** es el único componente conectado al store (vía los hooks `useFilesData` y `useFileNameFilter`). Decide qué vista mostrar según el estado de la máquina.
- **`FilesTable` / `FileRow`** son puramente presentacionales: reciben props, no conocen Redux ni axios, y se testean de forma aislada con React Testing Library.

Esta separación contenedor/presentacional es la que permite testear la tabla sin levantar store ni red, y sustituir la fuente de datos (Redux hoy, cualquier otra cosa mañana) sin tocar el render.

## 3. Decisiones y trade-offs

### 3.1 Redux Toolkit, no Redux clásico

El enunciado lo marca como opcional; se implementó para cubrir ese punto. Para el alcance real de esta app —una tabla con un filtro— `useReducer` + Context habría sido suficiente y con menos ceremonia. Se usó Redux Toolkit (`createSlice` + `createAsyncThunk`) en vez de Redux con action types escritos a mano porque, si se va a usar Redux, hacerlo sin RTK hoy es puro boilerplate evitable. Reconocer que la herramienta excede lo necesario para el problema es parte de la decisión, no un defecto.

### 3.2 Filtro por nombre: búsqueda real contra el backend, con debounce y protección contra respuestas fuera de orden

`GET /files/data?fileName=` hace **coincidencia por substring**, case-insensitive, contra el catálogo (`catalog.filter(name => name.includes(fileName))` en el backend — ver `api/src/application/getFilesData.js`), y devuelve un archivo por cada nombre que matchea. No es una búsqueda por clave exacta: es un buscador real, así que filtrar en cliente sobre los datos ya cargados no tendría sentido — esos datos pueden ser solo un archivo si el usuario venía de una búsqueda anterior, y filtrar localmente escondería archivos que sí existen en el servidor pero no están descargados todavía. Cualquier acotación por nombre tiene que ir contra el backend.

El texto libre y el `<select>` son entonces dos formas de disparar la **misma** petición (`fetchFilesData({ fileName })`), no dos mecanismos independientes:

- **Escribir un nombre**: cada tecleo reinicia un debounce de 300 ms; al asentarse, dispara la búsqueda con lo que haya en el input en ese momento. Como ahora cualquier substring no vacío es una consulta legítima (a diferencia de una versión anterior de este filtro, que exigía coincidencia exacta contra la lista de nombres ya cargada), el debounce es necesario: sin él, cada tecla dispararía una petición de red. Vaciar el campo sí dispara al instante, sin esperar el debounce, porque recargar todo no necesita confirmación.
- **Presionar Enter**: cancela el debounce pendiente y busca de inmediato con el texto actual.
- **Elegir del `<select>`**: dispara la misma búsqueda y además sincroniza el texto del input con el nombre elegido, para que ambos controles nunca queden desalineados.

Se descartó el `<datalist>` nativo del navegador para sugerir nombres mientras se escribe: su listbox no se puede tematizar (aparece como una lista negra sin relación visual con el resto de la UI) y ya no hace falta — el backend valida y devuelve resultados reales para cualquier texto, no solo para nombres completos conocidos de antemano.

**Respuestas fuera de orden.** Con una búsqueda en vivo, nada garantiza que las respuestas del servidor lleguen en el mismo orden en que se dispararon las peticiones: escribir "test", pausar, seguir escribiendo "test1" puede hacer que la respuesta de "test" (más resultados, quizás más lenta) llegue después que la de "test1". `filesSlice` guarda `currentRequestId` — el `requestId` de la última petición despachada — y en `fulfilled`/`rejected` descarta cualquier resultado cuyo `requestId` no sea ese. Es el patrón estándar de RTK para "solo importa la respuesta más reciente" sin necesidad de cancelar la petición en curso.

El store guarda una única colección — la última respuesta del API — más `fileName` (el filtro realmente aplicado) y `searchText` (lo que hay tecleado en ese momento, que puede ir por delante de `fileName` mientras el usuario todavía está escribiendo o esperando el debounce). Las filas visibles se derivan siempre de esa colección; nunca se guarda una copia "completa" en paralelo para "restaurarla". Por eso **Clear** no restaura nada desde memoria: dispara un refetch con `fileName` vacío.

### 3.3 Máquina de estados en vez de flags

`filesSlice` expone `status: 'idle' | 'loading' | 'success' | 'error'`, no un conjunto de booleanos (`isLoading`, `hasError`, etc.). Con flags sueltos es fácil llegar a combinaciones imposibles o ambiguas (`isLoading && !error && data.length === 0`, ¿qué se pinta?). Con un estado explícito, `FilesTableContainer` hace un único `switch` y cada rama es mutuamente excluyente por construcción.

### 3.4 PropTypes como sustituto documental de TypeScript

TypeScript está prohibido por el enunciado (JavaScript ES6+ puro). PropTypes es la forma idiomática de documentar contratos de props en React sin él: no da chequeo estático, pero sí falla de forma ruidosa en desarrollo si un componente recibe algo que no encaja, y sirve de documentación ejecutable para quien lea el componente.

### 3.5 Por qué no hay error boundary

En React 18 un error boundary solo puede implementarse con una clase (`componentDidCatch` / `getDerivedStateFromError`); no existe equivalente en hooks. El enunciado prohíbe explícitamente los class components, así que implementar uno habría violado esa restricción. No es una omisión: todos los errores esperables (fallos de red, 4xx, 5xx) ya los captura el thunk y se exponen como el estado `error` de la máquina, que es el mecanismo real por el que un usuario ve un fallo en esta app. Un error boundary solo protegería contra errores de render inesperados (bugs), que son un problema distinto y fuera del alcance de esta implementación.

### 3.6 Composición sobre configuración en `FilesTable`

En vez de props booleanas para variantes de fila, `FilesTable` acepta `renderRow`. Esto evita que el componente crezca a base de banderas (`compact`, `highlightErrors`, `showIndex`...) cada vez que se necesita una variante, y deja la extensión en manos de quien lo usa. Si se pasa un `renderRow` custom, el contenedor lo memoriza con `useCallback`: una función inline se recrearía en cada render y anularía el `React.memo` de `FileRow`.

### 3.7 Versiones de dependencias fijadas por debajo de las últimas

El enunciado exige Node.js 16. Varias versiones "actuales" de estas librerías declaran `engines: node >=18` y no arrancan en Node 16 (`webpack-dev-server@5`, `css-loader@7`, `style-loader@4`, `@testing-library/react@16`). El caso más importante es **MSW**: la v2 requiere Node ≥18 y además depende en runtime de `fetch`/`Request`/`Response`/`TransformStream` globales que no existen en Node 16, así que directamente no funciona ahí. Por eso el proyecto fija `msw@1.3.5`, cuya API de handlers (`rest.get(url, (req, res, ctx) => res(ctx.json(...)))`) es distinta de la v2 y es la que se usa en todos los mocks y tests.

También se fijó `@testing-library/dom@9.3.4` de forma explícita: sin ese pin, la resolución de dependencias de npm terminaba eligiendo la v10 (que exige Node ≥18) para satisfacer el rango abierto de un peer dependency de `@testing-library/user-event`, generando dos copias de la librería instaladas en paralelo.

### 3.8 Aviso de archivos omitidos

El header `X-Skipped-Files` se lee directamente del `response.headers` de axios (ya en minúsculas) y se trata como `0` si no está presente. El header `X-Skipped-File-Names` acompaña el conteo con los nombres reales, serializados como JSON por el backend (`["test4.csv","test5.csv"]`); `filesApi.js` lo parsea de forma defensiva y cae a `[]` si viene ausente o mal formado, porque es un detalle complementario al conteo, no algo de lo que dependa el resto de la UI. Cuando el conteo es mayor que cero se muestra un `Alert` de advertencia no bloqueante con los nombres incluidos (ej. "2 archivos no se pudieron descargar del proveedor: test4.csv, test5.csv."): la tabla se sigue viendo con lo que sí se pudo descargar, pero el usuario sabe exactamente qué falta, no solo cuánto.

### 3.9 `API_BASE_URL` horneado en build, sin proxy en el dev server

`API_BASE_URL` tiene un valor por defecto funcional (`http://localhost:3000`) inyectado vía `DefinePlugin`, sustituible en build con la variable de entorno del mismo nombre si hiciera falta. Como es una URL absoluta, axios llama directamente al API sin pasar por el dev server de Webpack — por eso no hay configuración de proxy: sería código muerto. El cruce de origen lo resuelve el CORS que expone el backend, con lo cual el comportamiento en desarrollo y en producción es idéntico.

### 3.10 Idioma de la UI: español en pantalla, inglés en el código

Todo el texto que ve el usuario (labels, botones, alertas, estado vacío, aviso de omitidos, `<title>`) está en español. El código, los nombres de variables, el JSDoc y los comentarios se mantienen en inglés: es la convención habitual y lo que hace el código legible para cualquier colaborador, independientemente del idioma de la interfaz. Dos excepciones deliberadas quedan en inglés en pantalla:

- **Los encabezados de la tabla** (`File Name`, `Text`, `Number`, `Hex`) porque el enunciado los fija textualmente como requisito de aceptación.
- **Los mensajes de error que vienen del backend** (`error.message` en el body de la API, ej. "File 'x.csv' was not found") porque son contenido del contrato del API, no texto de la UI: traducirlos requeriría decidir si el API en sí habla español, una decisión de otra capa que no le corresponde al frontend tomar por su cuenta.

## 4. Testing

Estrategia: testear comportamiento observable (roles, texto visible), nunca detalles de implementación. Consultas por `getByRole` / `getByText`, sin `data-testid` ni selección por clases.

Cobertura:

- **`flattenFilesData`** (función pura): caso normal, archivo con `lines: []`, array vacío, varios archivos con el nombre repetido correctamente por fila.
- **`filesSlice`**: transiciones `pending` / `fulfilled` / `rejected` de la máquina de estados, el reducer de `searchText`, y que una respuesta `fulfilled`/`rejected` cuyo `requestId` ya no es el vigente se descarta sin tocar el estado (incluyendo el caso en que la petición vieja resuelve después que la nueva).
- **`selectRows`**: aplana correctamente el estado del store, incluyendo archivos con `lines: []`.
- **`FilesTable`**: encabezados exactos, una fila por entrada, tabla vacía sin romperse.
- **`FileFilterBar`**: cada tecleo dispara `onSearchTextChange`, Enter dispara `onSearchSubmit`, la selección del `<select>` dispara `onFileNameSelect`, el botón Clear dispara `onClear`.
- **`SkippedFilesNotice`**: no renderiza nada con `count: 0`; nombra cada archivo omitido; singular/plural correcto para uno solo; cae a un mensaje con solo el conteo si no hay nombres disponibles.
- **Integración con MSW v1** (`test/App.integration.test.jsx`): loading → tabla poblada; error 502 → `ErrorAlert` visible; `X-Skipped-Files: 2` + `X-Skipped-File-Names` → aviso visible con los nombres; `fileName` inexistente → `ErrorAlert`, nunca un estado vacío disfrazado de éxito; escribir un texto dispara la búsqueda al backend una vez que el debounce se asienta y muestra todos los archivos que matchean; un substring que solo matchea un archivo lo aísla; un substring sin coincidencias muestra el error real del servidor; Enter busca de inmediato sin esperar el debounce.

`npm test` corre completamente contra los mocks de MSW, sin tocar la red real.

## 5. Qué haría con más tiempo

- Virtualizar la tabla (`react-window` o similar) para volúmenes grandes de filas.
- Paginación o scroll infinito en el select de servidor cuando la lista de archivos crezca.
- Internacionalización de los textos de la UI.
- Tema oscuro.
