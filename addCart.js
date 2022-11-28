const {
  Builder,
  By,
  Key,
  until
} = require('selenium-webdriver');
var ks = require('node-key-sender');

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


// const search = {
// type : 'search01Tab', //주소검색
//   queries : [
//     '래미안서초유니빌 1717호',
//     '래미안서초유니빌 1718호',
//   ]
// }
const search = {
  type : 'search04Tab',
  from : '1143-2005-001410',
  to : '1143-2005-001763'
}

const user = {
  id : '',
  pw : ''
}


const caculatequeriesForPINsearch = (context) => {
  let queries = []

  let start = parseInt(context.from.substring(context.from.lastIndexOf('-')+1, context.from.length))
  let end = parseInt(context.to.substring(context.to.lastIndexOf('-')+1, context.to.length))

  if (start <= end) {
    for (let i = start;i <= end;i++ ) {
      let formattedNumber = i.toLocaleString('en-US', {
        minimumIntegerDigits: 6,
        useGrouping: false
      })

      queries.push(context.from.substring(0, context.from.lastIndexOf('-')) + '-' + formattedNumber)
    }
  }
  return queries
}

const start = async () => {

  if (search.type == 'search04Tab') {
    search.queries = caculatequeriesForPINsearch(search)
  }

  console.log(search.queries)

  await driver.get('https://www.iros.go.kr');

  await closePopups()

  // 1. login
  let idInput = driver.findElement(By.name('user_id'));
  await idInput.click()
  await idInput.sendKeys()
  await ks.sendText(user.id)


  let passwordInput = driver.findElement(By.name('password'));
  await passwordInput.click()
  await passwordInput.sendKeys(user.pw)
  await ks.sendKeys(Array.from(user.pw))

  // let loginButton = By.xpath('/html/body/div[1]/div[4]/div[1]/div[1]/div[2]/form/div[1]/ul/li[4]/a')
  // await driver.wait(until.elementLocated(loginButton))
  // await driver.findElement(loginButton).click()
  
  //////////////////

  // wait until logged in
  await driver.wait(until.elementLocated(By.xpath(`/html/body/div[1]/div[4]/div[1]/div[1]/div[2]/div[1]/p[1]`)))
  console.log('5')

  await closePopups()

  // 2. move to menu page
  let menuButton = By.xpath('/html/body/div[1]/div[2]/div/div/div[3]/div[2]/div[1]/ul/li[1]/h2/a')
  await driver.wait(until.elementLocated(menuButton))
  await driver.findElement(menuButton).click()
  
  for (const i in search.queries) {

    console.log(search.queries[i])

    await driver.switchTo().defaultContent();
    // await driver.wait(until.ableToSwitchToFrame(By.css('#inputFrame')))
    await driver.switchTo().frame('inputFrame');
    
    console.log('searchTab')

    let searchTab = By.id(search.type)
    await driver.wait(until.elementLocated(searchTab))
    await driver.findElement(searchTab).click()
    
    
    await driver.switchTo().defaultContent();
    // await driver.wait(until.ableToSwitchToFrame('resultFrame'))
    await driver.switchTo().frame('resultFrame');
    // await driver.wait(until.ableToSwitchToFrame('frmOuterModal'))
    await driver.switchTo().frame('frmOuterModal');

    if (search.type == 'search01Tab') {
      let addressBox = By.id('txt_simple_address')
      await driver.findElement(addressBox).click()
      await driver.findElement(addressBox).clear()
      await driver.findElement(addressBox).sendKeys(search.queries[i])
  
      // 검색 클릭
      let searchButton = await driver.findElement(By.id('btnSrchSojae'))
      searchButton.click()

      // console.log('7')

      // 선택 클릭
      let selectButton = By.xpath('/html/body/div[2]/div[2]/table/tbody/tr[2]/td[6]/button')
      await driver.wait(until.elementLocated(selectButton))
      await driver.findElement(selectButton).click()

    }
    else if (search.type == 'search04Tab') {
      let addressBox = By.id('inpPinNo')
      await driver.wait(until.elementLocated(addressBox))
      await driver.findElement(addressBox).click()
      await driver.findElement(addressBox).clear()
      await driver.findElement(addressBox).sendKeys(search.queries[i])
      
      let searchButton = await driver.findElement(By.xpath('/html/body/div/form/div/div/div/div/fieldset/div/table/tbody/tr[3]/td[3]/button'))
      searchButton.click()
    }
    // console.log('8')

    selectButton = By.xpath('/html/body/div[2]/div[2]/table/tbody/tr[2]/td[5]/button')
    await driver.wait(until.elementLocated(selectButton))
    await driver.findElement(selectButton).click()

    // console.log('9')

    selectButton = By.xpath('/html/body/div/form/div[4]/button')
    await driver.wait(until.elementLocated(selectButton))
    await driver.findElement(selectButton).click()
    
    // console.log('10')
    
    
    selectButton = By.xpath('/html/body/div/form/div[5]/button')
    await driver.wait(until.elementLocated(selectButton))
    await driver.findElement(selectButton).click()

    await driver.manage().setTimeouts( { implicit: 100 } );
    
  }

  // await driver.quit()
}


start()