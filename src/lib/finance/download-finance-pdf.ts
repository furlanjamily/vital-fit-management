type FinancePdfDownloadPayload = {
  base64: string;
  filename: string;
  mimeType: string;
};

/** Converte o payload base64 da Server Action em download no browser. */
export function downloadFinancePdf(file: FinancePdfDownloadPayload): void {
  const binary = atob(file.base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = file.filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
