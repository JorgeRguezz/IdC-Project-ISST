package es.upm.dit.isst.ioh.selenium;

import java.time.Duration;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class UsuarioControllerTest {

    private WebDriver driver;

    @BeforeEach
    public void setUp() {
        // Configura el path del WebDriver
        System.setProperty("webdriver.chrome.driver", "C:\\chromedriver-win64\\chromedriver.exe");
        driver = new ChromeDriver();
    }

    @AfterEach
    public void tearDown() {
        // if (driver != null) {
        //     driver.quit(); // Cierra el navegador después de cada prueba
        // }
    }

    @Test
    public void testRegisterAndLogin() {
        // Abre la página de registro
        driver.get("http://localhost:5173/register");

        // Ajusta el zoom automáticamente para que el contenido se adapte a la ventana
        ((JavascriptExecutor) driver).executeScript(
            "document.body.style.zoom = Math.min(window.innerWidth / document.body.scrollWidth, 1);"
        );

        // Asegúrate de que la página comience desde la parte superior
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, 0);");

        // Espera a que el botón de rol de propietario sea visible y clicable
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("loadingSpinner")));
        // WebElement rolePropietarioButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("rolePropietario")));
        // ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", rolePropietarioButton);
        // wait.until(ExpectedConditions.elementToBeClickable(rolePropietarioButton));
        // rolePropietarioButton.click();

        WebElement rolePropietarioButton = driver.findElement(By.id("rolePropietario"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", rolePropietarioButton);
        System.out.println("Visible: " + rolePropietarioButton.isDisplayed());
        System.out.println("Habilitado: " + rolePropietarioButton.isEnabled());
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", rolePropietarioButton);

        // Encuentra los campos de nombre, email, teléfono y contraseña
        WebElement nameField = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("fullName")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", nameField);
        nameField.sendKeys("Propietario Test");

        WebElement emailField = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("email")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", emailField);
        emailField.sendKeys("propietario@email.com");

        WebElement telefonoField = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("telefono")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", telefonoField);
        telefonoField.sendKeys("652123456");

        WebElement passwordField = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("password")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", passwordField);
        passwordField.sendKeys("propietario123");

        WebElement confirmPasswordField = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("confirmPassword")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", confirmPasswordField);
        confirmPasswordField.sendKeys("propietario123");

        // Encuentra y haz clic en el botón de registro
        WebElement registerButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("registerButton")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", registerButton);
        registerButton.click();

        // Encuentra los campos de email y contraseña en la página de login
        WebElement loginEmailField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("email")));
        System.out.println("Email visible: " + loginEmailField.isDisplayed());
        System.out.println("Email habilitado: " + loginEmailField.isEnabled());
        loginEmailField.clear();
        loginEmailField.sendKeys("propietario@email.com");

        // Intenta hacer login con una contraseña incorrecta
        WebElement loginPasswordField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("password")));
        System.out.println("Password visible: " + loginPasswordField.isDisplayed());
        System.out.println("Password habilitado: " + loginPasswordField.isEnabled());
        loginPasswordField.clear();
        loginPasswordField.sendKeys("incorrectPassword");

        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("loginButton")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", loginButton);
        loginButton.click();

        // Verifica que no se redirige al dashboard
        try {
            Thread.sleep(3000); // Espera 3 segundos
        } catch (InterruptedException e) {
            // Maneja la excepción
            
        }
        String currentUrl = driver.getCurrentUrl();
        assertEquals("http://localhost:5173/login", currentUrl);

        // Limpia el campo de contraseña simulando la selección y borrado del texto
        WebElement updatedPasswordField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("password")));
        Actions actions = new Actions(driver);
        actions.click(updatedPasswordField) // Haz clic en el campo
               .keyDown(Keys.CONTROL) // Mantén presionada la tecla Control
               .sendKeys("a") // Selecciona todo el texto
               .keyUp(Keys.CONTROL) // Suelta la tecla Control
               .sendKeys(Keys.BACK_SPACE) // Borra el texto seleccionado
               .perform();

        // Introduce la contraseña correcta
        updatedPasswordField.sendKeys("propietario123");

        // También vuelve a localizar el botón de login por si se ha recargado
        WebElement updatedLoginButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("loginButton")));
        updatedLoginButton.click();

        // Verifica que el usuario sea redirigido al dashboard
        wait.until(ExpectedConditions.urlToBe("http://localhost:5173/dashboard"));
        currentUrl = driver.getCurrentUrl();
        assertEquals("http://localhost:5173/dashboard", currentUrl);
    }
}