const fs = require('fs')
const path = require('path')


const renamePDFfile = async (dir) => {

    // const files = []

    // await fs.readdirSync(dir).forEach(file => file.indexOf(".pdf") > 0 && files.push(file))

    const curFile = process.cwd()  + '/' + dir + file
    const destFile = process.cwd()  + '/' + dir + file
    
    console.log(process.cwd()  + '/' + dir+ file)

    // await fs.renameSync(src, dest)
}

module.exports = renamePDFfile