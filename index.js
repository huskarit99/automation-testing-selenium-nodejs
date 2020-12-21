const fs = require('fs');
const fastcsv = require('fast-csv');
const puppeteerChrome = require('puppeteer');
const puppeteerFirefox = require('puppeteer-firefox');

var page;
var driver;
var result;
var error;
const data = [];
var data_result = [];

const FIREFOX = 'firefox';
const CHROME = 'chrome';

function chooseBrowser(browser) {
  const nomalizeBrowser = browser.toLowerCase();
  switch (nomalizeBrowser) {
    case 'chrome':
      return puppeteerChrome.launch({
        "headless": true,
        "args": ['--no-sandbox']
      })
      break;
    case 'firefox':
      return puppeteerFirefox.launch({
        "headless": true,
        "args": ['--no-sandbox']
      })
      break;
  }
}

function fieldBuild(build) {
  var item;
  const nomalizeBuild = build.toLowerCase();
  switch (nomalizeBuild) {
    case 'prototype':
      item = 0;
      break;
    case '1':
      item = 1;
      break;
    case '2':
      item = 2;
      break;
    case '3':
      item = 3;
      break;
    case '4':
      item = 4;
      break;
    case '5':
      item = 5;
      break;
    case '6':
      item = 6;
      break;
    case '7':
      item = 7;
      break;
    case '8':
      item = 8;
      break;
    case '9':
      item = 9;
      break;
  }
  const id = "select#" + "selectBuild";
  return page.select(id, item.toString());
}

function fieldNumberFirst(firstNumber) {
  const value = firstNumber;
  return page.evaluate((value) => {
    document.querySelector('#number1Field').value = value;
  }, value);
}

function fieldNumberSecond(secondNumber) {
  const value = secondNumber;
  return page.evaluate((value) => {
    document.querySelector('#number2Field').value = value;
  }, value);
}

function fieldOpertion(operation) {
  var item;
  const nomalizeOperation = operation.toUpperCase();
  switch (nomalizeOperation) {
    case 'A':
      item = '0';
      break;
    case 'S':
      item = '1';
      break;
    case 'M':
      item = '2';
      break;
    case 'D':
      item = '3';
      break;
    case 'C':
      item = '4';
      break;
  }
  const id = "select#" + "selectOperationDropdown";
  return page.select(id, item);
}

function buttonCalculate() {
  return page.$eval('input#calculateButton', button => button.click());
}

async function fieldErrorMsg() {
  const element = await page.$("#errorMsgField");
  return page.evaluate(element => element.innerHTML, element);
}

function buttonClear() {
  const value = "";
  return page.evaluate((value) => {
    document.querySelector('#numberAnswerField').value = value;
  }, value);

}

async function fieldAnswer() {
  const element = await page.$("#numberAnswerField");
  return page.evaluate(element => element.value, element);
}

function checkboxIntegersOnly(integersOnly) {
  const nomalizeIntegresOnly = integersOnly.toString().toUpperCase();
  switch (nomalizeIntegresOnly) {
    case 'F':
      break;
    case 'T':
      return page.$eval("#integerSelect", el => { el.checked = true });
      break;
  }
}

function testData(build, firstNumber, secondNumber, operation, integersOnly) {
  return new Promise(async (res, rej) => {
    await fieldBuild(build);
    await fieldNumberFirst(firstNumber);
    await fieldNumberSecond(secondNumber);
    await fieldOpertion(operation);
    await buttonCalculate();
    await checkboxIntegersOnly(integersOnly);
    error = await fieldErrorMsg();
    result = await fieldAnswer();
    // button clear //
    await page.$eval("#integerSelect", el => { el.checked = false });
    await buttonClear();
    //
    res("done");
  });
}

function nomalizeNameVariables(row) {
  const build = row['Build'],
    firstNumber = row['FirstNumber'],
    secondNumber = row['SecondNumber'],
    operation = row['Operation'],
    integersOnly = row['IntegersOnly'];
  return {
    build,
    firstNumber,
    secondNumber,
    operation,
    integersOnly
  };
}

function processing() {
  var id = 0;
  return new Promise(async (res, rej) => {
    driver = await chooseBrowser(CHROME);
    page = await driver.newPage();
    await page.goto("https://testsheepnz.github.io/BasicCalculator.html");

    for (var row of data) {
      id += 1;
      const { build, firstNumber, secondNumber, operation, integersOnly } = nomalizeNameVariables(row);
      console.log("Processing testcase " + id.toString() + ": " + id.toString() + "/" + data.length.toString());

      await testData(build, firstNumber, secondNumber, operation, integersOnly);
      const nomalizeResult = await result.toString().toLowerCase();
      const errorExpected = error;


      await testData('prototype', firstNumber, secondNumber, operation, integersOnly);
      const nomalizeExpectedValue = await result.toString().toLowerCase();
      const errorBuild = error;

      var resultTest = "FAIL";
      if (errorExpected === errorBuild && nomalizeExpectedValue === nomalizeResult) {
        resultTest = "PASS";
      }

      // console.log(nomalizeExpectedValue + "  " + nomalizeResult + " " + error);
      data_result.push({
        'result_from_calculator': nomalizeResult,
        'expected_result': nomalizeExpectedValue,
        'error': error,
        'result_test': resultTest
      });
    };
    await page.close();
    await driver.close();
    res("done");
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

function writeFileCsv() {
  return new Promise((res, rej) => {
    const ws = fs.createWriteStream("result.csv");
    fastcsv
      .write(data_result, { headers: true })
      .pipe(ws);
    res("done");
  });
}

async function main() {
  console.log("Booting program");
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