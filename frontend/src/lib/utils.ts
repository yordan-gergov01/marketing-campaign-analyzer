/** Formats a number into a compact human-readable string with an optional prefix.
 *  Values ≥ 1,000,000 → "1.2M", values ≥ 1,000 → "9.8K", otherwise 2 decimal places. */
export function fmt(n: number, prefix = '') {
    if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`
    return `${prefix}${n.toFixed(2)}`
  }
  
/** Decodes a base64-encoded .docx file and triggers a browser download.
 *  Converts the base64 string → binary bytes → Blob, then creates a temporary
 *  anchor link, clicks it programmatically, and immediately cleans up the object URL. */
export function downloadDocx(base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'revised_media_plan.docx'
  a.click()
  URL.revokeObjectURL(url)
}
  