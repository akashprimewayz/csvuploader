const csvController = require('./csvController.js');
const neritoUtils = require('./neritoUtils.js');
const requestValidator = require('./requestValidator.js');
const organizationController = require('./organizationController.js');
const parser = require("lambda-multipart-parser");
let service = require('./service.js');


exports.handler = async function (event, ctx, callback) {
    try {
        let action, users;
        let queryJSON = JSON.parse(JSON.stringify(event.queryStringParameters));
        if (neritoUtils.isEmpty(queryJSON) || neritoUtils.isEmpty(queryJSON['action'])) {
            return neritoUtils.errorResponseJson("Action is not defined", 400);
        }
        action = queryJSON['action'];
        const csvParser = await parser.parse(event);
        if (action.localeCompare(neritoUtils.action.CSVUPLOAD) == 0) {
            const response = await csvController(csvParser);
            return response;
        } else if (action.localeCompare(neritoUtils.action.SAVEORG) == 0) {
            users = await getUsers();
            let error = await requestValidator.validateRequest(csvParser, action, users);
            if (neritoUtils.isEmpty(error)) {
                const response = await organizationController.saveOrganization(csvParser, action);
                return response;
            } else {
                return neritoUtils.errorResponseJson(error, 400);
            }
        } else if ((action.localeCompare(neritoUtils.action.UPDATEORG) == 0)) {
            action = neritoUtils.action.UPDATEORG;
            users = await getUsers();
            let error = requestValidator.validateRequest(csvParser, action, users);
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

async function getUsers() {
    try {
        let users = await service.getUserList();
        if (neritoUtils.isEmpty(users) || neritoUtils.isEmpty(users.Items)) {
            return neritoUtils.errorResponseJson("Unable to fetch users from User table", 400);
        }
        users = users.Items;
        return users;
    } catch (err) {
        console.error("Something went wrong while fetching users from User table", err);
        return neritoUtils.errorResponseJson("Something went wrong while fetching users from User table", 400);
    }
}

