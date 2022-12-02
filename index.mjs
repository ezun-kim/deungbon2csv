import PDFParser from "pdf2json"
import dataParser from './dataParser.js'
import renamePDFfiles from './pdfRenamer.js'
import { pathEqual } from 'path-equal'

import { createObjectCsvWriter } from 'csv-writer'
import fs from 'fs'
import path from 'path'

const readPDFfiles = async (dir, files, options) => {
    return new Promise((resolve, reject) => {
        var loadProcess = 0
        var data = []

        files.forEach((file) => {
            const pdfParser = new PDFParser(this, 1);
            const destPath = dir + file
            pdfParser.loadPDF(destPath)
            pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
            pdfParser.on("pdfParser_dataReady", pdfData => {
                const parsed = dataParser.parse(pdfParser.getRawTextContent())
                data.push(parsed)
                
                // rename the file
                let newFilePath = path.join(dir, parsed.address + '.pdf')
                if (options.renamePDFfileToAddress && !pathEqual(newFilePath, destPath)) {
                    fs.renameSync(destPath, newFilePath)
                    console.log(destPath + " ==> " + newFilePath)
                }

                if (++loadProcess == files.length) {
                    resolve(data)
                }
            })
        })
    })
}

const printData = (data) => {
    data.forEach(ele => console.log(
        ele.address + "\t" +
        ele.error + "\t" +
        ele.owners[0].name + "\t" +
        ele.owners[0].birth + "\t" +
        ele.owners[0].share + "\t" +
        ele.owners[0].address))
}


const exportDataToCSV = (data) => {
    const date = new Date();
    const timestamp = date.getTime();

    const csvWriter = createObjectCsvWriter({
        path: `data-${timestamp}.csv`,
        header: [
            { id: 'error', title: '오류' },
            { id: 'address', title: '주소' },
            { id: 'roomNumber', title: '호수' },
            { id: 'name', title: '이름' },
            { id: 'birth', title: '생일' },
            { id: 'share', title: '지분' },
            { id: 'ownerAddress', title: '소유자 주소' },
        ]
    });


    let records = []

    data.sort((a, b) => a.roomNumber - b.roomNumber)
    data.forEach(ele => records.push({
        address: ele.address,
        roomNumber: ele.roomNumber,
        error: ele.error,
        name: ele.owners[0].name,
        birth: ele.owners[0].birth,
        share: ele.owners[0].share,
        ownerAddress: ele.owners[0].address,
    }))

    csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
            console.log('...Done');
        });
}


// 0. Define files to be readed.
const basePath = process.cwd() + "/data/"
const files = [
    // "303.pdf",
]

if (files.length < 1) {
    fs.readdirSync(basePath).forEach(file => {
        file.indexOf(".pdf") > 0 && files.push(file)
    });
}

readPDFfiles(basePath, files, {renamePDFfileToAddress: true})
    .then(data => {
        exportDataToCSV(data)
        printData(data)
    })
