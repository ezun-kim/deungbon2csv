import PDFParser from "pdf2json";
import dataParser from './dataParser.js';
import { createObjectCsvWriter } from 'csv-writer'
import fs from 'fs'

const dataPath = "data/"
var files = [
    // "/Users/ezun/Desktop/work/Deungbon2csv/data/303.pdf",
]

if (files.length < 1) {
    await fs.readdirSync(dataPath).forEach(file => file.indexOf(".pdf") > 0 && files.push(file));
}

var loadProcess = 0
var texts = []

files.forEach((file) => {
    const pdfParser = new PDFParser(this, 1);
    const path = process.cwd() + '/' + dataPath + file
    pdfParser.loadPDF(path)
    // console.log(path)

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {

        // texts.push(pdfParser.getRawTextContent())
        // console.log()

        const data = dataParser.parse(pdfParser.getRawTextContent())
        texts.push(data)
        console.log(
            data.roomNumber + "\t" + 
            data.error + "\t" + 
            data.owners[0].name + "\t" +
            data.owners[0].birth + "\t" +
            data.owners[0].share + "\t" +
            data.owners[0].address)
        if (++loadProcess == files.length) {
            loadDone()
        }
    })
})
  

const loadDone = () => {
    const date = new Date();
    const timestamp = date.getTime();

    const csvWriter = createObjectCsvWriter({
        path: `data-${timestamp}.csv`,
        header: [
            {id: 'error', title: '오류'},
            {id: 'address', title: '주소'},
            {id: 'roomNumber', title: '호수'},
            {id: 'name', title: '이름'},
            {id: 'birth', title: '생일'},
            {id: 'share', title: '지분'},
            {id: 'ownerAddress', title: '소유자 주소'},
        ]
    });


    let records = []

    texts.sort((a,b) => a.roomNumber - b.roomNumber)
    texts.forEach(ele => records.push({
        address : ele.address,
        roomNumber : ele.roomNumber,
        error : ele.error,
        name : ele.owners[0].name,
        birth : ele.owners[0].birth,
        share : ele.owners[0].share,
        ownerAddress : ele.owners[0].address,
    }))

     
    csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
            console.log('...Done');
        });
        
    // texts.forEach((text) => console.log(dataParser.parse(text)))
    // texts.sort((a,b) => a.roomNumber - b.roomNumber)
    // console.table(texts)
}