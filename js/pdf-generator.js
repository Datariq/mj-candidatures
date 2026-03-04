function getPDFOptions(filename) {
  return {
    margin: 0,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      width: 850,
      windowWidth: 850,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: "avoid-all" },
  };
}

async function preparePDFElement(htmlContent) {
  // Use an iframe for perfect CSS isolation
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:850px;height:1200px;border:none;";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for fonts to fully load inside the iframe
  if (iframe.contentWindow.document.fonts) {
    await iframe.contentWindow.document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 600));

  const sourceElement = iframeDoc.querySelector(".page");
  if (!sourceElement) {
    document.body.removeChild(iframe);
    throw new Error("No .page element found in HTML");
  }

  // Clone into main document preserving structure and computed styles
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;width:850px;overflow:visible;";

  const clonedPage = cloneDeepWithStyles(sourceElement, iframe.contentWindow);
  container.appendChild(clonedPage);
  document.body.appendChild(container);

  document.body.removeChild(iframe);

  // Wait for fonts in main document
  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 200));

  return { element: clonedPage, container };
}

function cloneDeepWithStyles(sourceNode, sourceWin) {
  // For non-element nodes (text, comments, etc.), clone directly
  if (sourceNode.nodeType !== 1) {
    return sourceNode.cloneNode(true);
  }

  // Clone the element (shallow) and apply computed styles
  const clone = sourceNode.cloneNode(false);
  const computed = sourceWin.getComputedStyle(sourceNode);
  clone.style.cssText = computed.cssText;

  // Recursively clone ALL child nodes in their original order
  // (fixes text node ordering bug from the previous version)
  for (const child of sourceNode.childNodes) {
    clone.appendChild(cloneDeepWithStyles(child, sourceWin));
  }

  return clone;
}

export async function generatePDF(htmlContent, filename) {
  const { element, container } = await preparePDFElement(htmlContent);
  try {
    await html2pdf().set(getPDFOptions(filename)).from(element).save();
  } finally {
    document.body.removeChild(container);
  }
}

export async function generatePDFBlob(htmlContent, filename) {
  const { element, container } = await preparePDFElement(htmlContent);
  try {
    const blob = await html2pdf()
      .set(getPDFOptions(filename))
      .from(element)
      .outputPdf("blob");
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}
