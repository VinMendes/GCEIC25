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
        await driver.sleep(20000);
        
        // Take initial screenshot
        await driver.takeScreenshot().then((image) => {
            fs.writeFileSync('./fotos/markup2/tela-inicio.png', image, 'base64');
            console.log('Gravou Foto 1 - Tela Inicial');
        });

        // Try to find the CI_CD_8 button using multiple selectors
        console.log('Procurando botão "Grupo CI_CD_8"...');
        const selectors = [
            By.css('[data-semantics-identifier="Grupo CI_CD_8"]'),
            By.css('[data-semantics-role="button"][data-semantics-label="Grupo CI_CD_8"]'),
            By.css('flt-semantics[aria-label="Grupo CI_CD_8"]'),
            By.xpath("//flt-semantics[contains(., 'Grupo CI_CD_8')]"),
            By.xpath("//*[contains(text(), 'Grupo CI_CD_8')]")
        ];

        let button = null;
        for (const selector of selectors) {
            try {
                console.log('Tentando novo seletor...');
                button = await driver.wait(until.elementLocated(selector), 5000);
                if (button) {
                    console.log('Botão encontrado!');
                    break;
                }
            } catch (_) {
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

            // Handle login
            console.log('Preenchendo formulário de login...');
            
            // Wait for Flutter to fully render the form
            await driver.sleep(2000);
            
            // Try to find email input using multiple selectors
            const emailSelectors = [
                By.css('[data-semantics-identifier="Email"]'),
                By.css('[data-semantics-role="textbox"][data-semantics-label="Email"]'),
                By.css('flt-semantics[aria-label="Email"]'),
                By.xpath("//flt-semantics[contains(@aria-label, 'Email')]//input"),
                By.xpath("//input[@aria-label='Email']")
            ];

            let emailInput = null;
            for (const selector of emailSelectors) {
                try {
                    emailInput = await driver.wait(until.elementLocated(selector), 5000);
                    if (emailInput && await emailInput.isDisplayed()) {
                        console.log('Campo de email encontrado!');
                        break;
                    }
                } catch (error) {
                    console.log('Tentando próximo seletor para email... Erro:', error.message);
                    continue;
                }
            }

            if (!emailInput) {
                throw new Error('Campo de email não encontrado');
            }

            // Try to find password input using multiple selectors
            const passwordSelectors = [
                By.css('[data-semantics-identifier="Senha"]'),
                By.css('[data-semantics-role="textbox"][data-semantics-label="Senha"]'),
                By.css('flt-semantics[aria-label="Senha"]'),
                By.xpath("//flt-semantics[contains(@aria-label, 'Senha')]//input"),
                By.xpath("//input[@aria-label='Senha']")
            ];

            let passwordInput = null;
            for (const selector of passwordSelectors) {
                try {
                    passwordInput = await driver.wait(until.elementLocated(selector), 5000);
                    if (passwordInput && await passwordInput.isDisplayed()) {
                        console.log('Campo de senha encontrado!');
                        break;
                    }
                } catch (error) {
                    console.log('Tentando próximo seletor para senha... Erro:', error.message);
                    continue;
                }
            }

            if (!passwordInput) {
                throw new Error('Campo de senha não encontrado');
            }

            // Use JavaScript to set values directly
            await driver.executeScript("arguments[0].value = arguments[1];", emailInput, 'admin@email.com');
            await driver.executeScript("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", emailInput);
            await driver.sleep(1000);
            
            await driver.executeScript("arguments[0].scrollIntoView(true);", passwordInput);
            await driver.wait(until.elementIsVisible(passwordInput), 5000);
            
            await driver.executeScript("arguments[0].value = arguments[1];", passwordInput, '123456');
            await driver.executeScript("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", passwordInput);
            await driver.sleep(1000);

            // Find and click login button
            const loginButtonSelectors = [
                By.css('[data-semantics-label="Entrar"]'),
                By.css('flt-semantics[aria-label="Entrar"]'),
                By.xpath("//flt-semantics[contains(., 'Entrar')]"),
                By.xpath("//*[contains(text(), 'Entrar')]")
            ];

            let loginButton = null;
            for (const selector of loginButtonSelectors) {
                try {
                    loginButton = await driver.wait(until.elementLocated(selector), 5000);
                    if (loginButton && await loginButton.isDisplayed()) {
                        console.log('Botão de login encontrado!');
                        break;
                    }
                } catch (_) {
                    console.log('Tentando próximo seletor para botão de login...');
                    continue;
                }
            }

            if (!loginButton) {
                throw new Error('Botão de login não encontrado');
            }

            // Use JavaScript click instead of direct click
            await driver.executeScript("arguments[0].click();", loginButton);
            await driver.sleep(5000);

            // Take screenshot after clicking
            await driver.takeScreenshot().then((image) => {
                fs.writeFileSync('./fotos/markup2/tela-apos-login.png', image, 'base64');
                console.log('Gravou Foto 3 - Tela Após Login');
            });

            // Test Multiplier Markup
            console.log('Testando Calculadora de Markup...');
            const multiplierSelectors = [
                By.css('[data-semantics-label="Calculadora de Markup"]'),
                By.xpath("//flt-semantics[contains(., 'Calculadora de Markup')]")
            ];

            let multiplierButton = null;
            for (const selector of multiplierSelectors) {
                try {
                    multiplierButton = await driver.wait(until.elementLocated(selector), 5000);
                    if (multiplierButton) break;
                } catch (_) {
                    continue;
                }
            }

            if (multiplierButton) {
                await multiplierButton.click();
                await driver.sleep(5000);

                await driver.takeScreenshot().then((image) => {
                    fs.writeFileSync('./fotos/markup2/tela-multiplier.png', image, 'base64');
                    console.log('Gravou Foto 4 - Tela Multiplier');
                });

                // Fill multiplier inputs
                const multiplierInputs = await driver.findElements(By.css('textarea, input, [contenteditable="true"]'));
                await multiplierInputs[0].sendKeys('100');
                await multiplierInputs[1].sendKeys('20');
                await multiplierInputs[2].sendKeys('30');

                // Find and click calculate button
                const calculateSelectors = [
                    By.css('[data-semantics-label="Calculate"]'),
                    By.xpath("//flt-semantics[contains(., 'Calculate')]")
                ];

                let calculateButton = null;
                for (const selector of calculateSelectors) {
                    try {
                        calculateButton = await driver.wait(until.elementLocated(selector), 5000);
                        if (calculateButton) break;
                    } catch (_) {
                        continue;
                    }
                }

                if (calculateButton) {
                    await calculateButton.click();
                    await driver.sleep(5000);

                    await driver.takeScreenshot().then((image) => {
                        fs.writeFileSync('./fotos/markup2/resultado-multiplier.png', image, 'base64');
                        console.log('Gravou Foto 5 - Resultado Multiplier');
                    });

                    // Test Divisor Markup
                    console.log('Testando Calculadora de Divisão de Markup...');
                    const backSelectors = [
                        By.css('[data-semantics-label="Back"]'),
                        By.xpath("//flt-semantics[contains(., 'Back')]")
                    ];

                    let backButton = null;
                    for (const selector of backSelectors) {
                        try {
                            backButton = await driver.wait(until.elementLocated(selector), 5000);
                            if (backButton) break;
                        } catch (_) {
                            continue;
                        }
                    }

                    if (backButton) {
                        await backButton.click();
                        await driver.sleep(2000);

                        const divisorSelectors = [
                            By.css('[data-semantics-label="Calculadora de Divisão de Markup"]'),
                            By.xpath("//flt-semantics[contains(., 'Calculadora de Divisão de Markup')]")
                        ];

                        let divisorButton = null;
                        for (const selector of divisorSelectors) {
                            try {
                                divisorButton = await driver.wait(until.elementLocated(selector), 5000);
                                if (divisorButton) break;
                            } catch (_) {
                                continue;
                            }
                        }

                        if (divisorButton) {
                            await divisorButton.click();
                            await driver.sleep(5000);

                            await driver.takeScreenshot().then((image) => {
                                fs.writeFileSync('./fotos/markup2/tela-divisor.png', image, 'base64');
                                console.log('Gravou Foto 6 - Tela Divisor');
                            });

                            // Fill divisor inputs
                            const divisorInputs = await driver.findElements(By.css('textarea, input, [contenteditable="true"]'));
                            await divisorInputs[0].sendKeys('100');
                            await divisorInputs[1].sendKeys('20');

                            // Find and click calculate button again
                            let divisorCalculateButton = null;
                            for (const selector of calculateSelectors) {
                                try {
                                    divisorCalculateButton = await driver.wait(until.elementLocated(selector), 5000);
                                    if (divisorCalculateButton) break;
                                } catch (_) {
                                    continue;
                                }
                            }

                            if (divisorCalculateButton) {
                                await divisorCalculateButton.click();
                                await driver.sleep(5000);

                                await driver.takeScreenshot().then((image) => {
                                    fs.writeFileSync('./fotos/markup2/resultado-divisor.png', image, 'base64');
                                    console.log('Gravou Foto 7 - Resultado Divisor');
                                });
                            } else {
                                throw new Error('Botão Calculate não encontrado na calculadora de divisão');
                            }
                        } else {
                            throw new Error('Botão Calculadora de Divisão de Markup não encontrado');
                        }
                    } else {
                        throw new Error('Botão Back não encontrado');
                    }
                } else {
                    throw new Error('Botão Calculate não encontrado na calculadora de multiplicação');
                }
            } else {
                throw new Error('Botão Calculadora de Markup não encontrado');
            }
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