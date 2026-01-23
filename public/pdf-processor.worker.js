/* eslint-disable no-restricted-globals */
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

// Configuración explícita del workerSrc para evitar el error
self.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

self.onmessage = async (e) => {
    const { type, buffer } = e.data;

    if (type === 'EXTRACT_TEXT') {
        try {
            // Configurar worker src localmente dentro del worker si es necesario, 
            // aunque pdf.js debería manejarlo si se importa el script principal.
            // En este caso, usamos getDocument directamente del global pdfjsLib expuesto por el script importado.

            const pdf = await self.pdfjsLib.getDocument({ data: buffer }).promise;
            const totalPages = pdf.numPages;
            let fullText = '';

            for (let i = 1; i <= totalPages; i++) {
                // Reportar progreso
                self.postMessage({
                    type: 'PROGRESS',
                    current: i,
                    total: totalPages
                });

                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            if (!fullText.trim()) {
                self.postMessage({ type: 'ERROR', error: 'El PDF no contiene texto extraíble.' });
            } else {
                self.postMessage({ type: 'COMPLETE', text: fullText });
            }

        } catch (error) {
            self.postMessage({ type: 'ERROR', error: error.message || 'Error desconocido al procesar el PDF.' });
        }
    }
};
