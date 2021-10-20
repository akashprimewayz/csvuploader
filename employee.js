let csvUploadHandler = require('./csvUploadHandler.js');
let neritoUtils = require('./neritoUtils.js');

const { v4: uuidv4 } = require('uuid')

let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let date = new Date();
let month = date.getMonth(); // returns 0 - 11

async function uploadEmployeeCsv(orgId, fileContent) {
    let response = {};

    // Generate file name from current Month
    let fileName = orgId + "_" + months[month];
    // Determine file extension
    let fullFileName = `${fileName}.csv`;
    let isFileUploaded = false;
    let isDataInserted = false;
    let uniqueId = uuidv4();
    let Id = "ORG#" + orgId;
    let SK = "File#" + uniqueId;
    try {
        try {
            isFileUploaded = await csvUploadHandler.putObjectOnS3(fullFileName, fileContent);
            if (!isFileUploaded) {
                console.log("Error while uploading file: " + fullFileName);
                return neritoUtils.errorResponseJson("UploadFailed", 400);
            }
        } catch (err) {
            console.log("CSV file not found with this Name: " + fullFileName, err);
            return neritoUtils.errorResponseJson("UploadFailed", 400);
        }

        try {
            isDataInserted = await csvUploadHandler.insertCsvStatusInDb(orgId, fullFileName, Id, SK);
            if (!isDataInserted) {
                console.log("Error while uploading file: " + fileName);
                return neritoUtils.errorResponseJson("DataInsertFailed", 400);
            }
        } catch (err) {
            console.log("Error while inserting csv status: " + fileName, err);
            try {
                let isFileDeleted = await csvUploadHandler.deleteObjectOnS3(fullFileName);
                if (!isFileDeleted) {
                    console.log("Error while deleting file: " + fullFileName);
                    return neritoUtils.errorResponseJson("DeleteFailed", 400);
                }
            } catch (err) {
                console.log("Error while deleting csv file: " + fullFileName, err);
                return neritoUtils.errorResponseJson("DeleteFailed", 400);
            }
            return neritoUtils.errorResponseJson("DataInsertFailed", 400);
        }
        response = {
            Id: Id,
            SK: SK,
            status: 'Successfully uploaded',
            fileName: fullFileName
        };

        return neritoUtils.successResponseJson(response, 200);
    } catch (err) {
        console.log("Failed to insert data into db : " + fileName, err);
        return neritoUtils.errorResponseJson("Failed Insertion", 402);
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
module.exports = uploadEmployeeCsv;