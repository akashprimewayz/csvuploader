const employee = require('./employee.js');
const neritoUtils = require('./neritoUtils.js');
const parser = require("lambda-multipart-parser");

exports.handler = async function (event, ctx, callback) {

    try {
        const csvParser = await parser.parse(event);
        const { content, filename, contentType } = csvParser.files[0];
        let fileContent = content.toString();
        let orgId = csvParser.orgId;

        if (fileContent == null) {
            return neritoUtils.errorResponseJson("Please select file to upload", 400);
        }

        if (orgId == null) {
            return neritoUtils.errorResponseJson("orgId can not be null", 400);
        }

        const response = await employee(orgId, fileContent);
        return response;
    } catch (err) {
        console.log("Failed to upload file", err);
        return neritoUtils.errorResponseJson(err, 400);
    }
};


