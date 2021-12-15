const csvController = require('./csvController.js');
const neritoUtils = require('./neritoUtils.js');
const requestValidator = require('./requestValidator.js');
const organizationController = require('./organizationController.js');
const parser = require("lambda-multipart-parser");


exports.handler = async function (event, ctx, callback) {
    try {
        let action;
        let queryJSON = JSON.parse(JSON.stringify(event.queryStringParameters));
        if (neritoUtils.isEmpty(queryJSON) ||neritoUtils.isEmpty(queryJSON['action'])) {
            return neritoUtils.errorResponseJson("Action is not defined", 400);
        }
        action = queryJSON['action'];
        const csvParser = await parser.parse(event);
        if (action.localeCompare(neritoUtils.action.CSVUPLOAD) == 0) {
            const response = await csvController(csvParser);
            return response;
        } else if (action.localeCompare(neritoUtils.action.SAVEORG) == 0) {
            let error = requestValidator.validateRequest(csvParser, action);
            if (neritoUtils.isEmpty(error)) {
                const response = await organizationController.saveOrganization(csvParser, action);
                return response;
            } else {
                return neritoUtils.errorResponseJson(error, 400);
            }
        } else if ((action.localeCompare(neritoUtils.action.UPDATEORG) == 0) || !neritoUtils.isEmpty(csvParser.Id) && !neritoUtils.isEmpty(csvParser.SK)) {
            action = neritoUtils.action.UPDATEORG;
            let error = requestValidator.validateRequest(csvParser, action);
            if (neritoUtils.isEmpty(error)) {
                const response = await organizationController.updateOrganization(csvParser, action);
                return response;
            } else {
                return neritoUtils.errorResponseJson(error, 400);
            }
        } else {
            return neritoUtils.errorResponseJson("Preferred Action Is Not Defined", 400);
        }
    } catch (err) {
        console.error("Something went wrong", err);
        return neritoUtils.errorResponseJson("Something went wrong", 400);
    }
};

