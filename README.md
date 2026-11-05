# Philippines Railway Summit 2026 Lucky Spin

This is a standalone static page deployed to Vercel from the repository root.

## Wheel setup

The RATP Dev Manila logo and its navy-and-teal palette are used in the page. Initial prizes are Notebook (30%), Pen (35%), Umbrella (5%), Toiletry bag (10%), and Tote bag (20%). Select **Wheel Setup** on the kiosk to add, remove, or rename prizes and adjust their chances. Percentages must total `100%`; set a prize to `0%` to exclude it from the draw.

The wheel shows each prize and its percentage beside it. Participants enter their full name, work email, and company or organization before spinning; the fields start blank and do not contain example data. A spin records the timestamp, entered details, prize, and optional marketing consent. Prize settings and spin records are stored only in the browser on the kiosk device. Use **Export CSV** regularly to download the records for Excel. The app does not sync data to the cloud. Anyone using the kiosk can open Wheel Setup, so keep the kiosk supervised.

The prize wheel turns slowly while idle to draw attention. The RATP Dev round logo stays fixed over the wheel hub while the wheel turns. Idle motion is disabled when the device requests reduced motion.

## Deploy

Push changes to the connected GitHub branch. Vercel automatically deploys the root `index.html` as a static site; no build or install command is required.
