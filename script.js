document.addEventListener('DOMContentLoaded', async () => {
    const pdfFileInput = document.getElementById('pdfFiles');
    const mergeBtn = document.getElementById('mergeBtn');
    const downloadLinkContainer = document.getElementById('downloadLinkContainer');
    const downloadLink = document.getElementById('downloadLink');
    const fileList = document.getElementById('fileList');
    const customFileLabel = document.querySelector('.custom-file-label');

    let files = [];

    pdfFileInput.addEventListener('change', (event) => {
        files = Array.from(event.target.files);
        renderFileList();
        mergeBtn.disabled = files.length < 2;
        downloadLinkContainer.style.display = 'none';
    });

    function renderFileList() {
        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.dataset.index = index;
            listItem.textContent = file.name;
            fileList.appendChild(listItem);
        });
        if (files.length > 0) {
            customFileLabel.textContent = `${files.length} files selected`;
        } else {
            customFileLabel.textContent = 'Choose files';
        }
    }

    new Sortable(fileList, {
        animation: 150,
        onEnd: (evt) => {
            const movedFile = files.splice(evt.oldIndex, 1)[0];
            files.splice(evt.newIndex, 0, movedFile);
            renderFileList();
        }
    });

    mergeBtn.addEventListener('click', async () => {
        if (files.length < 2) {
            return;
        }

        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        const mergedPdfBytes = await mergedPdf.save();
        const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(mergedPdfBlob);

        downloadLink.href = url;
        downloadLink.download = 'merged.pdf';
        downloadLinkContainer.style.display = 'block';
    });
});