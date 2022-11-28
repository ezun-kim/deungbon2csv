const fs = require("fs")
const path = require("path")
const { v4: uuidv4 } = require('uuid');


const PDF_CACHE_PATH = "C:/Users/ezun/Documents/a.pdf"



fs.watchFile(PDF_CACHE_PATH, (curr, prev) => {
    console.log("A new pdf file has been created.")
    
    if (prev.ctime < curr.ctime) {
        const newPath = path.dirname(PDF_CACHE_PATH) + '/' + uuidv4() + '.pdf'
        console.log(newPath)
        fs.rename(PDF_CACHE_PATH, newPath, err =>{
            if (err) {
                console.log(err)
                return 
            }

            console.log("pdf created")
        })
    }
});
