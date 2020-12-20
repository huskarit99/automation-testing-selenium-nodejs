const webdrive = require('selenium-webdriver');
const data = [];

function process(id, build, firstNumber, secondNumber, operation, integersOnly, browser, expectedValue) {

	console.log(id + build + firstNumber + secondNumber + operation + integersOnly + browser + expectedValue);
	// Open Browser
	const driver = new webdrive.Builder().forBrowser('chrome').build();

	// Go to Website to test
	driver.get('https://testsheepnz.github.io/BasicCalculator.html').then(async () => {

		// Automation type: Input Field Number First
		const inputFieldNumberFirst = driver.findElement(webdrive.By.id('number1Field'));
		inputFieldNumberFirst.sendKeys("2138");

		// Automation type: Input Field Number First
		const inputFieldNumberSecond = driver.findElement(webdrive.By.id('number2Field'));
		inputFieldNumberSecond.sendKeys("12398");

		// Autiomation select Operations: Add, Subtract, Multiply, Divide, Concatenate 
		const operations = [];
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
		// Select one of them
		driver.findElement(webdrive.By.css(operations[4])).click();

		// Automation click to calculate
		driver.findElement(webdrive.By.id('calculateButton')).click();

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

function processing() {
	data.map((row) => {
		const { id, build, firstNumber, secondNumber, operation, integersOnly, browser, expectedValue } = preprocessing(row);
		process(id, build, firstNumber, secondNumber, operation, integersOnly, browser, expectedValue);
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

async function main() {
	await readFileCsv();
	processing();
}

main();