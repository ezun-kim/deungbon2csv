const {
  Builder,
  By,
  Key,
  until
} = require('selenium-webdriver');
// var chrome = require('selenium-webdriver/chrome');

let driver = new Builder().forBrowser('chrome')
// .withCapabilities({})
.build();

const closePopups = async () => {
  const mainWindowHandle = await driver.getWindowHandle()
  let handles = await driver.getAllWindowHandles()

  for (let i = 1; i < handles.length; i++) {
    await driver.switchTo().window(handles[i])
    await driver.close()
  }

  await driver.switchTo().window(mainWindowHandle)
}

const address = [
  `래미안서초유니빌 1717호`,
  `래미안서초유니빌 1718호`,
]

const start = async () => {
  await driver.get('https://www.iros.go.kr');

  await closePopups()


  // 1. login
  let idInput = driver.findElement(By.name('user_id'));
  await idInput.sendKeys("korg1975");
  let passwordInput = driver.findElement(By.xpath('/html/body/div[1]/div[4]/div[1]/div[1]/div[2]/form/div[1]/ul/li[2]/p[2]/input'));
  await passwordInput.sendKeys("iro12131!");

  let loginButton = By.xpath('/html/body/div[1]/div[4]/div[1]/div[1]/div[2]/form/div[1]/ul/li[4]/a')
  await driver.wait(until.elementLocated(loginButton))
  await driver.findElement(loginButton).click()
  
  //////////////////

  await driver.wait(until.elementLocated(By.xpath(`/html/body/div[1]/div[4]/div[1]/div[1]/div[2]/div[1]/p[1]`)))
  console.log('5')

  await closePopups()

  // 2. move to menu page
  let menuButton = By.xpath('/html/body/div[1]/div[2]/div/div/div[3]/div[2]/div[1]/ul/li[1]/h2/a')
  await driver.wait(until.elementLocated(menuButton))
  await driver.findElement(menuButton).click()
  
  await driver.wait(until.alertIsPresent());
  let alert = await driver.switchTo().alert();
  await alert.accept();

  let addressBox = By.xpath('/html/body/form[1]/div[24]/div/div/div/fieldset/div/table/tbody/tr[5]/td[1]/span/input')
  await driver.wait(until.elementLocated(addressBox))
  await driver.findElement(addressBox).sendKeys(address[0]);
  await driver.findElement(addressBox).sendKeys(Key.RETURN);

  // await driver.quit()
}


start()