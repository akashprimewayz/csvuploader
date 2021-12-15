const neritoUtils = require('./neritoUtils.js');
module.exports = {
    validateRequest: function (request, action) {
        let error = {};

        try {
            const { content, filename } = request.files[0];
            if (action == "UPDATEORG" && neritoUtils.isEmpty(request.Id)) {
                error.Id = "Invalid";
            }
            if (action == "UPDATEORG" && neritoUtils.isEmpty(request.SK)) {
                error.SK = "Invalid";
            }
            if (neritoUtils.isEmpty(request.AccountUsers) || !neritoUtils.isValidJson(request.AccountUsers)) {
                error.AccountUsers = "Invalid";
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
            }
            if (neritoUtils.isEmpty(request.Status) || neritoUtils.isBoolean(request.Status)) {
                error.Status = "Invalid";
            }
            if (!neritoUtils.isEmpty(filename) && !neritoUtils.isCorrectImgFileType(filename)) {
                error.fileType = "Invalid";
            }
            if (!neritoUtils.isEmpty(filename) && content.length > 1048576) {
                error.fileSize = "Invalid";
            }
            return error;
        } catch (err) {
            console.error(err);
            error.requestValidation = "Something went wrong";
            return false;
        }
    }
};



