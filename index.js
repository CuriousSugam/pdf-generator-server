const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

const puppeteer = require('puppeteer');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/', async (req, res) => {
	// fs.writeFile('temp.html', req.body.template.content, (err) => {
	// 	if (err) throw err;
	// 	console.log('The file has been saved!');
	// });

	const {
		content,
		css,
		options: {
			fileName,
			format,
			headerTemplate,
			footerTemplate,
			displayHeaderFooter,
		},
	} = req.body.template;

	var options = {
		headerTemplate: '<p></p>',
		footerTemplate: '<p></p>',
		displayHeaderFooter,
		// margin: {
		// 	top: '10px',
		// 	bottom: '30px',
		// },
		printBackground: true,
		path: 'temp.pdf',
	};

	// var tempContent =
	// 	'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" /><style></style></head><body>' +
	// 	content +
	// 	'</body></html>';

	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
	// const tempCss = 'h6{color: red}';
	if (css) {
		await page.addStyleTag({ content: css });
		// await page.addStyleTag({ content: tempCss });
	}
	await page.goto(`data:text/html;charset=UTF-8,${content}`, {
		waitUntil: 'networkidle2',
	});
	const buffer = await page.pdf(options);

	await browser.close();
	res.type('application/pdf');
	res.send(buffer);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
