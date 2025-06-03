const { Builder, By, until } = require('selenium-webdriver');
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
    chromeOptions.windowSize(screen);

    console.log('ini builder');
    const builder = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions);

    console.log('driver creation');  
    let driver = await builder.build();

    try {
        console.log('Navigating to app...');
        await driver.get('http://localhost:8080');
        
        // Wait for page load and Flutter initialization
        console.log('Aguardando carregamento da página e inicialização do Flutter...');
        await driver.sleep(20000); // Increased wait time for Flutter initialization
        
        // Take initial screenshot
        await driver.takeScreenshot().then((image) => {
            fs.writeFileSync('./fotos/markup2/tela-inicio.png', image, 'base64');
            console.log('Gravou Foto 1 - Tela Inicial');
        });

        // Try to find the button using the exact identifier from Semantics widget
        console.log('Procurando botão "Grupo CI_CD_8"...');
        
        // Array of possible selectors to try, starting with the most specific
        const selectors = [
            // By Semantics identifier
            By.css('[data-semantics-identifier="Grupo CI_CD_8"]'),
            By.css('[data-semantics-role="button"][data-semantics-label="Grupo CI_CD_8"]'),
            // By Flutter-specific selectors
            By.css('flt-semantics[aria-label="Grupo CI_CD_8"]'),
            // By text content in Flutter elements
            By.xpath("//flt-semantics[contains(., 'Grupo CI_CD_8')]"),
            // Generic text search as fallback
            By.xpath("//*[contains(text(), 'Grupo CI_CD_8')]")
        ];

        let button = null;
        for (const selector of selectors) {
            try {
                console.log('Tentando novo seletor...');
                // Wait up to 5 seconds for each selector
                button = await driver.wait(until.elementLocated(selector), 5000);
                if (button) {
                    console.log('Botão encontrado!');
                    break;
                }
            } catch (e) {
                // Continue to next selector if this one fails
                continue;
            }
        }

        if (button) {
            console.log('Clicando no botão...');
            await button.click();
            await driver.sleep(5000);
            
            // Take screenshot after clicking
            await driver.takeScreenshot().then((image) => {
                fs.writeFileSync('./fotos/markup2/tela-login.png', image, 'base64');
                console.log('Gravou Foto 2 - Tela de Login');
            });
        } else {
            throw new Error('Botão "Grupo CI_CD_8" não encontrado após tentar todos os seletores');
        }
    } catch (error) {
        console.error('Erro durante o teste:', error);
        throw error;
    } finally {
        await driver.quit();
    }
})();  