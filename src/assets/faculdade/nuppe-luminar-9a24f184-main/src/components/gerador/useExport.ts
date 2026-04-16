import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import JSZip from "jszip";

export async function exportPecaPng(el: HTMLElement, filename: string) {
  const dataUrl = await toPng(el, {
    width: el.offsetWidth,
    height: el.offsetHeight,
    pixelRatio: 1,
    style: { transform: "scale(1)", transformOrigin: "top left" },
  });
  saveAs(dataUrl, `${filename}.png`);
}

export async function exportMultiplePng(
  elements: { el: HTMLElement; filename: string }[]
) {
  if (elements.length === 1) {
    return exportPecaPng(elements[0].el, elements[0].filename);
  }

  const zip = new JSZip();

  for (const { el, filename } of elements) {
    const dataUrl = await toPng(el, {
      width: el.offsetWidth,
      height: el.offsetHeight,
      pixelRatio: 1,
      style: { transform: "scale(1)", transformOrigin: "top left" },
    });
    const base64 = dataUrl.split(",")[1];
    zip.file(`${filename}.png`, base64, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "pecas-nuppe.zip");
}
