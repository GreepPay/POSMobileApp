// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import html2pdf from "html2pdf.js";
import { Logic } from "@greep/logic";


pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

// Utility function
const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1]; // strip data:application/pdf;base64,
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

// Use pdfjs-dist to render first page of PDF as image (base64 PNG)
const renderPdfToImageBase64 = async (blob: Blob): Promise<string> => {
    const pdfData = new Uint8Array(await blob.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl.split(",")[1]; // base64 only
};

const downloadReceipt = async (docType: "pdf" | "image", documentId: string) => {
    Logic.Common.showLoader({
        show: true,
        loading: true
    })

    const element = document.getElementById(documentId);
    if (!element) return;

    const fileName = `greep-payment.${docType === "pdf" ? "pdf" : "png"
        }`;

    const opt = {
        margin: 1,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
            scale: 2,
            dpi: 300,
            letterRendering: true,
            useCORS: true,
        },
        jsPDF: { unit: "pt", format: [300, 500], orientation: "portrait" },
    };

    const pdfBlob = await html2pdf().from(element).set(opt).outputPdf("blob");

    try {
        if (docType === "pdf") {
            const file = new File([pdfBlob], fileName, { type: "application/pdf" });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Greep Pay",
                    text: "Complete your payment with Greep Pay.",
                });
            } else {
                // fallback: download
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            }
        } else if (docType === "image") {
            const imageData = await renderPdfToImageBase64(pdfBlob);
            const byteCharacters = atob(imageData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const imageBlob = new Blob([byteArray], { type: "image/png" });
            const imageFile = new File([imageBlob], fileName, { type: "image/png" });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                await navigator.share({
                    files: [imageFile],
                    title: "Greep Pay",
                    text: "Complete your payment with Greep Pay.",
                });
            } else {
                // fallback: download
                const url = URL.createObjectURL(imageBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            }
        }
    } catch (error) {
        console.error("Error sharing the file:", error);
    } finally {

        Logic.Common.hideLoader()
    }
};

export { blobToBase64, renderPdfToImageBase64, downloadReceipt };