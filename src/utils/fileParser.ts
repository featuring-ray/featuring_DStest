import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/* ═══════════════════════ 타입 ═══════════════════════ */

export interface ParsedFileData {
  fileName: string
  fileSize: number
  headers: string[]
  rows: Record<string, string | number>[]
  preview: Record<string, string | number>[]
  totalRows: number
  truncated: boolean
}

/* ═══════════════════════ 상수 ═══════════════════════ */

const MAX_ROWS = 200
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const PREVIEW_ROWS = 5

/* ═══════════════════════ CSV 파싱 ═══════════════════════ */

function readFileAsText(file: File, encoding = 'UTF-8'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsText(file, encoding)
  })
}

function hasGarbledText(text: string): boolean {
  // 깨진 문자 비율 체크 (replacement character 또는 비정상 패턴)
  const garbled = text.match(/[\ufffd\u0000-\u0008]/g)
  return garbled ? garbled.length / text.length > 0.01 : false
}

async function parseCsv(file: File): Promise<{ headers: string[]; rows: Record<string, string | number>[] }> {
  let text = await readFileAsText(file, 'UTF-8')

  // UTF-8 깨짐 감지 시 EUC-KR로 재시도
  if (hasGarbledText(text)) {
    text = await readFileAsText(file, 'EUC-KR')
  }

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete(results) {
        const headers = results.meta.fields || []
        const rows = (results.data as Record<string, string | number>[]).filter(
          row => headers.some(h => row[h] != null && String(row[h]).trim() !== '')
        )
        resolve({ headers, rows })
      },
      error(err: Error) {
        reject(new Error(`CSV 파싱 오류: ${err.message}`))
      },
    })
  })
}

/* ═══════════════════════ Excel 파싱 ═══════════════════════ */

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsArrayBuffer(file)
  })
}

async function parseExcel(file: File): Promise<{ headers: string[]; rows: Record<string, string | number>[] }> {
  const buffer = await readFileAsArrayBuffer(file)
  const workbook = XLSX.read(buffer, { type: 'array' })

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('Excel 파일에 시트가 없습니다.')

  if (workbook.SheetNames.length > 1) {
    console.warn(`Excel 파일에 ${workbook.SheetNames.length}개의 시트가 있습니다. 첫 번째 시트(${sheetName})만 파싱합니다.`)
  }

  const sheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, { defval: '' })
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : []

  return { headers, rows: jsonData }
}

/* ═══════════════════════ 공개 API ═══════════════════════ */

export async function parseFile(file: File): Promise<ParsedFileData> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`파일 크기가 5MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  let headers: string[]
  let rows: Record<string, string | number>[]

  if (ext === 'csv') {
    ({ headers, rows } = await parseCsv(file))
  } else if (ext === 'xlsx' || ext === 'xls') {
    ({ headers, rows } = await parseExcel(file))
  } else {
    throw new Error(`지원하지 않는 파일 형식입니다. (.csv, .xlsx, .xls만 가능)`)
  }

  if (rows.length === 0) {
    throw new Error('파일에 데이터가 없습니다.')
  }

  const truncated = rows.length > MAX_ROWS
  const cappedRows = truncated ? rows.slice(0, MAX_ROWS) : rows

  return {
    fileName: file.name,
    fileSize: file.size,
    headers,
    rows: cappedRows,
    preview: cappedRows.slice(0, PREVIEW_ROWS),
    totalRows: rows.length,
    truncated,
  }
}

/**
 * 파싱된 파일 데이터를 Claude 프롬프트에 포함할 마크다운 테이블로 변환
 */
export function filesToPromptText(files: ParsedFileData[]): string {
  return files.map(f => {
    const header = `=== 첨부 데이터: ${f.fileName} (${f.totalRows}행${f.truncated ? `, 상위 ${MAX_ROWS}행만 포함` : ''}) ===`
    const thRow = `| ${f.headers.join(' | ')} |`
    const separator = `| ${f.headers.map(() => '---').join(' | ')} |`
    const dataRows = f.rows.map(row =>
      `| ${f.headers.map(h => String(row[h] ?? '')).join(' | ')} |`
    ).join('\n')

    return `${header}\n${thRow}\n${separator}\n${dataRows}`
  }).join('\n\n')
}
