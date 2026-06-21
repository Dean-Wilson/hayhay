import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = resolve(rootDir, 'docs/lamp-instructions');

const chromeCandidates = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const chromeBin = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chromeBin) {
  throw new Error('Could not find Chrome/Chromium. Set CHROME_BIN to generate lamp instruction PDFs.');
}

const variants = [
  {
    slug: 'e27',
    globeType: 'E27 Edison Screw',
  },
  {
    slug: 'e14',
    globeType: 'E14 Edison Screw',
  },
];

const renderHtml = ({ globeType }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Table Lamp Instructions - ${globeType}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 9mm 11mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      color: #171717;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.45pt;
      line-height: 1.1;
      margin: 0;
    }

    h1,
    h2,
    h3,
    p,
    ol,
    ul {
      margin: 0;
    }

    .instructions {
      margin: 0 auto;
      max-width: 188mm;
    }

    .instructions__title {
      font-size: 13.5pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      line-height: 1.12;
      margin-bottom: 2.1mm;
      text-transform: uppercase;
    }

    .instructions__subtitle {
      font-size: 9.4pt;
      font-weight: 700;
      letter-spacing: 0.15em;
      margin-bottom: 6mm;
      text-transform: uppercase;
    }

    .instructions__section {
      border-bottom: 1.2pt solid #171717;
      padding: 2mm 0 2.2mm;
    }

    .instructions__section:first-of-type {
      padding-top: 0;
    }

    .instructions__section--last {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .instructions__heading {
      font-size: 8.3pt;
      font-weight: 700;
      letter-spacing: 0.09em;
      margin-bottom: 1mm;
      text-transform: uppercase;
    }

    .instructions__intro {
      margin-bottom: 0.8mm;
    }

    .instructions__list {
      padding-left: 5.2mm;
    }

    .instructions__list li {
      margin-bottom: 0.5mm;
      padding-left: 1.4mm;
    }

    .instructions__paragraph + .instructions__paragraph {
      margin-top: 1mm;
    }

    .instructions__symbol-list {
      list-style: none;
      padding: 0;
    }

    .instructions__symbol-list li {
      margin-bottom: 1mm;
    }

    .instructions__bottom {
      align-items: start;
      display: grid;
      gap: 7mm;
      grid-template-columns: 1.2fr 1fr;
      padding-top: 2.3mm;
    }

    .instructions__specs {
      list-style: none;
      padding: 0;
    }

    .instructions__note {
      font-size: 6.5pt;
      margin-top: 1.3mm;
    }

    .instructions__made {
      font-size: 7.8pt;
      margin-top: 2.2mm;
      text-transform: uppercase;
    }

    .instructions__box {
      border: 1.2pt solid #171717;
      margin-bottom: 2mm;
      padding: 1.7mm 2mm;
    }

    .instructions__box-title {
      font-weight: 700;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <main class="instructions">
    <h1 class="instructions__title">Table Lamp<br>Instructions</h1>
    <p class="instructions__subtitle">${globeType}</p>

    <section class="instructions__section">
      <h2 class="instructions__heading">Instructions For Installation:</h2>
      <ol class="instructions__list">
        <li>Before connecting to electricity supply assemble the lamp. Remove the stem screw, install the shade onto the base and replace the stem screw to secure the lamp shade.</li>
        <li>Install the bulb ${globeType} to the lamp holder.</li>
        <li>Check to ensure that all components have been assembled correctly.</li>
        <li>Connect to the electricity supply.</li>
      </ol>
    </section>

    <section class="instructions__section">
      <h2 class="instructions__heading">Care Instructions:</h2>
      <p class="instructions__paragraph">To clean, unplug the lamp from the electricity supply and allow the bulb to cool for at least 10 minutes before touching it. Wipe with a dry cloth.</p>
      <p class="instructions__paragraph">To change a globe, unplug the lamp from the electricity supply and allow the bulb to cool for at least 10 minutes before touching it. Then proceed to change the globe and ensure the new bulb is secure before reconnecting to the electricity supply.</p>
      <p class="instructions__paragraph">For indoor use only.</p>
    </section>

    <section class="instructions__section">
      <h2 class="instructions__heading">Important Safety Instructions:</h2>
      <p class="instructions__intro">The following safety precautions should always be followed, to reduce the risk of electric shock, personal injury or fire. It is important to read all of these instructions carefully before using the product, and to save them for future reference or new users.</p>
      <ol class="instructions__list">
        <li>This product must only be used as intended in accordance with the enclosed operating instructions.</li>
        <li>Do not carry the appliance by the mains cable or pull the cable to remove the plug from the socket.</li>
        <li>If the lamp stops unexpectedly or appears to malfunction, unplug from the mains and stop using immediately. Seek professional advice to rectify the fault or make repairs.</li>
        <li>Switch off the power supply or unplug from the mains socket when not in use, before cleaning or changing accessories.</li>
        <li>Avoid positioning the lamp where the power cable might be accidentally trapped or damaged.</li>
        <li>Keep the lamp and cable away from sources of heat, sharp objects or anything that may cause damage.</li>
        <li>Ensure the lamp is switched OFF before connecting to the mains power supply.</li>
        <li>Be aware that some surfaces may become hot. Do not touch hot surfaces and supervise others accordingly.</li>
        <li>This product has not been designed for use by children.</li>
        <li>Children should be closely supervised at all times when they are near any electrical appliance.</li>
        <li>To protect against electric shock, never allow the lamp, the mains cable or plug to come into contact with water or any other liquid.</li>
        <li>Never reach for any appliance that has fallen into water. Switch off the power supply at the mains immediately and unplug. Do not re-use until the product has been inspected and approved by a qualified electrician.</li>
        <li>Always ensure that hands are dry before operating or adjusting any switch on the product or touching the plug and mains supply connections.</li>
        <li>To disconnect, first ensure that all controls are in the OFF position, then remove the plug from the electricity supply.</li>
        <li>Where relevant keep all ventilation slots, filters, etc. uncovered and clear of debris. Never drop or insert objects into the openings.</li>
        <li>Do not use outdoors. This lamp has been designed for domestic indoor use only.</li>
      </ol>
    </section>

    <section class="instructions__section">
      <ul class="instructions__symbol-list">
        <li>Class II: Double insulated. Does not require an earth connection.</li>
        <li>Indoor use only.</li>
        <li>RCM (Regulatory Compliance Mark) - Indicates compliance with Australian/New Zealand safety and EMC requirements.</li>
      </ul>
    </section>

    <section class="instructions__section instructions__section--last">
      <div class="instructions__bottom">
        <div>
          <h2 class="instructions__heading">Product Specifications:</h2>
          <ul class="instructions__specs">
            <li>Switch Type: Cord Line On/Off</li>
            <li>Voltage: 220-240V~, 50Hz</li>
            <li>Globe Type: ${globeType} (NOT INCLUDED)</li>
            <li>MAX. 25 Watt Globe</li>
          </ul>
          <p class="instructions__note">Note: Only use a bulb that is rated lower than the recommended bulb rating as detailed above.</p>
          <p class="instructions__made">Made in China.</p>
        </div>

        <div>
          <div class="instructions__box">
            <span class="instructions__box-title">Warning:</span> Globe may become hot during operation. Do not touch globe during or after operation.
          </div>
          <div class="instructions__box">
            <span class="instructions__box-title">Caution:</span> If the external flexible cable or cord of this luminaire is damaged, it shall be exclusively replaced by the manufacturer or his service agent or a similar qualified person in order to avoid a hazard.
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
`;

mkdirSync(outputDir, { recursive: true });

const printPdf = ({ htmlPath, pdfPath, profileDir }) => new Promise((resolve, reject) => {
  const child = spawn(chromeBin, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--metrics-recording-only',
    '--password-store=basic',
    '--run-all-compositor-stages-before-draw',
    '--use-mock-keychain',
    `--user-data-dir=${profileDir}`,
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).toString(),
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  let settled = false;

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  const hasPdf = () => existsSync(pdfPath) && statSync(pdfPath).size > 0;

  const settle = (error) => {
    if (settled) {
      return;
    }

    settled = true;
    clearTimeout(timeout);
    clearInterval(pdfCheck);

    if (!child.killed) {
      child.kill('SIGTERM');
    }

    if (error) {
      reject(error);
      return;
    }

    resolve();
  };

  const pdfCheck = setInterval(() => {
    if (hasPdf()) {
      settle();
    }
  }, 500);

  const timeout = setTimeout(() => {
    if (hasPdf()) {
      settle();
      return;
    }

    settle(new Error(`Chrome did not generate ${pdfPath}.\n${stderr}`));
  }, 20000);

  child.on('error', (error) => {
    settle(error);
  });

  child.on('close', (code) => {
    if (hasPdf()) {
      settle();
      return;
    }

    settle(new Error(`Chrome exited with ${code} before writing ${pdfPath}.\n${stderr}`));
  });
});

for (const variant of variants) {
  const htmlPath = resolve(outputDir, `table-lamp-instructions-${variant.slug}.html`);
  const pdfPath = resolve(outputDir, `table-lamp-instructions-${variant.slug}.pdf`);
  const profileDir = mkdtempSync(resolve(tmpdir(), `hayhay-lamp-${variant.slug}-`));

  writeFileSync(htmlPath, renderHtml(variant));
  rmSync(pdfPath, { force: true });

  await printPdf({ htmlPath, pdfPath, profileDir });

  try {
    rmSync(profileDir, { force: true, recursive: true });
  } catch {
    // Chrome may release profile files just after the PDF has been written.
  }

  console.log(`Generated ${htmlPath}`);
  console.log(`Generated ${pdfPath}`);
}
