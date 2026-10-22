NIKHA INVITATION PERSONALIZER

EASIEST WAY TO RUN (Windows):
1. Extract this ZIP fully.
2. Open the extracted nikha_invitation_website folder.
3. Double-click run-website.bat.
4. Keep the black terminal window open.
5. The browser opens http://localhost:8000. If not, open that address manually.

ALTERNATIVE: VS Code Live Server
1. Open this folder in VS Code.
2. Right-click index.html > Open with Live Server.
3. Make sure the address starts with http://127.0.0.1 or http://localhost, NOT file:///C:/...

FILES
- index.html: website structure
- style.css: design
- script.js: guest-name and PDF generation logic
- assets/nikha-invitation-original.pdf: original 3-page invitation

Internet is required for the pdf-lib library CDN. The original PDF is never overwritten. Only page 1 gets the guest name.
