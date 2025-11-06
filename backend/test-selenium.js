const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

// Test configuration
const BASE_URL = 'http://localhost:5173'; // Update this with your frontend URL

describe('Online Examination System Tests', function() {
    let driver;

    // This function runs before each test
    before(async function() {
        // Set up Chrome driver
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome.Options().headless()) // Run in headless mode
            .build();
    });

    // This function runs after each test
    after(async function() {
        // Cleanup - close the browser
        await driver.quit();
    });

    // Test login functionality
    it('should login with valid credentials', async function() {
        try {
            // Navigate to login page
            await driver.get(`${BASE_URL}/login`);

            // Find email input and enter test email
            await driver.findElement(By.name('email')).sendKeys('test@example.com');

            // Find password input and enter test password
            await driver.findElement(By.name('password')).sendKeys('testpassword');

            // Click login button
            await driver.findElement(By.css('button[type="submit"]')).click();

            // Wait for navigation to dashboard (adjust URL based on your routing)
            await driver.wait(until.urlContains('dashboard'), 5000);

            // Get current URL to verify successful login
            const currentUrl = await driver.getCurrentUrl();
            assert(currentUrl.includes('dashboard'), 'Login failed - Dashboard not loaded');

        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });

    // Test registration page
    it('should display registration form', async function() {
        try {
            // Navigate to registration page
            await driver.get(`${BASE_URL}/register`);

            // Verify that registration form elements are present
            const emailInput = await driver.findElement(By.name('email'));
            const passwordInput = await driver.findElement(By.name('password'));
            const nameInput = await driver.findElement(By.name('name'));

            assert(await emailInput.isDisplayed(), 'Email input not displayed');
            assert(await passwordInput.isDisplayed(), 'Password input not displayed');
            assert(await nameInput.isDisplayed(), 'Name input not displayed');

        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });

    // Test exam creation (teacher functionality)
    it('should create a new exam', async function() {
        try {
            // First login as teacher
            await driver.get(`${BASE_URL}/login`);
            await driver.findElement(By.name('email')).sendKeys('teacher@example.com');
            await driver.findElement(By.name('password')).sendKeys('teacherpass');
            await driver.findElement(By.css('button[type="submit"]')).click();

            // Navigate to create exam page
            await driver.get(`${BASE_URL}/create-exam`);

            // Fill exam details
            await driver.findElement(By.name('examTitle')).sendKeys('Test Exam');
            await driver.findElement(By.name('examDescription')).sendKeys('This is a test exam');
            await driver.findElement(By.name('duration')).sendKeys('60');

            // Add a question (adjust selectors based on your actual form structure)
            await driver.findElement(By.css('button[data-testid="add-question"]')).click();
            await driver.findElement(By.name('questions[0].text')).sendKeys('What is Selenium?');
            await driver.findElement(By.name('questions[0].options[0]')).sendKeys('A testing framework');
            await driver.findElement(By.name('questions[0].options[1]')).sendKeys('A web browser');
            await driver.findElement(By.name('questions[0].correctOption')).sendKeys('0');

            // Submit the form
            await driver.findElement(By.css('button[type="submit"]')).click();

            // Wait for success message or redirect
            await driver.wait(until.elementLocated(By.css('.success-message')), 5000);

        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });
});