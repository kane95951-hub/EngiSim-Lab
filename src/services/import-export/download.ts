// Déclenche le téléchargement d'un texte depuis le navigateur (fichier créé localement, rien n'est envoyé).
export function downloadText(
  filename: string,
  text: string,
  mimeType = 'text/csv;charset=utf-8',
): void {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
