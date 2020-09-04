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

	fs.writeFile('temp.css', css, (err) => {
		if (err) throw err;
		console.log('The css has been saved!');
	});

	fs.writeFile('temp.html', content, (err) => {
		if (err) throw err;
		console.log('The html has been saved!');
	});

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
	// console.log(content);
	// var tempContent =
	// 	// '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" /><style>' +
	// 	'<style>' +
	// 	css +
	// 	'</style>' +
	// 	// '</style></head><body>' +
	// 	content;
	// // '</body></html>';

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
	// const tempCss = 'h6{color: red}';

	await page.setContent(`${content}`, {
		waitUntil: 'networkidle2',
	});

	// const htmlPath = path.join(`file:${process.cwd()}`, 'temp.html');
	// console.log('htmlPath ====>', htmlPath);
	// await page.goto(htmlPath, {
	// 	waitUntil: 'networkidle2',
	// });

	if (css) {
		// await page.addStyleTag({
		// 	path: path.join(`file:${process.cwd()}`, 'temp.css'),
		// });
		// await page.addScriptTag({ url: 'https://d3js.org/d3.v5.min.js' });
		await page.addStyleTag({ content: css });
	}

	// fs.writeFile('test.html', content, function (err) {
	// 	if (err) console.log(err);
	// 	console.log('saved!!!!!!!!');
	// });

	const buffer = await page.pdf(options);

	await browser.close();
	res.type('application/pdf');
	res.send(buffer);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
