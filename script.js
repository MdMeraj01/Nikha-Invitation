(() => {
  'use strict';
  const PDF_URL = 'assets/nikha-invitation-original.pdf';
  const form = document.getElementById('guest-form');
  const nameInput = document.getElementById('guest-name');
  const nameInput2 = document.getElementById('guest-name-2');
  const status = document.getElementById('status');
  const confirmButton = document.getElementById('confirm-button');
  const downloadButton = document.getElementById('download-button');
  const preview = document.getElementById('pdf-preview');
  const loading = document.getElementById('loading');
  let originalBytes = null;
  let personalizedBytes = null;
  let previewUrl = null;
  let confirmedName = '';
  let confirmedName2 = '';

  function setStatus(message, type = '') {
    status.textContent = message;
    status.className = `status${type ? ` ${type}` : ''}`;
  }

  async function loadOriginal() {
    try {
      if (location.protocol === 'file:') {
        throw new Error('You opened index.html directly (file://). Please run run-website.bat, or use VS Code Live Server.');
      }
      const response = await fetch(new URL(PDF_URL, document.baseURI));
      if (!response.ok) throw new Error(`Could not load the original PDF (HTTP ${response.status}). Check that assets/nikha-invitation-original.pdf exists.`);
      originalBytes = await response.arrayBuffer();
      preview.src = PDF_URL + '#toolbar=0&navpanes=0&view=FitH';
      preview.hidden = false;
      loading.hidden = true;
    } catch (error) {
      loading.innerHTML = '<span>Unable to load PDF. Please run run-website.bat or open the site with VS Code Live Server.</span>';
      setStatus(error.message || 'Could not load the original PDF. Check the assets folder and run the website through a local server.', 'error');
    }
  }

  async function createPersonalizedPdf(name, name2) {
    if (!window.PDFLib) throw new Error('The PDF editor library did not load. Check your internet connection and refresh.');
    if (!originalBytes) throw new Error('The original invitation PDF is not ready yet. Refresh the page and try again.');

    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdfDoc = await PDFDocument.load(originalBytes.slice(0));
    const firstPage = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const pageHeight = firstPage.getHeight();

    function drawGuestName(text, yFromTop) {
      if (!text) return;
      let size = 10;
      const maxWidth = 184;
      while (font.widthOfTextAtSize(text, size) > maxWidth && size > 6) size -= 0.25;
      firstPage.drawText(text, {
        x: 78,
        y: pageHeight - yFromTop,
        size,
        font,
        color: rgb(0.08, 0.09, 0.12),
        maxWidth
      });
    }

    // Draw each name slightly ABOVE its corresponding original line.
    // If your PDF rendering differs, adjust these two yFromTop values slightly.
    drawGuestName(name, 207);
    drawGuestName(name2, 233);

    return await pdfDoc.save();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim().replace(/\s+/g, ' ');
    const name2 = nameInput2.value.trim().replace(/\s+/g, ' ');
    if (!name) {
      setStatus('Please enter the guest name first.', 'error');
      nameInput.focus();
      return;
    }
    if (name.length > 35 || name2.length > 35) {
      setStatus('Please keep each guest name under 35 characters.', 'error');
      return;
    }
    confirmButton.disabled = true;
    downloadButton.disabled = true;
    confirmButton.querySelector('span').textContent = 'Preparing preview…';
    setStatus('Adding the guest name to page 1. Please wait.');
    try {
      const bytes = await createPersonalizedPdf(name, name2);
      personalizedBytes = bytes;
      confirmedName = name;
      confirmedName2 = name2;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      preview.src = previewUrl + '#toolbar=0&navpanes=0&view=FitH';
      preview.hidden = false;
      loading.hidden = true;
      downloadButton.disabled = false;
      setStatus(`Confirmed for ${name}${name2 ? ' and ' + name2 : ''}. Your personalized 3-page invitation is ready to download.`, 'success');
    } catch (error) {
      setStatus(error.message || 'Something went wrong while creating the invitation.', 'error');
    } finally {
      confirmButton.disabled = false;
      confirmButton.querySelector('span').textContent = 'Confirm & Preview';
    }
  });

  function invalidateConfirmedPdf() {
    if (confirmedName && (nameInput.value.trim().replace(/\s+/g, ' ') !== confirmedName || nameInput2.value.trim().replace(/\s+/g, ' ') !== confirmedName2)) {
      personalizedBytes = null;
      confirmedName = '';
      downloadButton.disabled = true;
      setStatus('Name changed. Confirm again to prepare the updated PDF.');
    }
  }

  nameInput.addEventListener('input', invalidateConfirmedPdf);
  nameInput2.addEventListener('input', invalidateConfirmedPdf);

  downloadButton.addEventListener('click', () => {
    if (!personalizedBytes || !confirmedName) return;
    const safeName = [confirmedName, confirmedName2].filter(Boolean).join('-').normalize('NFKD').replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/[ _]+/g, '-').slice(0, 55) || 'Guest';
    const url = URL.createObjectURL(new Blob([personalizedBytes], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nikha-Invitation-${safeName}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    setStatus(`Download started for ${confirmedName}${confirmedName2 ? ' and ' + confirmedName2 : ''}.`, 'success');
  });

  loadOriginal();
})();
