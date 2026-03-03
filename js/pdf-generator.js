async function preparePDFElement(htmlContent) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:-9999px;width:850px;height:1200px;border:none;";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  await new Promise((resolve) => {
    if (iframe.contentWindow.document.fonts) {
      iframe.contentWindow.document.fonts.ready.then(resolve);
    } else {
      setTimeout(resolve, 1500);
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  const element = iframeDoc.querySelector(".page");
  if (!element) {
    document.body.removeChild(iframe);
    throw new Error("No .page element found in HTML");
  }

  return { element, iframe };
}

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

export async function generatePDF(htmlContent, filename) {
  const { element, iframe } = await preparePDFElement(htmlContent);
  try {
    await html2pdf().set(getPDFOptions(filename)).from(element).save();
  } finally {
    document.body.removeChild(iframe);
  }
}

export async function generatePDFBlob(htmlContent, filename) {
  const { element, iframe } = await preparePDFElement(htmlContent);
  try {
    const blob = await html2pdf()
      .set(getPDFOptions(filename))
      .from(element)
      .outputPdf("blob");
    return blob;
  } finally {
    document.body.removeChild(iframe);
  }
}
