package es.upm.dit.isst.ioh.selenium;

import java.time.Duration;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;
public class TestcompletoSelenium {
  private WebDriver driver;
  private Map<String, Object> vars;
  JavascriptExecutor js;
  @BeforeEach
    public void setUp() {
        // Configura el path del WebDriver
        System.setProperty("webdriver.chrome.driver", "C:\\chromedriver-win64\\chromedriver.exe");
        // Configura ChromeOptions para aceptar certificados no confiables
        ChromeOptions options = new ChromeOptions();
        options.setAcceptInsecureCerts(true); // Acepta certificados no confiables
        driver = new ChromeDriver(options);
    }

    @AfterEach
    public void tearDown() {
        // if (driver != null) {
        //     driver.quit(); // Cierra el navegador después de cada prueba
        // }
    }
  public String waitForWindow(int timeout) {
    try {
      Thread.sleep(timeout);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    Set<String> whNow = driver.getWindowHandles();
    Set<String> whThen = (Set<String>) vars.get("window_handles");
    if (whNow.size() > whThen.size()) {
      whNow.removeAll(whThen);
    }
    return whNow.iterator().next();
  }
  @Test
  public void testcompleto2() {
    driver.get("http://localhost:5173/");
    driver.manage().window().setSize(new Dimension(1052, 654));
    
    // Ajusta el zoom automáticamente para que el contenido se adapte a la ventana
        ((JavascriptExecutor) driver).executeScript(
            "document.body.style.zoom = Math.min(window.innerWidth / document.body.scrollWidth, 1);"
        );

        // Asegúrate de que la página comience desde la parte superior
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, 0);");
    {

      WebElement element = driver.findElement(By.cssSelector(".MuiButtonBase-root:nth-child(4)"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.cssSelector(".css-1ip5wv7-MuiButtonBase-root-MuiButton-root"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.tagName("body"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element, 0, 0).perform();
    }
    driver.findElement(By.id("registerButton")).click();

    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    {
      WebElement element = driver.findElement(By.id("rolePropietario"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("rolePropietario")).click();
    {
      WebElement element = driver.findElement(By.tagName("body"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element, 0, 0).perform();
    }
    driver.findElement(By.id("fullName")).click();
    driver.findElement(By.id("fullName")).sendKeys("propietario Selenium");
    driver.findElement(By.id("email")).click();
    driver.findElement(By.id("email")).sendKeys("propietario@email.com");
    driver.findElement(By.id("telefono")).click();
    driver.findElement(By.id("telefono")).sendKeys("675444333");
    driver.findElement(By.id("password")).click();
    {
      WebElement element = driver.findElement(By.id("registerButton"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("password")).sendKeys("contraseña");
    driver.findElement(By.id("confirmPassword")).click();
    driver.findElement(By.id("confirmPassword")).sendKeys("contrasena");
    driver.findElement(By.id("registerButton")).click();
    assertThat(driver.findElement(By.cssSelector(".MuiAlert-message")).getText(), is("Las contraseñas no coinciden"));
    driver.findElement(By.id("confirmPassword")).click();
    {
      WebElement element = driver.findElement(By.id("registerButton"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("confirmPassword")).sendKeys("contraseña");
    driver.findElement(By.id("registerButton")).click();
    driver.findElement(By.id("registerButton")).click();
    {
      WebElement element = driver.findElement(By.id("roleHuesped"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("roleHuesped")).click();
    driver.findElement(By.id("fullName")).click();
    driver.findElement(By.id("fullName")).sendKeys("huesped Selenium");
    driver.findElement(By.id("email")).click();
    driver.findElement(By.id("email")).sendKeys("huesped@email.com");
    driver.findElement(By.id("telefono")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiFormControl-root:nth-child(10) .MuiButtonBase-root"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("telefono")).sendKeys("654333222");
    driver.findElement(By.id("password")).click();
    driver.findElement(By.id("password")).sendKeys("1234");
    driver.findElement(By.id("confirmPassword")).click();
    driver.findElement(By.id("confirmPassword")).sendKeys("1234");
    driver.findElement(By.id("registerButton")).click();
    driver.findElement(By.id("email")).sendKeys("propietario");
    driver.findElement(By.id("password")).click();
    driver.findElement(By.id("password")).sendKeys("contraseña");
    driver.findElement(By.id("loginButton")).click();
    assertThat(driver.findElement(By.cssSelector(".MuiAlert-message")).getText(), is("Credenciales inválidas"));
    driver.findElement(By.id("email")).click();
    {
      WebElement element = driver.findElement(By.id("loginButton"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("email")).sendKeys("propietario@email.com");
    driver.findElement(By.id("loginButton")).click();
    driver.findElement(By.id("misPuertas")).click();
    driver.findElement(By.id("anadirPuerta")).click();
    driver.findElement(By.id("nombre")).click();
    driver.findElement(By.id("nombre")).sendKeys("casa 1");
    driver.findElement(By.id("direccion")).click();
    driver.findElement(By.id("direccion")).sendKeys("calle princesa, 32");
    driver.findElement(By.id("ciudad")).click();
    driver.findElement(By.id("ciudad")).sendKeys("Madrid");
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiButton-contained"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("codigoConexion")).click();
    driver.findElement(By.id("codigoConexion")).sendKeys("905b4328-7b15-44c7-bbaa-c517466363ca");
    driver.findElement(By.id("crearPuerta")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".css-1sypljl-MuiButtonBase-root-MuiButton-root"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.id("misPuertas"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("misPuertas")).click();
    {
      WebElement element = driver.findElement(By.id("anadirPuerta"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("anadirPuerta")).click();
    driver.findElement(By.id("nombre")).click();
    driver.findElement(By.id("nombre")).sendKeys("casa 2");
    driver.findElement(By.id("direccion")).click();
    driver.findElement(By.id("direccion")).sendKeys("calle Ferraz, 31");
    driver.findElement(By.id("ciudad")).click();
    driver.findElement(By.id("ciudad")).sendKeys("Madrid");
    driver.findElement(By.id("codigoConexion")).click();
    driver.findElement(By.id("codigoConexion")).sendKeys("1234");
    driver.findElement(By.id("crearPuerta")).click();
    driver.findElement(By.id("misPuertas")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiPaper-root:nth-child(4) .MuiBox-root:nth-child(3) > .MuiButtonBase-root:nth-child(2)"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.id("generarToken"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("generarToken")).click();
    driver.findElement(By.id("numeroUsos")).click();
    driver.findElement(By.id("numeroUsos")).sendKeys("3");
    driver.findElement(By.id("fechaFin")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiButton-contained"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("fechaFin")).sendKeys("2025-05-18T11:13");
    driver.findElement(By.id("crearTokenButton")).click();
    driver.findElement(By.id("misPuertas")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiPaper-root:nth-child(4) .MuiBox-root:nth-child(3) > .MuiButtonBase-root:nth-child(2)"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiPaper-root:nth-child(3) .MuiBox-root:nth-child(3) > .MuiButtonBase-root:nth-child(2)"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.cssSelector(".MuiPaper-root:nth-child(3) .MuiBox-root:nth-child(3) > .MuiButtonBase-root:nth-child(2)")).click();
    driver.findElement(By.id("email")).click();
    driver.findElement(By.id("email")).sendKeys("huesped@email.com");
    driver.findElement(By.id("fechaInicio")).click();
    driver.findElement(By.id("fechaInicio")).sendKeys("2025-05-08T11:13");
    driver.findElement(By.id("fechaFin")).click();
    driver.findElement(By.id("fechaFin")).sendKeys("2025-05-12T11:13");
    driver.findElement(By.id("crearAccesoButton")).click();
    driver.findElement(By.id("misPuertas")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".css-1umw9bq-MuiSvgIcon-root"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.cssSelector(".css-1umw9bq-MuiSvgIcon-root")).click();
    driver.findElement(By.id("abrirPuertaIcon")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiButton-root"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.cssSelector(".MuiButton-root")).click();
    driver.findElement(By.cssSelector("img")).click();
    {
      WebElement element = driver.findElement(By.id("abrirPuertaIcon"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.cssSelector(".css-1svfwy9-MuiButtonBase-root-MuiIconButton-root:nth-child(1)"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.cssSelector(".css-1svfwy9-MuiButtonBase-root-MuiIconButton-root:nth-child(1)")).click();
    driver.switchTo().alert().accept();
    {
      WebElement element = driver.findElement(By.tagName("body"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element, 0, 0).perform();
    }
    js.executeScript("window.scrollTo(0,0)");
    driver.switchTo().frame(2);
    {
      WebElement element = driver.findElement(By.cssSelector(".Q7yWH > .pYTkkf-Bz112c-RLmnJb"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.tagName("body"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element, 0, 0).perform();
    }
    driver.switchTo().defaultContent();
    driver.findElement(By.cssSelector(".MuiTypography-body1")).click();
    driver.findElement(By.id("logout")).click();
    driver.findElement(By.id("email")).sendKeys("huesped@email.com");
    driver.findElement(By.id("password")).click();
    driver.findElement(By.id("password")).sendKeys("huesped");
    driver.findElement(By.id("loginButton")).click();
    assertThat(driver.findElement(By.cssSelector(".MuiAlert-message")).getText(), is("Credenciales inválidas"));
    driver.findElement(By.id("password")).click();
    driver.findElement(By.id("password")).click();
    {
      WebElement element = driver.findElement(By.id("password"));
      Actions builder = new Actions(driver);
      builder.doubleClick(element).perform();
    }
    {
      WebElement element = driver.findElement(By.id("loginButton"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("password")).sendKeys("1234");
    driver.findElement(By.id("loginButton")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".css-74d805-MuiButtonBase-root-MuiButton-root"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    vars.put("window_handles", driver.getWindowHandles());
    driver.findElement(By.cssSelector(".css-74d805-MuiButtonBase-root-MuiButton-root")).click();
    vars.put("win8304", waitForWindow(2000));
    vars.put("root", driver.getWindowHandle());
    driver.findElement(By.id("misAccesos")).click();
    driver.findElement(By.id("abrirPuerta")).click();
    driver.findElement(By.cssSelector("img")).click();
    driver.findElement(By.cssSelector(".MuiButton-root")).click();
    driver.findElement(By.cssSelector(".MuiTypography-body1")).click();
    driver.findElement(By.id("configuracion")).click();
    driver.findElement(By.id("logoutButton")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".css-oclf15-MuiSvgIcon-root"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.cssSelector(".css-oclf15-MuiSvgIcon-root")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiButtonBase-root:nth-child(4)"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiButtonBase-root:nth-child(5)"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    {
      WebElement element = driver.findElement(By.id("tokenButton"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("tokenButton")).click();
    driver.findElement(By.id("token")).click();
    driver.findElement(By.id("token")).sendKeys("51fcce76-1dfa-4688-8d06-098c93e2fabb");
    driver.findElement(By.cssSelector(".MuiButton-root")).click();
    assertThat(driver.findElement(By.cssSelector("div.MuiAlert-message ")).getText(), is("Token no encontrado"));
    js.executeScript("window.scrollTo(0,0)");
    driver.findElement(By.id("token")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiButton-root"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("token")).sendKeys("281051871");
    driver.findElement(By.id("token")).click();
    driver.findElement(By.cssSelector(".MuiButton-root")).click();
    {
      WebElement element = driver.findElement(By.cssSelector(".MuiSvgIcon-fontSizeSmall"));
      Actions builder = new Actions(driver);
      builder.moveToElement(element).perform();
    }
    driver.findElement(By.id("token")).click();
    {
      WebElement element = driver.findElement(By.id("token"));
      Actions builder = new Actions(driver);
      builder.doubleClick(element).perform();
    }
    driver.findElement(By.cssSelector(".MuiButton-root")).click();
  }
}
