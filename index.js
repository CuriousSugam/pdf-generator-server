const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const puppeteer = require('puppeteer');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/', async (req, res) => {
	const { content, css, linkHref } = req.body.template;

	var options = {
		printBackground: true,
		path: 'temp.pdf',
		format: 'A4',
		landscape: true,
	};

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
	await page.setContent(`${content}`, {
		waitUntil: 'networkidle2',
	});

	if (Array.isArray(css) && css.length > 0) {
		css.forEach(async (style) => {
			await page.addStyleTag({
				content: style,
			});
		});
	}

	if (Array.isArray(linkHref) && linkHref.length > 0) {
		linkHref.forEach(async (href) => {
			await page.addStyleTag({
				url: href,
			});
		});
	}

	const buffer = await page.pdf(options);

	await browser.close();
	res.type('application/pdf');
	res.send(buffer);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
