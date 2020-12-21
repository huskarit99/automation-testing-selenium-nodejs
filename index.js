const fs = require('fs');
const fastcsv = require('fast-csv');
const webdrive = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');


var driver;
const data = [];
const builds = [];
var data_result = [];
const operations = [];


function chooseBrowser(browser) {
	const nomalizeBrowser = browser.toLowerCase();
	var options;
	switch (nomalizeBrowser) {
		case 'chrome':
			options = new chrome.Options().headless();
			driver = new webdrive.Builder()
				.forBrowser('chrome')
				.setChromeOptions(options)
				.build();
			break;
		case 'firefox':
			options = new firefox.Options();
			options.addArguments("-headless");

			driver = new webdrive.Builder()
				.forBrowser('firefox')
				.setFirefoxOptions(options)
				.build();
			break;
	}
}

function fieldBuild(build) {
	var id;
	const nomalizeBuild = build.toLowerCase();
	switch (nomalizeBuild) {
		case 'prototype':
			id = 0;
			break;
		case '1':
			id = 1;
			break;
		case '2':
			id = 2;
			break;
		case '3':
			id = 3;
			break;
		case '4':
			id = 4;
			break;
		case '5':
			id = 5;
			break;
		case '6':
			id = 6;
			break;
		case '7':
			id = 7;
			break;
		case '8':
			id = 8;
			break;
		case '9':
			id = 9;
			break;
	}
	driver.findElement(webdrive.By.css(builds[id])).click();
}

function fieldNumberFirst(firstNumber) {
	const inputFieldNumberFirst = driver.findElement(webdrive.By.id('number1Field'));
	inputFieldNumberFirst.sendKeys(firstNumber.toString());
}

function fieldNumberSecond(secondNumber) {
	const inputFieldNumberSecond = driver.findElement(webdrive.By.id('number2Field'));
	inputFieldNumberSecond.sendKeys(secondNumber.toString());
}

function fieldOpertion(operation) {
	var id;
	const nomalizeOperation = operation.toUpperCase();
	switch (nomalizeOperation) {
		case 'A':
			id = 0;
			break;
		case 'S':
			id = 1;
			break;
		case 'M':
			id = 2;
			break;
		case 'D':
			id
		case 'C':
			id = 4;
			break;
	}
	driver.findElement(webdrive.By.css(operations[id])).click();
}

function buttonCalculate() {
	driver.findElement(webdrive.By.id('calculateButton')).click();
}

async function fieldAnswer(expectedValue) {
	const nomalizeExpectedValue = expectedValue.toString().toLowerCase();
	const result = await driver.findElement(webdrive.By.id('numberAnswerField')).getAttribute("value");
	const nomalizeResult = result.toString().toLowerCase();
	data_result.push({
		'result_from_calculator': nomalizeResult,
		'expected_result': nomalizeExpectedValue
	});
}

function checkboxIntegersOnly(integersOnly) {
	const nomalizeIntegresOnly = integersOnly.toString().toUpperCase();
	switch (nomalizeIntegresOnly) {
		case 'F':
			break;
		case 'T':
			driver.findElement(webdrive.By.id('integerSelect')).click();
			break;
	}
}

async function process(id, build, firstNumber, secondNumber, operation, integersOnly, browser, expectedValue) {
	// console.log(id + " " + build + " " + firstNumber + " " + secondNumber + " " + operation + " " + integersOnly + " " + browser + " " + expectedValue + " ");
	// Open Browser
	chooseBrowser(browser);

	// Go to Website to test
	driver.get('https://testsheepnz.github.io/BasicCalculator.html').then(async () => {
		// Automation select: choose one of builds
		fieldBuild(build);

		// Automation type: Input Field Number First
		fieldNumberFirst(firstNumber);

		// Automation type: Input Field Number First
		fieldNumberSecond(secondNumber);

		// Automation select: choose one of operations
		fieldOpertion(operation);

		// Automation checkbox integers only:
		checkboxIntegersOnly(integersOnly);

		// Automation click to calculate
		buttonCalculate();
		await fieldAnswer(expectedValue);
	}).catch((e) => {
		console.log(e);
	});
}

function preprocessing(row) {
	const id = row['TestCase'],
		build = row['Build'],
		firstNumber = row['FirstNumber'],
		secondNumber = row['SecondNumber'],
		operation = row['Operation'],
		integersOnly = row['IntegersOnly'],
		browser = row['Browser'],
		expectedValue = row['ExpectedValue'];
	return {
		id,
		build,
		firstNumber,
		secondNumber,
		operation,
		integersOnly,
		browser,
		expectedValue
	};
}

async function processing() {
	return Promise((res, rej) => {
		data.map(async (row) => {
			const { id, build, firstNumber, secondNumber, operation, integersOnly, browser, expectedValue } = preprocessing(row);
			console.log("Processing testcase " + id.toString() + ": " + id.toString() + "/" + data.length.toString());
			await process(id, build, firstNumber, secondNumber, operation, integersOnly, browser, expectedValue);
		});
	});
}

async function readFileCsv() {
	const csv = require('csv-parser');
	const fs = require('fs');

	const readStream = fs.createReadStream('./ExecutionTestCases.csv').pipe(csv());
	for await (const row of readStream) {
		data.push(row);
	}
}

function init() {
	// Autiomation select Operations: Add, Subtract, Multiply, Divide, Concatenate.
	// Add
	operations.push("#selectOperationDropdown > option:nth-child(1)");
	// Substract
	operations.push("#selectOperationDropdown > option:nth-child(2)");
	// Multiply
	operations.push("#selectOperationDropdown > option:nth-child(3)");
	// Divide
	operations.push("#selectOperationDropdown > option:nth-child(4)");
	// Concatenate
	operations.push("#selectOperationDropdown > option:nth-child(5)");

	// Autiomation select builds: prototype, 1, 2, 3, 4, 5, 6, 7, 8, 9.
	// build: prototype
	builds.push("#selectBuild > option:nth-child(1)");
	// build: 1
	builds.push("#selectBuild > option:nth-child(2)");
	// build: 2
	builds.push("#selectBuild > option:nth-child(3)");
	// build: 3
	builds.push("#selectBuild > option:nth-child(4)");
	// build: 4
	builds.push("#selectBuild > option:nth-child(5)");
	// build: 5
	builds.push("#selectBuild > option:nth-child(6)");
	// build: 6
	builds.push("#selectBuild > option:nth-child(7)");
	// build: 7
	builds.push("#selectBuild > option:nth-child(8)");
	// build: 8
	builds.push("#selectBuild > option:nth-child(9)");
	// build: 9
	builds.push("#selectBuild > option:nth-child(10)");
}

function writeFileCsv() {
	const ws = fs.createWriteStream("result.csv");
	return new Promise((res, rej) => {
		fastcsv
			.write(data_result, { headers: true })
			.pipe(ws);
	});
}

async function main() {
	console.log("Booting program");
	init();
	console.log("Reading data from file ExecutionTestCases.csv");
	console.log("Waiting ...");
	await readFileCsv();
	console.log("Reading data successfully !!!");
	console.log("We have " + data.length.toString() + " testcases");
	await processing();
	console.log("Processing testcases successfully !!!");
	console.log("Writing data result in file result.csv");
	console.log("Waiting ...");
	await writeFileCsv();
	console.log("Write data result successfully !!!");
}

main();