module.exports = {
    successResponseJson: async function(message, code) {
        let error = {};
        let Error = {};
        Error.Success = message;
        error.isBase64Encoded = false;
        error.statusCode = code;
        error.body = JSON.stringify(Error);
        console.log(error);
        return error;
    },
    errorResponseJson : async function (message, code) {
        let error = {};
        let Error = {};
        Error.Errors = message;
        error.isBase64Encoded = false;
        error.statusCode = code;
        error.body = JSON.stringify(Error);
        console.log(error);
        return error;
    }
}
