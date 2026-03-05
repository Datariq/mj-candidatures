async function serverGeneratePDF(htmlContent) {
  const res = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html: htmlContent }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `PDF generation failed (${res.status})`);
  }

  return await res.blob();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function generatePDF(htmlContent, filename) {
  const blob = await serverGeneratePDF(htmlContent);
  downloadBlob(blob, filename);
}

export async function generatePDFBlob(htmlContent, filename) {
  return await serverGeneratePDF(htmlContent);
}
