'use strict'

let employee = require('./employee.js');
let neritoUtils = require('./neritoUtils.js');

exports.handler = async function (event, ctx, callback) {

    let fileContent = new Buffer(event['body-json'].toString(), 'base64');
    let orgId =event.headers["orgId"];

    if (fileContent == null) {
        return neritoUtils.errorResponseJson("Please select file to upload", 400);
    }

    if (orgId == null) {
        return neritoUtils.errorResponseJson("orgId can not be null", 400);
    }
    try {
            const result = await employee(orgId, fileContent);
            return result;
    } catch (err) {
        console.log("Failed to upload file", err);
        return neritoUtils.errorResponseJson(err, 400);
    }
};


