const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

const puppeteer = require('puppeteer');

app.use(cors());
app.use(bodyParser.json());

app.post('/', async (req, res) => {
	console.log('here', req.body.template);
	// fs.writeFile('temp.html', req.body.template.content, (err) => {
	// 	if (err) throw err;
	// 	console.log('The file has been saved!');
	// });

	const {
		content,
		options: {
			fileName,
			format,
			headerTemplate,
			footerTemplate,
			displayHeaderFooter,
		},
	} = req.body.template;

	var tempContent =
		'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Our Cool PDF Report</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" /><script src="https://d3js.org/d3.v5.min.js"></script></head><body>' +
		content +
		'</body></html>';

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

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
	await page.goto(`data:text/html;charset=UTF-8,${tempContent}`, {
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
