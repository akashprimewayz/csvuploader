let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');

const { v4: uuidv4 } = require('uuid');
const logoBucketName = "logo";
const uniqueId = uuidv4();
let org = {};
let userIds = [];
let fullFileName;

module.exports = {
    saveOrganization: async function (csvParser, action) {
        try {
            const { content, filename } = csvParser.files[0];
            let isFileUploaded = false;
            let isDataInserted = false;
            org = getOrganization(csvParser, uniqueId, action, filename);
            try {
                isFileUploaded = await service.putObjectOnS3(fullFileName, content, logoBucketName, neritoUtils.storagetype.ORG_LOGO);
                if (!isFileUploaded) {
                    console.error("Error while uploading file: " + fullFileName);
                    return neritoUtils.errorResponseJson("UploadFailed", 400);
                }
            } catch (err) {
                console.error("Unable to Upload organization logo on S3" + fullFileName, err);
                return neritoUtils.errorResponseJson("UploadFailed", 400);
            }
            try {
                isDataInserted = await service.saveOrganization(org);
                if (!isDataInserted) {
                    console.error("Error while saving organization");
                    return neritoUtils.errorResponseJson("SaveOrganizationFailed", 400);
                }
            } catch (err) {
                console.error("Error while saving organization", err);
                try {
                    let isFileDeleted = await service.deleteObjectOnS3(fullFileName);
                    if (!isFileDeleted) {
                        console.error("Error while deleting file: " + fullFileName);
                        return neritoUtils.errorResponseJson("DeleteFailed", 400);
                    }
                } catch (err) {
                    console.error("Error while deleting organization logo " + fullFileName, err);
                    return neritoUtils.errorResponseJson("DeleteFailed", 400);
                }
                return neritoUtils.errorResponseJson("DataInsertFailed", 400);
            }
            try {
                for (const element of userIds) {
                    let userJSON = await service.getUserById(element);
                    if (neritoUtils.isEmpty(userJSON) || neritoUtils.isEmpty(userJSON.Items) || neritoUtils.isEmpty(userJSON.Items[0])) {
                        return neritoUtils.errorResponseJson("Something went wrong with User", 400);
                    }
                    let user = getUser(userJSON.Items[0], org);
                    isDataInserted = await service.updateUser(user);
                }
            } catch (err) {
                console.error("Unable to get organization data by orgId: " + org.Id, err);
                return neritoUtils.errorResponseJson("UploadFailed", 400);
            }
            try {
                let organization = await service.getOrgDataById(org.Id);
                if (organization != null && organization != undefined && organization.Items.length > 0 && organization.Items[0] != null && organization.Items[0] != undefined && organization.Items[0].FileValidation != null && organization.Items[0].FileValidation != undefined) {
                    organization = organization.Items[0];
                    return neritoUtils.successResponseJson(organization, 200);
                } else {
                    return neritoUtils.errorResponseJson("Something went wrong", 400);
                }
            } catch (err) {
                console.error("Unable to get organization data by orgId: " + org.Id, err);
                return neritoUtils.errorResponseJson("UploadFailed", 400);
            }
        } catch (err) {
            console.error("Something went wrong", err);
            return neritoUtils.errorResponseJson("SaveFailed", 400);
        }
    },

    updateOrganization: async function (csvParser, action) {
        const { content, filename } = csvParser.files[0];
        let isFileUploaded = false;
        let isDataInserted = false;
        org = getOrganization(csvParser, uniqueId, action, filename);
        try {
            let organization = await service.getOrgDataById(csvParser.Id);
            if (organization != null && organization != undefined && organization.Items.length > 0 && organization.Items[0] != null && organization.Items[0] != undefined && organization.Items[0].FileValidation != null && organization.Items[0].FileValidation != undefined) {
                organization = organization.Items[0];
                if (organization.Id != csvParser.Id) {
                    return neritoUtils.errorResponseJson("Organization details not found By Id:" + org.Id, 400);
                }
            } else {
                return neritoUtils.errorResponseJson("Organization details not found By Id:" + org.Id, 400);
            }
        } catch (err) {
            console.error("Unable to get organization data by orgId: " + "ORG#" + org.Id, err);
            return neritoUtils.errorResponseJson("UploadFailed", 400);
        }
        if (filename != null) {
            try {
                isFileUploaded = await service.putObjectOnS3(fullFileName, content, logoBucketName, neritoUtils.storagetype.ORG_LOGO);
                if (!isFileUploaded) {
                    console.error("Error while uploading file: " + fullFileName);
                    return neritoUtils.errorResponseJson("UploadFailed", 400);
                }
            } catch (err) {
                console.error("Unable to Upload organization logo on S3" + fullFileName, err);
                return neritoUtils.errorResponseJson("UploadFailed", 400);
            }
        }
        try {
            for (const element of userIds) {
                let userJSON = await service.getUserById(element);
                if (neritoUtils.isEmpty(userJSON) || neritoUtils.isEmpty(userJSON.Items) || neritoUtils.isEmpty(userJSON.Items[0])) {
                    return neritoUtils.errorResponseJson("Something went wrong with User", 400);
                }
                let user = getUser(userJSON.Items[0], org);
                isDataInserted = await service.updateUser(user);
            }
        } catch (err) {
            console.error("Unable to get organization data by orgId: " + org.Id, err);
            return neritoUtils.errorResponseJson("UploadFailed", 400);
        }
        try {
            isDataInserted = await service.saveOrganization(org);
            if (!isDataInserted) {
                console.error("Error while saving organization");
                return neritoUtils.errorResponseJson("SaveOrganizationFailed", 400);
            }
        } catch (err) {
            console.error("Error while saving organization", err);
            try {
                let isFileDeleted = await service.deleteObjectOnS3(fullFileName);
                if (!isFileDeleted) {
                    console.error("Error while deleting file: " + fullFileName);
                    return neritoUtils.errorResponseJson("DeleteFailed", 400);
                }
            } catch (err) {
                console.error("Error while deleting organization logo " + fullFileName, err);
                return neritoUtils.errorResponseJson("DeleteFailed", 400);
            }
            return neritoUtils.errorResponseJson("DataInsertFailed", 400);
        }

        try {
            let organization = await service.getOrgDataById(org.Id);
            if (organization != null && organization != undefined && organization.Items.length > 0 && organization.Items[0] != null && organization.Items[0] != undefined && organization.Items[0].FileValidation != null && organization.Items[0].FileValidation != undefined) {
                organization = organization.Items[0];
            }
            return neritoUtils.successResponseJson(organization, 200);
        } catch (err) {
            console.error("Unable to get organization data by orgId: " + org.Id, err);
            return neritoUtils.errorResponseJson("UploadFailed", 400);
        }
    }
};

function getOrganization(csvParser, uniqueId, action, filename) {
    if (action === neritoUtils.action.SAVEORG) {
        org.Id = "ORG#" + uniqueId;
        org.SK = "METADATA#" + uniqueId;
    } else {
        org.Id = csvParser.Id;
        org.SK = csvParser.SK;
    }
    fullFileName = ("LOGO#" + org.Id + neritoUtils.getExtension(filename)).trim();
    org.AccountUsers = JSON.parse(csvParser.AccountUsers);

    for (const element of org.AccountUsers) {
        userIds.push(element.Id);

    }

    org.Email = csvParser.Email;
    org.EmployeeEnrollmentDate = csvParser.EmployeeEnrollmentDate;
    org.FileValidation = JSON.parse(csvParser.FileValidation);
    org.FiscalInfo = csvParser.FiscalInfo;
    org.OrgDetails = csvParser.OrgDetails;
    org.OrgName = csvParser.OrgName;
    org.PayrollDisbursement = csvParser.PayrollDisbursement;
    org.PayrollUsers = JSON.parse(csvParser.PayrollUsers);


    for (const element of org.PayrollUsers) {
        userIds.push(element.Id);

    }
    org.Status = csvParser.Status;
    let configJSON = JSON.parse(csvParser.Config);
    configJSON.Logo = fullFileName;
    org.Config = configJSON;
    if (!neritoUtils.isEmpty(csvParser.TransferTo)) {
        org.TransferTo = csvParser.TransferTo;
    } else {
        org.TransferTo = neritoUtils.transferTo.BNK;
    }
    return org;
}


function getUser(usr, org) {
    let user = {};
    user.Id = usr.Id,
        user.Group = usr.Group,
        user.Email = usr.Email,
        user.Name = usr.Name,
        user.OrganizationId = org.Id,
        user.Status = true;
    return user;
}