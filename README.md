# Philippines Railway Summit 2026 Lucky Spin

This is a static page deployed to Vercel from the repository root.
The markup, app styles, wheel behavior, and CSV export logic live in `index.html`, `assets/app.css`, `assets/app.js`, and `assets/csv-export.js` respectively. No build or install step is required.

## Wheel setup

The RATP Dev Manila logo and its navy-and-teal palette are used in the page. Initial prizes are Notebook (30%), Umbrella (5%), Tote bag (20%), Pen (35%), and Toiletry bag (10%). Select **Wheel Setup** on the kiosk to add, remove, or rename prizes and adjust their chances. Percentages must total `100%`; set a prize to `0%` to exclude it from the draw.

Participants enter their full name, work email, and company or organization before spinning; the fields start blank. Participants must check the consent and privacy notice to enable the spin. Spin records are saved in the kiosk browser during the event. At the end of the day, an organizer opens **Wheel Setup** and selects **Download results CSV** to save all collected records as one CSV file.

## Downloading the results

The download button is in **Wheel Setup**, not on the attendee screen. It is enabled after at least one entry has been saved and downloads the complete browser-stored results. Keep the kiosk browser and device available until the organizer has downloaded and checked the file. Clearing saved entries permanently removes them from that browser; it does not delete CSV files that have already been downloaded. Browser data is not synced to SharePoint or another device.

## Personal data and kiosk operation

The attendee-facing notice describes the information recorded and its local browser destination. The page no longer loads a third-party CSS framework. Before collecting live attendee data, the event owner and applicable RATP Dev DPO/Compliance contact must confirm the responsible legal entity, purpose and lawful basis, who can access the kiosk and CSV, and retention and deletion for all copies. Update the notice with those confirmed details. This implementation is not compliance approval.

## Other behavior

The prize wheel turns slowly while idle to draw attention. The RATP Dev round logo stays fixed over the wheel hub while the wheel turns. Idle motion is disabled when the device requests reduced motion.

## Deploy and test

Push changes to the connected GitHub branch. Vercel deploys the root `index.html` as a static site; no build or install command is required. Test locally at `http://localhost` or `http://127.0.0.1`, download a test CSV from Wheel Setup, and verify its contents before using real attendee data.
