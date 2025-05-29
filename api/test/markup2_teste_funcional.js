const { Builder } = require('selenium-webdriver');
const { FlutterSeleniumBridge } = require('@rentready/flutter-selenium-bridge');
const { Browser, By, Key, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const fs = require('fs');

// Ensure the screenshots directory exists
const screenshotsDir = './fotos/markup2';
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
    // Configuração do ambiente do WebDriver e opções do navegador
    const screen = {
        width: 1024,
        height: 720
    };

    console.log('Config chrome');
    const chromeOptions = new Options();
    // comentar as linhas abaixo quando for subir para teste local
    chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.windowSize(screen);

    console.log('ini builder');
    const builder = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions);

    console.log('driver creation');  
    let driver = await builder.build();

    const bridge = new FlutterSeleniumBridge(driver);  

    console.log('Navigating to app...');
    await driver.get('http://localhost:8080'); // Replace with your Flutter Web app URL
    await driver.sleep(10000);

    await driver.takeScreenshot().then((image, err) => {
        require('fs').writeFile('./fotos/markup2/tela-inicio.png', image, 'base64', function (err) {
          if (err == null){
              console.log('Gravou Foto 1 - Tela Inicial');
          }else{
              console.log('Erro ->' + err);
          }
        });
      });

    // Test Multiplier Markup
    const multiplierButtonXPath = "//flt-semantics[text()='Multiplier Markup']";
    const multiplierButton = await driver.findElement(By.xpath(multiplierButtonXPath));
    await multiplierButton.click();  

    await driver.sleep(5000);
    await driver.takeScreenshot().then((image, err) => {
        require('fs').writeFile('./fotos/markup2/tela-multiplier.png', image, 'base64', function (err) {
          if (err == null){
              console.log('Gravou Foto 2 - Tela Multiplier');
          }else{
              console.log('Erro ->' + err);
          }
        });
      });

    // Seleciona todos os inputs, textareas e elementos contenteditable
    const inputs = await driver.findElements(By.css('textarea, input, [contenteditable="true"]'));
    // Itera e coleta os dados
    const results = [];
    for (let el of inputs) {
      const tag = await el.getTagName();
      let value = await el.getAttribute('value');
      if (!value) {
        value = await el.getText(); // fallback para contenteditable
      }
      // textContent via getProperty (equivalente ao .textContent do navegador)
      const textProp = await el.getProperty('textContent');
      results.push({
        tag,
        value: value || '(vazio)',
        textProp: textProp || '(vazio)',
      });
    }
    
    // Fill inputs
    await inputs[0].sendKeys('100');   
    await inputs[1].sendKeys('20');   
    
    // Imprime em formato de tabela
    console.table(results);

    const calculateButtonXPath = "//flt-semantics[text()='Calculate']";
    const calculateButton = await driver.findElement(By.xpath(calculateButtonXPath));
    await calculateButton.click();
    await driver.sleep(5000);  

    await driver.takeScreenshot().then((image, err) => {
        require('fs').writeFile('./fotos/markup2/resultado-multiplier.png', image, 'base64', function (err) {
          if (err == null){
              console.log('Gravou Foto 3 - Resultado Multiplier');
          }else{
              console.log('Erro ->' + err);
          }
        });
      });

    // Test Divisor Markup
    const backButtonXPath = "//flt-semantics[text()='Back']";
    const backButton = await driver.findElement(By.xpath(backButtonXPath));
    await backButton.click();
    await driver.sleep(2000);

    const divisorButtonXPath = "//flt-semantics[text()='Divisor Markup']";
    const divisorButton = await driver.findElement(By.xpath(divisorButtonXPath));
    await divisorButton.click();
    await driver.sleep(5000);

    await driver.takeScreenshot().then((image, err) => {
        require('fs').writeFile('./fotos/markup2/tela-divisor.png', image, 'base64', function (err) {
          if (err == null){
              console.log('Gravou Foto 4 - Tela Divisor');
          }else{
              console.log('Erro ->' + err);
          }
        });
      });

    // Fill divisor inputs
    const divisorInputs = await driver.findElements(By.css('textarea, input, [contenteditable="true"]'));
    await divisorInputs[0].sendKeys('100');
    await divisorInputs[1].sendKeys('20');

    const divisorCalculateButton = await driver.findElement(By.xpath(calculateButtonXPath));
    await divisorCalculateButton.click();
    await driver.sleep(5000);

    await driver.takeScreenshot().then((image, err) => {
        require('fs').writeFile('./fotos/markup2/resultado-divisor.png', image, 'base64', function (err) {
          if (err == null){
              console.log('Gravou Foto 5 - Resultado Divisor');
          }else{
              console.log('Erro ->' + err);
          }
        });
      });

   await driver.sleep(5000);
   driver.quit();    
})(); 