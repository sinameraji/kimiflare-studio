import { toBlob } from 'html-to-image'

export async function exportMissionReport(element: HTMLElement): Promise<Blob> {
  const blob = await toBlob(element, {
    pixelRatio: 2,
    backgroundColor: '#F7F5F0',
  })
  if (!blob) {
    throw new Error('Failed to generate image')
  }
  return blob
}

export async function copyImageToClipboard(element: HTMLElement): Promise<void> {
  const blob = await exportMissionReport(element)
  await navigator.clipboard.write([
    new ClipboardItem({ [blob.type]: blob }),
  ])
}
