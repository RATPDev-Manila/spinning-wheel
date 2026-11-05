# Product

<!-- impeccable:product-schema 1 -->

> **Unconfirmed product record:** The interview could not obtain user answers. Facts below are inferred from the repository, its documentation, and prior user requests; verify them with the product owner before treating them as approved requirements.

## Platform

web

## Users

- Summit attendees use the kiosk to submit their contact details and take a turn in the prize draw.
- Event organizers configure the prize list and odds, supervise the kiosk, and export collected records.

## Product Purpose

Run a weighted prize draw for the Philippines Railway Summit 2026 while collecting each participant's submitted details and result for event follow-up and record keeping. The implementation provides an Excel-compatible CSV export for organizers.

## Positioning

The current product is a summit prize-draw kiosk: organizers can adjust each prize's percentage chance, while attendees enter their details and spin. No broader market-differentiation claim is established.

## Operating Context

- Used as an event kiosk for the Philippines Railway Summit 2026.
- The standalone page is deployed from the repository root to Vercel.
- Prize settings and spin records are stored in the browser on the kiosk device. Organizers download records as CSV for Excel; the current implementation does not sync them to a cloud service.
- The kiosk should be supervised because its organizer controls and locally stored records are available in that browser.

## Capabilities and Constraints

- Participants enter a required full name, work email, and company or organization before spinning. Fields are blank by default and contain no example values.
- Marketing consent is optional.
- Each spin records a timestamp, entered details, selected prize, and consent choice in browser storage.
- Organizers can add, remove, or rename prizes and set percentage chances that total 100%; a 0% prize is excluded from the draw.
- Current default prizes: Notebook 30%, Pen 35%, Umbrella 5%, Toiletry bag 10%, and Tote bag 20%.
- CSV export is the current route for moving records into Excel. Centralized or cross-device data storage is not implemented.

## Brand Commitments

- Event: Philippines Railway Summit 2026.
- Use the RATP Dev Manila name, logo, and navy-and-teal brand colors.
- The logo asset is [assets/ratpdev-manila-logo.png](./assets/ratpdev-manila-logo.png).

## Evidence on Hand

- The working standalone page and its current flows are in [index.html](./index.html).
- Deployment, prize setup, kiosk storage, and CSV behavior are documented in [README.md](./README.md).
- The RATP Dev Manila logo asset is present in the repository at [assets/ratpdev-manila-logo.png](./assets/ratpdev-manila-logo.png).
- No product analytics, testimonials, or performance evidence are established in the repository.

## Product Principles

- Keep attendee details explicitly entered by each participant; never prefill them with example data.
- Make prize availability and each prize's chance clear to attendees and organizers.
- Preserve the ability to configure the draw without changing the source code.
- Make the current storage boundary clear: records stay in the kiosk browser until exported.
