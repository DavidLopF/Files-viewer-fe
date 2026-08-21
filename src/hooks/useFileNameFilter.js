import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFilesData, setSearchText } from '../store/filesSlice'
import { selectFileName, selectSearchText } from '../store/selectors'
import { fetchFilesList } from '../services/filesApi'

const SEARCH_DEBOUNCE_MS = 300

/**
 * Owns the two affordances for narrowing the dataset by file name, both of
 * which resolve through the same backend search (`fileName` is matched as
 * a substring server-side, not an exact name): typing, debounced so a live
 * search doesn't fire a request per keystroke, and picking a name from the
 * server-populated select, which searches immediately. Enter bypasses the
 * debounce to search right away.
 * @returns {{
 *   availableFiles: string[],
 *   searchText: string,
 *   activeFileName: string,
 *   onSearchTextChange: (value: string) => void,
 *   onSearchSubmit: () => void,
 *   onFileNameSelect: (fileName: string) => void,
 *   onClear: () => void
 * }}
 */
export const useFileNameFilter = () => {
  const dispatch = useDispatch()
  const searchText = useSelector(selectSearchText)
  const activeFileName = useSelector(selectFileName)
  const [availableFiles, setAvailableFiles] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    fetchFilesList()
      .then((files) => {
        if (!cancelled) setAvailableFiles(files)
      })
      .catch(() => {
        if (!cancelled) setAvailableFiles([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const runSearch = useCallback(
    (value) => {
      dispatch(fetchFilesData(value ? { fileName: value } : {}))
    },
    [dispatch]
  )

  const onSearchTextChange = useCallback(
    (value) => {
      dispatch(setSearchText(value))
      clearTimeout(debounceRef.current)

      if (value === '') {
        runSearch('')
        return
      }

      debounceRef.current = setTimeout(() => runSearch(value), SEARCH_DEBOUNCE_MS)
    },
    [dispatch, runSearch]
  )

  const onSearchSubmit = useCallback(() => {
    clearTimeout(debounceRef.current)
    runSearch(searchText)
  }, [runSearch, searchText])

  const onFileNameSelect = useCallback(
    (fileName) => {
      clearTimeout(debounceRef.current)
      dispatch(setSearchText(fileName))
      runSearch(fileName)
    },
    [dispatch, runSearch]
  )

  const onClear = useCallback(() => {
    clearTimeout(debounceRef.current)
    dispatch(setSearchText(''))
    runSearch('')
  }, [dispatch, runSearch])

  return { availableFiles, searchText, activeFileName, onSearchTextChange, onSearchSubmit, onFileNameSelect, onClear }
}
