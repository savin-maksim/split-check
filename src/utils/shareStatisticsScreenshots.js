import { toPng } from 'html-to-image'
import { toast } from 'react-hot-toast'

const CAPTURE_BG = '#1f1f1f'

/** Виртуальный «экран» для вёрстки перед снимком (innerWidth изменить нельзя). */
const CAPTURE_VIEWPORT_W = 600
const CAPTURE_VIEWPORT_H = 1080

function installStatShareViewport() {
  const html = document.documentElement
  const style = document.createElement('style')
  style.id = 'stat-share-viewport'
  style.setAttribute('data-stat-share-viewport', '')
  style.textContent = `
    html.stat-share-capture {
      --container-width: ${CAPTURE_VIEWPORT_W}px;
    }
    html.stat-share-capture body {
      min-height: ${CAPTURE_VIEWPORT_H}px;
    }
    html.stat-share-capture .layout {
      width: ${CAPTURE_VIEWPORT_W}px;
      max-width: ${CAPTURE_VIEWPORT_W}px;
      min-height: ${CAPTURE_VIEWPORT_H}px;
      margin-left: auto;
      margin-right: auto;
      box-sizing: border-box;
    }
    html.stat-share-capture .layout__content {
      width: 100%;
      max-width: ${CAPTURE_VIEWPORT_W}px;
    }
    .stat-share-blur-overlay {
      position: fixed;
      inset: 0;
      z-index: 9990;
      pointer-events: auto;
      cursor: wait;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background: rgba(0, 0, 0, 0.28);
    }
  `
  document.head.appendChild(style)
  html.classList.add('stat-share-capture')

  const overlay = document.createElement('div')
  overlay.id = 'stat-share-blur-overlay'
  overlay.className = 'stat-share-blur-overlay'
  overlay.setAttribute('aria-hidden', 'true')
  document.body.appendChild(overlay)

  return () => {
    html.classList.remove('stat-share-capture')
    style.remove()
    overlay.remove()
  }
}

async function settleLayoutAfterViewportChange() {
  window.scrollTo(0, 0)
  await new Promise((r) => requestAnimationFrame(r))
  await new Promise((r) => requestAnimationFrame(r))
}

const MONTSERRAT_GOOGLE_CSS =
  'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap'

let montserratCssCache

async function getMontserratFontEmbedCSS() {
  if (montserratCssCache !== undefined) return montserratCssCache
  try {
    const res = await fetch(MONTSERRAT_GOOGLE_CSS, { mode: 'cors' })
    montserratCssCache = res.ok ? await res.text() : null
  } catch {
    montserratCssCache = null
  }
  return montserratCssCache
}

function capturePixelRatio() {
  if (typeof window === 'undefined') return 2
  return window.innerWidth < 768 ? 1.25 : 2
}

let shareInProgress = false

function sanitizeFilenameSegment(s) {
  const cleaned = String(s)
    .split('')
    .filter((ch) => {
      const c = ch.charCodeAt(0)
      return c >= 32 && !'<>:"/\\|?*'.includes(ch)
    })
    .join('')
  return cleaned.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80).trim() || 'x'
}

/** Стабильные имена без порядкового номера — повторный экспорт перезаписывает те же файлы в «Загрузках». */
function buildFilenameFromNode(node) {
  const kind = node.getAttribute('data-stat-share')
  const label = node.getAttribute('data-stat-share-label') || ''
  const stableId = node.getAttribute('data-stat-share-id')
  if (kind === 'transfers') return 'splitcheck-transfers.png'
  if (kind === 'summary') return 'splitcheck-summary.png'
  if (kind === 'person' && stableId) return `splitcheck-person-${sanitizeFilenameSegment(stableId)}.png`
  return `splitcheck-person-${sanitizeFilenameSegment(label)}.png`
}

export function sectionTitleFromStatShareNode(node) {
  const kind = node.getAttribute('data-stat-share')
  if (kind === 'transfers') return 'Переводы'
  if (kind === 'summary') return 'Общая сумма'
  return node.getAttribute('data-stat-share-label') || 'Участник'
}

/**
 * Список секций на странице (порядок как в DOM).
 */
export function collectStatShareSections() {
  const nodes = [...document.querySelectorAll('[data-stat-share]')]
  return nodes.map((node, index) => ({
    index,
    title: sectionTitleFromStatShareNode(node),
  }))
}

async function dataUrlToFile(dataUrl, filename) {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: 'image/png' })
}

async function downloadFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    if (i < files.length - 1) await new Promise((r) => setTimeout(r, 120))
  }
}

/**
 * @param {number[]} selectedIndices — индексы узлов `[data-stat-share]` в порядке DOM
 */
export async function captureAndExportStatShares(selectedIndices) {
  if (shareInProgress) return
  const allNodes = [...document.querySelectorAll('[data-stat-share]')]
  const uniqueSorted = [...new Set(selectedIndices)].filter((i) => i >= 0 && i < allNodes.length).sort((a, b) => a - b)

  if (uniqueSorted.length === 0) {
    toast.error('Выберите хотя бы одну секцию')
    return
  }

  shareInProgress = true
  const toastId = toast.loading('Готовим скриншоты…')

  let removeStatShareViewport = () => {}

  try {
    const fontEmbedCSS = await getMontserratFontEmbedCSS()
    const pngOptions = {
      pixelRatio: capturePixelRatio(),
      backgroundColor: CAPTURE_BG,
      cacheBust: true,
      preferredFontFormat: 'woff2',
      ...(fontEmbedCSS ? { fontEmbedCSS } : { skipFonts: true }),
    }

    removeStatShareViewport = installStatShareViewport()
    await settleLayoutAfterViewportChange()

    const files = []
    for (const i of uniqueSorted) {
      const node = allNodes[i]
      const filename = buildFilenameFromNode(node)
      const dataUrl = await toPng(node, pngOptions)
      files.push(await dataUrlToFile(dataUrl, filename))
    }

    const shareData = {
      files,
      title: 'Статистика Split Check',
      text: 'Скриншоты статистики',
    }

    let canShareFiles = false
    try {
      canShareFiles = Boolean(typeof navigator !== 'undefined' && navigator.canShare?.(shareData))
    } catch {
      canShareFiles = false
    }

    if (typeof navigator !== 'undefined' && navigator.share && canShareFiles) {
      try {
        await navigator.share(shareData)
        toast.success('Готово', { id: toastId })
      } catch (shareErr) {
        if (shareErr?.name === 'AbortError') {
          toast.dismiss(toastId)
        } else {
          console.warn('navigator.share failed, fallback download', shareErr)
          await downloadFiles(files)
          toast.success(`Шеринг недоступен — скачано ${files.length} файлов`, { id: toastId })
        }
      }
    } else {
      await downloadFiles(files)
      toast.success(`Сохранено ${files.length} файлов`, { id: toastId })
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      toast.dismiss(toastId)
    } else {
      console.error('captureAndExportStatShares:', error)
      toast.error(error?.message || 'Не удалось подготовить скриншоты', { id: toastId })
    }
  } finally {
    removeStatShareViewport()
    shareInProgress = false
  }
}
