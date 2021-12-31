const neritoUtils = require('./neritoUtils.js');
let service = require('./service.js');

let accountUsers = [];
let payrollUsers = [];


module.exports = {
    validateRequest: function (request, action, users) {
        accountUsers = [];
        payrollUsers = [];
        let error = {};
        try {
            for (const element of users) {
                console.log("element.OrganizationId", element.OrganizationId);
                if (element.OrganizationId !== "") {
                    continue;
                }
                if (element.Group.localeCompare(neritoUtils.userType.ACCOUNT_USER) == 0) {
                    accountUsers.push(element.Id);
                }
                if (element.Group.localeCompare(neritoUtils.userType.PAYROLL_USER) == 0) {
                    payrollUsers.push(element.Id);
                }
            }

            if (neritoUtils.isEmpty(request.files[0])) {
                if (action.localeCompare(neritoUtils.action.SAVEORG) == 0) {
                    error.File = "Invalid";
                }
            } else {
                const { content, filename } = request.files[0];
                if (!neritoUtils.isEmpty(filename) && content.length > 1048576) {
                    error.fileSize = "Invalid";
                }
                if (!neritoUtils.isEmpty(filename) && !neritoUtils.isCorrectImgFileType(filename)) {
                    error.fileType = "Invalid";
                }
            }

            if (action.localeCompare(neritoUtils.action.UPDATEORG) == 0 && neritoUtils.isEmpty(request.Id)) {
                error.Id = "Invalid";
            }
            if (action.localeCompare(neritoUtils.action.UPDATEORG) == 0 && neritoUtils.isEmpty(request.SK)) {
                error.SK = "Invalid";
            }
            if (neritoUtils.isEmpty(request.AccountUsers) || !neritoUtils.isValidJson(request.AccountUsers)) {
                error.AccountUsers = "Invalid";
            } else if (!neritoUtils.isEmpty(getUserIds(accountUsers, request.AccountUsers))) {
                error.Error = "User(s) not found";
                error.AccountUsers = getUserIds(accountUsers, request.AccountUsers);
            }
            if (neritoUtils.isEmpty(request.FiscalInfo) || request.FiscalInfo <= 0 || request.FiscalInfo > 100) {
                error.AccountUsers = "Invalid";
            }
            if (neritoUtils.isEmpty(request.Config) || !neritoUtils.isValidJson(request.Config)) {
                error.Config = "Invalid";
            }
            if (neritoUtils.isEmpty(request.Email) || !neritoUtils.isEmailValid(request.Email)) {
                error.Email = "Invalid";
            }
            if (neritoUtils.isEmpty(request.EmployeeEnrollmentDate) || (request.EmployeeEnrollmentDate < 1 || request.EmployeeEnrollmentDate > 31)) {
                error.EmployeeEnrollmentDate = "Invalid";
            }
            if (neritoUtils.isEmpty(request.FileValidation) || !neritoUtils.isValidJson(request.FileValidation)) {
                error.FileValidation = "Invalid";
            }
            if (neritoUtils.isEmpty(request.OrgName) || request.OrgName.length > 60) {
                error.OrgName = "Invalid";
            }
            if (neritoUtils.isEmpty(request.PayrollDisbursement) || (request.PayrollDisbursement < 1 || request.PayrollDisbursement > 31)) {
                error.PayrollDisbursement = "Invalid";
            }
            if (neritoUtils.isEmpty(request.PayrollUsers) || !neritoUtils.isValidJson(request.PayrollUsers)) {
                error.PayrollUsers = "Invalid";
            } else if (!neritoUtils.isEmpty(getUserIds(payrollUsers, request.PayrollUsers))) {
                error.Error = "User(s) not found";
                error.PayrollUsers = getUserIds(payrollUsers, request.PayrollUsers);
            }
            if (neritoUtils.isEmpty(request.Status) || neritoUtils.isBoolean(request.Status)) {
                error.Status = "Invalid";
            }
            if (neritoUtils.isEmpty(request.TransferTo) || !(request.TransferTo in neritoUtils.transferTo)) {
                error.TransferTo = "Invalid";
            }

            return error;
        } catch (err) {
            console.error(err);
            error.requestValidation = "Something went wrong";
            return error;
        }
    }
};

function getUserIds(listJsonDb, listJson) {
    let userIds = [];
    listJson = JSON.parse(listJson);
    for (const element of listJson) {
        if (listJsonDb.indexOf(element.Id) == -1) {
            userIds.push(element.Id);
        }
    }
    return userIds;
}