const sscanf = require("sscanf")
// const wcmatch = require('wildcard-match')

const ownerIdentifier = '소유자'
const shareIdentifier = ' 지분 '
const addressIdentifier = '[집합건물] '

var error = false

const eraseUnnecessaryTextByLine = (text, unnecessaryTexts) => {
    text = text.replaceAll('\r', '')
    let splits = text.split('\n')
    unnecessaryTexts.forEach((unnecessaryText) => {
        splits = splits.filter(e => e.indexOf(unnecessaryText) < 0)
    })

    return splits.join('\n')
}

const eraseUnnecessaryTexts = (text, unnecessaryTexts) => {
    unnecessaryTexts.forEach((unnecessaryText) => {
        text = text.replaceAll(unnecessaryText, '')
    })
    return text
}


const extractRange = (text, startText, endText) => {
    const startPos = text.indexOf(startText)
    const endPos = text.indexOf(endText)

    return text.substring(startPos, endPos)
}

const listArrangeByIndexNumber = (text) => {
    let splits = text.split('\n')
    let currentPos = 0

    let slicePositions = []
    splits.forEach((split, idx) => {
        split = split.split(' ').filter(ele => ele != '')
        if (split[0] == null) {
            return
        }

        split[0] = split[0].replaceAll((currentPos + '번'), '')

        if (currentPos + 1 == parseInt(split[0])) {
            currentPos = parseInt(split[0])
            slicePositions.push(idx)
            // console.log([currentPos, 0], idx)
        }
        else if (currentPos == parseInt(split[0])) {
            const data = sscanf(split[0], "%d-%d")
            slicePositions.push(idx)
            // console.log(data, idx)
        }
    })

    slicePositions.push(splits.length)

    // console.log(slicePositions)

    let results = []
    let lastIndex = -1
    for (let i = 0; i < slicePositions.length - 1; i++) {
        let a = splits.slice(slicePositions[i], slicePositions[i + 1]).join(" ")
        a = a.replace(a[0] + '번', '')
        if (i > 0 && lastIndex > 0) {
            a = a.replace(lastIndex + '번', '')
        }
        lastIndex = a[0]
        results.push(a)
    }

    // results.forEach(res => console.log(res))
    // console.log(+"\n")

    // console.log(results)
    return results
}

const getCurrentOwnerList = (list) => {
    // console.log(list)

    let lastNumber = -1
    list.forEach(ele => {
        if (!isNaN(parseInt(ele)) && 
            (ele.indexOf('소유권') > 0 || ele.indexOf('증여') > 0 || ele.indexOf('매매') > 0 )) { 
            if (ele.indexOf('처분행위 금지') > 0) {
                return
            }
            lastNumber = parseInt(ele)
            // console.log(lastNumber)
        }
        // console.log(ele)
    })

    // 가끔 주소에 나타나는 쓰레기 값 제거.. 운이 좋게 발생할 수 있음 //////
    let filtered = list.filter(ele => parseInt(ele) == lastNumber)

    if (filtered[0].indexOf('-') < 3) {
        error = true
    }
    /////////////////

    return filtered
}

const addressFiltering = address => {

    const index_부동산등기법시행규칙부칙 = address.indexOf('부동산등기법시행규칙부칙')
    if (index_부동산등기법시행규칙부칙 > 0) {
        address = address.substring(0, index_부동산등기법시행규칙부칙)
    }

    const 임의경매로 = '임의경매로'
    const 인한낙찰  = '인한 낙찰'
    
    if (address.indexOf(임의경매로) < address.indexOf(인한낙찰)) {
        address = address.substring(address.indexOf(임의경매로) + 임의경매로.length, address.length)
        address = address.replaceAll(인한낙찰, '')
    }

    const 매매목록  = '매매목록'
    if (address.indexOf(매매목록) > 0) {
        address = address.substring(0, address.indexOf(매매목록))
    }
    
    address = address.replace(/ +/g, " ")
    address = address.trim()


    return address
}

const getOwnerLatestAddress = (list) => {
    let address = ""
    let filtered = list.filter(ele => ele.indexOf('전거') > 0 || ele.indexOf('주소변경') > 0)

    if (filtered.length > 0) {
        let text = filtered[filtered.length - 1]

        let identifier = '전거'
        if (text.lastIndexOf(identifier) < 0) {
            identifier = '주소변경'
        }

        let startPos = text.lastIndexOf('변경')
        let endPos = text.lastIndexOf(identifier) + identifier.length

        address = text.slice(text.lastIndexOf('의 주소') + 5, startPos) + text.slice(endPos)

        endPos = text.lastIndexOf('거래가액')
        if (endPos == -1) endPos = address.lastIndexOf('\n')
        if (endPos == -1) endPos = address.lastIndexOf('[')
        if (endPos == -1) endPos = address.length

        address = address.substring(0, endPos)

        //
        address = address.replace(/\s+/g, ' ')
        startPos = address.indexOf('변경 제')
        endPos = address.indexOf('호 주소')

        console.log(address, startPos, endPos)

        if (startPos > 0 && endPos > 0 && startPos < endPos) {
            address = address.substring(0, startPos) + address.substring(endPos + '호 주소'.length, address.length)
        }
       
    }

    return address.replace(/\s+/g, ' ').trim()
}

const getOwnerAddress = (text) => {
    let startPos = -1
    let identifiers = [
        '매매 ', '전거', '증여', '상속', '-*******'
    ]
    let identifierIdx = -1

    identifiers.forEach((item, i) => {
        if (startPos == -1) {
            startPos = text.lastIndexOf(item)
            identifierIdx = i
        }
    })

    // console.log(text)
    for (let i = startPos + identifiers[identifierIdx].length;i < text.length;i++) {
        if (text[i] != ' ') {
            startPos = i
            break
        }
    }

    let endPos = text.lastIndexOf('거래가액')
    if (endPos == -1) endPos = text.lastIndexOf('\n')
    if (endPos == -1) endPos = text.lastIndexOf('[')
    if (endPos == -1) endPos = text.length

    return text.substring(startPos, endPos)
}

const getOwnerInfo = (list, identifier) => {
    // console.log(text)
    const ownerOrigin = list[0]

    let name
    {
        let startPos = ownerOrigin.indexOf(identifier) + identifier.length
        let addPos = 0
        Array.from(ownerOrigin).forEach((char, i) => {
            if (startPos > i) return
            if (char != ' ' && addPos == 0) addPos = i
        })
        startPos = addPos
    
        // ownerOrigin.indexOf(identifier) + identifier.length + ownerOrigin.indexOf(' ',  ownerOrigin.indexOf(identifier) + identifier.length + 1)
        const endPos = ownerOrigin.indexOf(' ', startPos + 1)
        name = ownerOrigin.substring(startPos, endPos).replaceAll(' ', '')
    }

    let birth
    {
        let endPos = ownerOrigin.indexOf('-*******')
        birth = ownerOrigin.substring(endPos - 6, endPos)
        if (birth.length != 6) {
            error = true
        }
    }

    let address
    {
        address = getOwnerAddress(ownerOrigin)
        const latestAddress = getOwnerLatestAddress(list)
        address = latestAddress.length > 0 ? latestAddress : address
        address = addressFiltering(address)
    }


    return [
        {
            name,
            share: 1,
            birth,
            address
        }
    ]
}

const getOwnersInfo = (list) => {
    let owners = []
    const ownerOrigin = list[0]
    let splits = ownerOrigin.split(' 지분 ').slice(1)

    splits.forEach((split) => {
        const args = sscanf(split, "%d분의%d%s%d") // args[2]는 값 2개만 나옴..
        const startPos = split.indexOf(args[2])
        const name = split.substring(startPos, split.indexOf(' ', startPos + 1))

        if (name == '이전') {
            error = true
        }

        owners.push({
            name,
            birth: args[3],
            share: args[1] / args[0],
            address : getOwnerAddress(split),
        })
    })
    owners.sort((a, b) => b.share - a.share)

    return owners
}

const processOwnerData = (list) => {
    let ownerIndex = 0
    for(let i = 0;i < list.length; i++) {
        if (list[i].length > 10) {
            ownerIndex = i
            break
        }
    }

    if (list[ownerIndex].indexOf(ownerIdentifier) > 0) {
        return getOwnerInfo(list, ownerIdentifier)
    }
    else if (list[ownerIndex].indexOf(shareIdentifier) > 0) {
        return getOwnersInfo(list, shareIdentifier)
    }
    else {
        console.error("No owner found!")
        console.log(list)
        return []
    }
}

const getAddress = (text) => {
    const startPos = text.indexOf(addressIdentifier) + addressIdentifier.length
    const endPos = text.indexOf('\r\n', startPos + 1)
    return text.substring(startPos, endPos)
}

const parse = (text) => {
    error = false

    const address = getAddress(text)
    const roomNumber = address.substring(address.indexOf('층 제') + 3, address.lastIndexOf('호'))

    text = eraseUnnecessaryTextByLine(text, [
        "Break-",
        "이   하   여   백",
    ])

    text = eraseUnnecessaryTexts(text, [
        "미국 ",
        "미국인 ",
        "일본국인 ",
        "캐나다인 ",
    ])

    text = extractRange(text,
        "【  갑      구  】",
        "【  을      구  】",
    )

    const allList = listArrangeByIndexNumber(text)
    const currentOwnerList = getCurrentOwnerList(allList)
    const owners = processOwnerData(currentOwnerList)

    return {
        roomNumber,
        shared : owners.length > 1,
        owners,
        address,
        error,
    }
}

module.exports = { parse }