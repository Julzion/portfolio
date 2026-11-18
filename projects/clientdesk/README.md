# ClientDesk

A simple client records and policy renewal manager, inspired by two years of work as an encoder at an insurance office.

**Live demo:** https://brian-jules-asuncion.vercel.app/projects/clientdesk/

## Features
- Add, edit, search and delete client records
- Automatic status: **Active**, **Due soon** (within 30 days) or **Expired**, based on the renewal date
- Summary counts for each status
- Filter by status and search by name, policy number or contact
- Input validation, including duplicate policy number checks
- Export all records to CSV (opens in Excel)
- Responsive: the table becomes stacked cards on phones
- Data is saved in the browser with `localStorage`

## Built with
HTML5 · CSS3 · JavaScript (no frameworks)

## Run locally
Open `index.html` in any modern browser.

> Sample records are fictional.
