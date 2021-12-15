let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');

const { v4: uuidv4 } = require('uuid');

let date = new Date();
let month = date.getMonth(); // returns 0 - 11

async function uploadEmployeeCsv(csvParser) {
    try {
        let response = {};
        const { content, contentType } = csvParser.files[0];
        console.error("contentType", contentType);
        let fileContent = content.toString();
        let Id = csvParser.orgId;
        let uniqueId = uuidv4();
        let SK = "File#" + uniqueId;
        let isFileUploaded = false;
        let isDataInserted = false;
        let bucketName="temp";

        if (fileContent == null) {
            return neritoUtils.errorResponseJson("Please select file to upload", 400);
        }
        if (Id == null) {
            return neritoUtils.errorResponseJson("orgId can not be null", 400);
        }
        // Generate file name from current Month
        let fullFileName = Id + "_" + neritoUtils.months[month] + ".csv";
        try {
            isFileUploaded = await service.putObjectOnS3(fullFileName, fileContent, bucketName);
            if (!isFileUploaded) {
                console.error("Error while uploading file: " + fullFileName);
                return neritoUtils.errorResponseJson("UploadFailed", 400);
            }
        } catch (err) {
            console.error("CSV file not found with this Name: " + fullFileName, err);
            return neritoUtils.errorResponseJson("UploadFailed", 400);
        }

        try {
            isDataInserted = await service.insertCsvStatusInDb(fullFileName, Id, SK);
            if (!isDataInserted) {
                console.error("Error while uploading file: " + fullFileName);
                return neritoUtils.errorResponseJson("DataInsertFailed", 400);
            }
        } catch (err) {
            console.error("Error while inserting csv status: " + fullFileName, err);
            try {
                let isFileDeleted = await service.deleteObjectOnS3(fullFileName,bucketName);
                if (!isFileDeleted) {
                    console.error("Error while deleting file: " + fullFileName);
                    return neritoUtils.errorResponseJson("DeleteFailed", 400);
                }
            } catch (err) {
                console.error("Error while deleting csv file: " + fullFileName, err);
                return neritoUtils.errorResponseJson("DeleteFailed", 400);
            }
            return neritoUtils.errorResponseJson("DataInsertFailed", 400);
        }
        response = {
            orgId: Id,
            fileId: SK,
            status: 'Successfully uploaded',
            fileName: fullFileName
        };

        return neritoUtils.successResponseJson(response, 200);
    } catch (err) {
        console.error("Something went wrong", err);
        return neritoUtils.errorResponseJson("CsvUploadFailed", 402);
    }
}
module.exports = uploadEmployeeCsv;