const cors = require('cors');
const chromium = require('chrome-aws-lambda');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const puppeteer = require('puppeteer-core');

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

const IS_LAMBDA = process.env.IS_LAMBDA;

app.post('/generate', async (req, res) => {
	console.log('Initiated processing...');
	const { content, css, linkHref } = req.body.template;

	const executablePath = IS_LAMBDA ? await chromium.executablePath : process.env.CHROMIUM_EXECUTABLE_PATH;
	const browser = await puppeteer.launch({
		args: chromium.args,
		executablePath,
	});
	console.log('Browser launched...');
	const page = await browser.newPage().catch(error => {
		console.log("Error creating new page: ", error);
		throw error;
	});

	console.log('New page created...');

	await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 }).catch(error => {
		console.log('Error setting viewport. ', error);
		throw error;
	});

	console.log('Successfullly set the viewport...');
	await page.setContent(`${content}`, {
		waitUntil: 'networkidle2',
	}).catch(error => {
		console.log("Error adding the content");
		throw error;
	});

	console.log('Successfully set the content...');

	if (Array.isArray(css) && css.length > 0) {
		for (let i = 0; i < css.length; i++) {
			await page.addStyleTag({
				content: style,
			}).catch(error => {
				console.log("Error while adding styles: ", error);
			});
		}
	}

	console.log('Added Styles.');

	if (Array.isArray(linkHref) && linkHref.length > 0) {
		for (let i = 0; i < linkHref.length; i++) {
			await page.addStyleTag({
				url: href,
			}).catch(error => {
				console.log("Error while adding links: ", error);
			});
		}
	}

	console.log('Added links.');

	const options = {
		printBackground: true,
		// We need to careful while providing the path of the file here.
		// In lambda /var/task is where the code is located, and if we provide the path as 'temp.pdf' 
		// then it would throw an error since the filesystem is read-only.
		// If we need to write a file we need to make sure we write it to the filesystem that we have access to.
		// In case of lambda we are allowed to write files in /tmp and hence the path below.
		path: '/tmp/temp.pdf',
		format: 'A4',
		landscape: true,
	};
	console.log('Generate PDF begin...');

	const buffer = await page.pdf(options).catch(error => {
		console.log("Error converting the page to pdf", error);
	});

	console.log('Generate PDF completed...');

	await browser.close().catch(error => {
		console.log("error closing the headless browser", error);
	});

	console.log('Browser closed.');

	res.type('application/pdf');
	res.send(buffer);
});

// Here we export the express app so that we can import this in the lambda function.
module.exports = app;