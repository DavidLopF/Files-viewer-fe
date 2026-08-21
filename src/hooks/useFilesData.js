import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFilesData } from '../store/filesSlice'
import {
  selectError,
  selectFileName,
  selectRows,
  selectSkippedFileNames,
  selectSkippedFiles,
  selectStatus
} from '../store/selectors'

/**
 * Orchestrates the main table dataset: triggers the initial load, exposes
 * the current machine state and derived rows, and offers a retry that
 * re-requests whatever file name is currently active.
 * @returns {{
 *   status: string,
 *   error: { code: string, message: string } | null,
 *   rows: Array,
 *   skippedFiles: number,
 *   skippedFileNames: string[],
 *   retry: () => void
 * }}
 */
export const useFilesData = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectStatus)
  const error = useSelector(selectError)
  const rows = useSelector(selectRows)
  const skippedFiles = useSelector(selectSkippedFiles)
  const skippedFileNames = useSelector(selectSkippedFileNames)
  const fileName = useSelector(selectFileName)

  useEffect(() => {
    dispatch(fetchFilesData({}))
  }, [dispatch])

  const retry = useCallback(() => {
    dispatch(fetchFilesData({ fileName: fileName || undefined }))
  }, [dispatch, fileName])

  return { status, error, rows, skippedFiles, skippedFileNames, retry }
}
