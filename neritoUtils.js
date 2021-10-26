
module.exports = {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
     csvStatus : {
        PENDING: 'PENDING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED'
    },
    successResponseJson: async function (message, code) {
        let error = {};
        let Error = {};
        Error.Success = message;
        error.isBase64Encoded = false;
        error.statusCode = code;
        error.headers = {
            "X-Requested-With": '*',
            "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Methods": 'POST,GET,OPTIONS,PUT'
        },
            error.body = JSON.stringify(Error);
        console.log(error);
        return error;
    },
    errorResponseJson: async function (message, code) {
        let error = {};
        let Error = {};
        Error.Errors = message;
        error.isBase64Encoded = false;
        error.statusCode = code;
        error.headers = {
            "X-Requested-With": '*',
            "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-requested-with,orgId',
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Methods": 'POST,GET,OPTIONS,PUT'
        },
            error.body = JSON.stringify(Error);
        console.log(error);
        return error;
    }
}
