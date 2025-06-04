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
        await driver.sleep(10000);
        
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
                button = await driver.wait(until.elementLocated(selector), 3000);
                if (button) {
                    console.log('Botão encontrado!');
                    break;
                }
            } catch (err) {
                console.log('Seletor falhou, tentando próximo... Erro:', err.message);
                continue;
            }
        }

        if (button) {
            console.log('Clicando no botão...');
            await button.click();
            await driver.sleep(3000);
            
            // Take screenshot after clicking
            await driver.takeScreenshot().then((image) => {
                fs.writeFileSync('./fotos/markup2/tela-login.png', image, 'base64');
                console.log('Gravou Foto 2 - Tela de Login');
            });

            // Handle login
            console.log('Preenchendo formulário de login...');
            
            // Wait longer for Flutter to fully render the form
            await driver.sleep(3000);
            
            // Try to find email input using multiple selectors
            const emailSelectors = [
                By.css('[data-semantics-identifier="Email"]'),
                By.css('input[aria-label="Email"]'),
                By.css('flt-semantics[aria-label="Email"]'),
                By.xpath("//flt-semantics[contains(@aria-label, 'Email')]"),
                By.xpath("//input[@aria-label='Email']")
            ];

            let emailInput = null;
            for (const selector of emailSelectors) {
                try {
                    emailInput = await driver.wait(until.elementLocated(selector), 5000);
                    if (emailInput) {
                        console.log('Campo de email encontrado!');
                        // Try to make the element visible and interactable
                        await driver.executeScript("arguments[0].scrollIntoView(true);", emailInput);
                        await driver.sleep(1000);
                        break;
                    }
                } catch (err) {
                    console.log('Tentando próximo seletor para email... Erro:', err.message);
                    continue;
                }
            }

            if (!emailInput) {
                throw new Error('Campo de email não encontrado');
            }

            // Try to find password input using multiple selectors
            const passwordSelectors = [
                By.css('[data-semantics-identifier="Senha"]'),
                By.css('input[aria-label="Senha"]'),
                By.css('flt-semantics[aria-label="Senha"]'),
                By.xpath("//flt-semantics[contains(@aria-label, 'Senha')]"),
                By.xpath("//input[@aria-label='Senha']")
            ];

            let passwordInput = null;
            for (const selector of passwordSelectors) {
                try {
                    passwordInput = await driver.wait(until.elementLocated(selector), 5000);
                    if (passwordInput) {
                        console.log('Campo de senha encontrado!');
                        // Try to make the element visible and interactable
                        await driver.executeScript("arguments[0].scrollIntoView(true);", passwordInput);
                        await driver.sleep(1000);
                        break;
                    }
                } catch (err) {
                    console.log('Tentando próximo seletor para senha... Erro:', err.message);
                    continue;
                }
            }

            if (!passwordInput) {
                throw new Error('Campo de senha não encontrado');
            }

            // Multiple attempts to set email value
            console.log('Tentando definir valor do email...');
            try {
                // Try direct sendKeys first
                await emailInput.sendKeys('admin@email.com');
            } catch (err) {
                console.log('SendKeys falhou, tentando JavaScript... Erro:', err.message);
                // Try JavaScript if direct input fails
                await driver.executeScript(`
                    arguments[0].value = 'admin@email.com';
                    arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
                    arguments[0].dispatchEvent(new Event('blur', { bubbles: true }));
                `, emailInput);
            }
            
            // Verify email value was set
            const emailValue = await driver.executeScript("return arguments[0].value;", emailInput);
            console.log('Valor do email definido:', emailValue);
            
            await driver.sleep(2000);

            // Multiple attempts to set password value
            console.log('Tentando definir valor da senha...');
            try {
                // Try direct sendKeys first
                await passwordInput.sendKeys('123456');
            } catch (err) {
                console.log('SendKeys falhou, tentando JavaScript... Erro:', err.message);
                // Try JavaScript if direct input fails
                await driver.executeScript(`
                    arguments[0].value = '123456';
                    arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
                    arguments[0].dispatchEvent(new Event('blur', { bubbles: true }));
                `, passwordInput);
            }

            // Verify password value was set
            const passwordValue = await driver.executeScript("return arguments[0].value;", passwordInput);
            console.log('Valor da senha definido:', passwordValue);

            await driver.sleep(2000);

            // Take screenshot to verify form state
            await driver.takeScreenshot().then((image) => {
                fs.writeFileSync('./fotos/markup2/form-preenchido.png', image, 'base64');
                console.log('Gravou Foto - Formulário Preenchido');
            });

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
                    loginButton = await driver.wait(until.elementLocated(selector), 3000);
                    if (loginButton) {
                        console.log('Botão de login encontrado!');
                        // Try to make the element visible and interactable
                        await driver.executeScript("arguments[0].scrollIntoView(true);", loginButton);
                        await driver.sleep(1000);
                        break;
                    }
                } catch (err) {
                    console.log('Tentando próximo seletor para botão de login... Erro:', err.message);
                    continue;
                }
            }

            if (!loginButton) {
                throw new Error('Botão de login não encontrado');
            }

            // Multiple attempts to click the login button
            console.log('Tentando clicar no botão de login...');
            let clickSuccess = false;
            
            // Attempt 1: Direct click
            try {
                await loginButton.click();
                clickSuccess = true;
                console.log('Click direto bem sucedido');
            } catch (err) {
                console.log('Click direto falhou, tentando alternativas... Erro:', err.message);
            }

            // Attempt 2: JavaScript click if direct click failed
            if (!clickSuccess) {
                try {
                    await driver.executeScript("arguments[0].click();", loginButton);
                    clickSuccess = true;
                    console.log('JavaScript click bem sucedido');
                } catch (err) {
                    console.log('JavaScript click falhou... Erro:', err.message);
                }
            }

            // Attempt 3: Try dispatching multiple events if both clicks failed
            if (!clickSuccess) {
                try {
                    await driver.executeScript(`
                        arguments[0].dispatchEvent(new MouseEvent('mouseover', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('mousedown', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('mouseup', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                    `, loginButton);
                    clickSuccess = true;
                    console.log('Event dispatch bem sucedido');
                } catch (err) {
                    console.log('Event dispatch falhou... Erro:', err.message);
                }
            }

            if (!clickSuccess) {
                throw new Error('Não foi possível clicar no botão de login após todas as tentativas');
            }

            // Wait for navigation
            console.log('Aguardando navegação após o login...');
            await driver.sleep(5000);

            // Take screenshot after clicking
            await driver.takeScreenshot().then((image) => {
                fs.writeFileSync('./fotos/markup2/tela-apos-login.png', image, 'base64');
                console.log('Gravou Foto 3 - Tela Após Login');
            });

            // Test Multiplier Markup
            console.log('Testando Calculadora de Markup...');
            await driver.sleep(2000); // Give Flutter time to render the home screen

            const multiplierSelectors = [
                By.xpath("//flt-semantics[contains(@aria-label, 'Calculadora de Markup')]"),
                By.xpath("//flt-semantics[.//text()[contains(., 'Calculadora de Markup')]]"),
                By.css("flt-semantics[aria-label*='Calculadora de Markup']"),
                By.xpath("//*[text()[contains(., 'Calculadora de Markup')]]"),
                By.xpath("//flt-glass-pane//flt-semantics[contains(., 'Calculadora de Markup')]")
            ];

            let multiplierButton = null;
            for (const selector of multiplierSelectors) {
                try {
                    console.log('Tentando encontrar botão Calculadora de Markup com seletor:', selector);
                    // Increase wait time for first attempt after login
                    const timeout = multiplierButton === null ? 5000 : 3000;
                    multiplierButton = await driver.wait(until.elementLocated(selector), timeout);
                    if (multiplierButton) {
                        console.log('Botão Calculadora de Markup encontrado!');
                        // Try to make the element visible and interactable
                        await driver.executeScript("arguments[0].scrollIntoView(true);", multiplierButton);
                        await driver.sleep(1000);

                        // Verify if the element is actually clickable
                        const isClickable = await driver.executeScript(`
                            const rect = arguments[0].getBoundingClientRect();
                            const isVisible = rect.top >= 0 && rect.left >= 0 && 
                                rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
                            return isVisible && arguments[0].offsetWidth > 0 && arguments[0].offsetHeight > 0;
                        `, multiplierButton);

                        if (isClickable) {
                            console.log('Botão está visível e clicável');
                            break;
                        } else {
                            console.log('Botão encontrado mas não está clicável, tentando próximo seletor...');
                            multiplierButton = null;
                            continue;
                        }
                    }
                } catch (err) {
                    console.log('Seletor falhou, tentando próximo... Erro:', err.message);
                    continue;
                }
            }

            if (!multiplierButton) {
                // Take a screenshot of the failure state
                await driver.takeScreenshot().then((image) => {
                    fs.writeFileSync('./fotos/markup2/erro-botao-nao-encontrado.png', image, 'base64');
                    console.log('Gravou Foto - Estado quando botão não foi encontrado');
                });
                throw new Error('Botão Calculadora de Markup não encontrado após tentar todos os seletores');
            }

            // Multiple attempts to click the multiplier button
            console.log('Tentando clicar no botão Calculadora de Markup...');
            let multiplierClickSuccess = false;

            // Attempt 1: Direct click
            try {
                await multiplierButton.click();
                multiplierClickSuccess = true;
                console.log('Click direto bem sucedido');
            } catch (err) {
                console.log('Click direto falhou, tentando alternativas... Erro:', err.message);
            }

            // Attempt 2: JavaScript click if direct click failed
            if (!multiplierClickSuccess) {
                try {
                    await driver.executeScript("arguments[0].click();", multiplierButton);
                    multiplierClickSuccess = true;
                    console.log('JavaScript click bem sucedido');
                } catch (err) {
                    console.log('JavaScript click falhou... Erro:', err.message);
                }
            }

            // Attempt 3: Try dispatching multiple events if both clicks failed
            if (!multiplierClickSuccess) {
                try {
                    await driver.executeScript(`
                        arguments[0].dispatchEvent(new MouseEvent('mouseover', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('mousedown', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('mouseup', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                    `, multiplierButton);
                    multiplierClickSuccess = true;
                    console.log('Event dispatch bem sucedido');
                } catch (err) {
                    console.log('Event dispatch falhou... Erro:', err.message);
                }
            }

            if (!multiplierClickSuccess) {
                throw new Error('Não foi possível clicar no botão Calculadora de Markup após todas as tentativas');
            }

            // Wait for navigation and page load
            console.log('Aguardando navegação e carregamento da página...');
            await driver.sleep(3000);

            // Take screenshot after navigation
            await driver.takeScreenshot().then((image) => {
                fs.writeFileSync('./fotos/markup2/tela-multiplier.png', image, 'base64');
                console.log('Gravou Foto - Tela Multiplier');
            });

            // Fill multiplier inputs
            console.log('Preenchendo campos da Calculadora de Markup...');
            await driver.sleep(2000);

            // Define the input fields we need to fill
            const inputFields = [
                { name: 'Despesas Variáveis', value: '100' },
                { name: 'Despesas Fixas', value: '20' },
                { name: 'Margem de Lucro', value: '30' }
            ];

            // Find and fill each input field
            for (const field of inputFields) {
                console.log(`Procurando campo ${field.name}...`);
                const fieldSelectors = [
                    By.css(`[data-semantics-identifier="${field.name}"]`),
                    By.css(`input[aria-label="${field.name}"]`),
                    By.css(`flt-semantics[aria-label="${field.name}"]`),
                    By.xpath(`//flt-semantics[contains(@aria-label, '${field.name}')]`),
                    By.xpath(`//input[@aria-label='${field.name}']`)
                ];

                let inputElement = null;
                for (const selector of fieldSelectors) {
                    try {
                        inputElement = await driver.wait(until.elementLocated(selector), 3000);
                        if (inputElement) {
                            console.log(`Campo ${field.name} encontrado!`);
                            // Try to make the element visible and interactable
                            await driver.executeScript("arguments[0].scrollIntoView(true);", inputElement);
                            await driver.sleep(1000);
                            break;
                        }
                    } catch (err) {
                        console.log(`Tentando próximo seletor para ${field.name}... Erro:`, err.message);
                        continue;
                    }
                }

                if (!inputElement) {
                    throw new Error(`Campo ${field.name} não encontrado`);
                }

                // Multiple attempts to set the input value
                console.log(`Tentando definir valor do campo ${field.name}...`);
                let setValue = false;

                // Attempt 1: Direct sendKeys
                try {
                    await inputElement.clear();
                    await inputElement.sendKeys(field.value);
                    setValue = true;
                    console.log(`SendKeys bem sucedido para ${field.name}`);
                } catch (err) {
                    console.log(`SendKeys falhou para ${field.name}, tentando JavaScript... Erro:`, err.message);
                }

                // Attempt 2: JavaScript if direct input fails
                if (!setValue) {
                    try {
                        await driver.executeScript(`
                            arguments[0].value = arguments[1];
                            arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                            arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
                            arguments[0].dispatchEvent(new Event('blur', { bubbles: true }));
                        `, inputElement, field.value);
                        setValue = true;
                        console.log(`JavaScript set value bem sucedido para ${field.name}`);
                    } catch (err) {
                        console.log(`JavaScript set value falhou para ${field.name}... Erro:`, err.message);
                    }
                }

                if (!setValue) {
                    throw new Error(`Não foi possível definir o valor para o campo ${field.name}`);
                }

                // Verify the value was set
                const fieldValue = await driver.executeScript("return arguments[0].value;", inputElement);
                console.log(`Valor do campo ${field.name} definido:`, fieldValue);

                await driver.sleep(1000);
            }

            // Take screenshot after filling all fields
            await driver.takeScreenshot().then((image) => {
                fs.writeFileSync('./fotos/markup2/campos-multiplicador-preenchidos.png', image, 'base64');
                console.log('Gravou Foto - Campos do Multiplicador Preenchidos');
            });

            // Find and click calculate button
            console.log('Procurando botão Calculate...');
            const calculateSelectors = [
                By.css('[data-semantics-label="Calculate"]'),
                By.css('flt-semantics[aria-label="Calculate"]'),
                By.xpath("//flt-semantics[contains(., 'Calculate')]"),
                By.xpath("//*[contains(text(), 'Calculate')]")
            ];

            let calculateButton = null;
            for (const selector of calculateSelectors) {
                try {
                    calculateButton = await driver.wait(until.elementLocated(selector), 3000);
                    if (calculateButton) {
                        console.log('Botão Calculate encontrado!');
                        await driver.executeScript("arguments[0].scrollIntoView(true);", calculateButton);
                        await driver.sleep(1000);
                        break;
                    }
                } catch (err) {
                    console.log('Tentando próximo seletor para calculate... Erro:', err.message);
                    continue;
                }
            }

            if (!calculateButton) {
                throw new Error('Botão Calculate não encontrado');
            }

            // Multiple attempts to click the calculate button
            console.log('Tentando clicar no botão Calculate...');
            let calculateClickSuccess = false;

            // Attempt 1: Direct click
            try {
                await calculateButton.click();
                calculateClickSuccess = true;
                console.log('Click direto bem sucedido');
            } catch (err) {
                console.log('Click direto falhou, tentando alternativas... Erro:', err.message);
            }

            // Attempt 2: JavaScript click if direct click failed
            if (!calculateClickSuccess) {
                try {
                    await driver.executeScript("arguments[0].click();", calculateButton);
                    calculateClickSuccess = true;
                    console.log('JavaScript click bem sucedido');
                } catch (err) {
                    console.log('JavaScript click falhou... Erro:', err.message);
                }
            }

            // Attempt 3: Try dispatching multiple events if both clicks failed
            if (!calculateClickSuccess) {
                try {
                    await driver.executeScript(`
                        arguments[0].dispatchEvent(new MouseEvent('mouseover', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('mousedown', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                        arguments[0].dispatchEvent(new MouseEvent('mouseup', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                    `, calculateButton);
                    calculateClickSuccess = true;
                    console.log('Event dispatch bem sucedido');
                } catch (err) {
                    console.log('Event dispatch falhou... Erro:', err.message);
                }
            }

            if (!calculateClickSuccess) {
                throw new Error('Não foi possível clicar no botão Calculate após todas as tentativas');
            }

            await driver.sleep(3000);

            // Take screenshot after calculation
            await driver.takeScreenshot().then((image) => {
                fs.writeFileSync('./fotos/markup2/resultado-multiplier.png', image, 'base64');
                console.log('Gravou Foto - Resultado Multiplier');
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
                } catch (err) {
                    console.log('Tentando próximo seletor para back... Erro:', err.message);
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
                    } catch (err) {
                        console.log('Tentando próximo seletor para divisor... Erro:', err.message);
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
                        } catch (err) {
                            console.log('Tentando próximo seletor para calculate divisor... Erro:', err.message);
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
            throw new Error('Botão "Grupo CI_CD_8" não encontrado após tentar todos os seletores');
        }
    } catch (error) {
        console.error('Erro durante o teste:', error);
        throw error;
    } finally {
        await driver.quit();
    }
})();  