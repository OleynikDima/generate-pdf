import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { GeneratePdfDto } from '../dto/pdf.dto';

const PATH_TEMPLATE_RECEIPT = '../../../src/pdf/templates/order-receipt.html';
const PATH_TEMP = 'tmp';
const NAME_PDF = 'generate-pdf';

function replaceHtml(htmlPath: string, data: GeneratePdfDto) {
  const { orderId, data: orderData, config } = data;
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html
    .replace('{{titleOrder}}', config?.title)
    .replace('{{orderId}}', orderId)
    .replace('{{customer}}', orderData.customer);

  if (config?.includeTimestamp) {
    const localDate = new Date().toLocaleString();
    html = html
      .replace(/{{#if includeTimestamp}}([\s\S]*?){{\/if}}/g, '$1')
      .replace('{{timestamp}}', localDate);
  } else {
    html = html.replace(/{{#if includeTimestamp}}([\s\S]*?){{\/if}}/g, '');
  }
  const itemsHtml = orderData.items
    .map(
      (i) =>
        `<tr><td>${i.name}</td><td style="text-align:right;">$ ${i.price}</td></tr>`,
    )
    .join('');

  html = html.replace(/{{#each items}}([\s\S]*?){{\/each}}/, itemsHtml);
  return html;
}

function getLocalTime() {
  const localDate = new Date();
  return localDate
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
}

process.on('message', (data: { data: GeneratePdfDto }) => {
  void (async () => {
    try {
      if (!data.data) {
        return process.send?.({ status: false, error: 'Not found data' });
      }

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const htmlPath = path.resolve(__dirname, PATH_TEMPLATE_RECEIPT);
      const tmpPath = path.resolve(process.cwd(), PATH_TEMP);

      if (!fs.existsSync(htmlPath)) {
        await browser.close();
        process.send?.({
          status: false,
          error: `Template not found at: ${htmlPath}`,
        });
        return;
      }

      const html = replaceHtml(htmlPath, data.data);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath);
      }
      const localDate = getLocalTime();
      const PATH_TO_PDF = `${PATH_TEMP}/${NAME_PDF}_${localDate}.pdf`;

      await page.pdf({
        path: PATH_TO_PDF,
        format: 'A4',
        printBackground: true,
      });

      await browser.close();
      process.send?.({ status: true, path: PATH_TO_PDF });
    } catch (error) {
      console.error('Error generating PDF:', error);
      process.send?.({
        status: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })();
});
