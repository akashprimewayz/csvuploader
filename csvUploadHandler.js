'use strict'

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid')
let neritoUtils = require('./neritoUtils.js');

//const accessKeyId = process.env.accessKeyId
//const secretAccessKey = process.env.secretAccessKey
const region = process.env.region
const bucket_name = process.env.bucket_name
const ddbTable = process.env.table

AWS.config.update(
    {
        //accessKeyId,
        //secretAccessKey,
        region
    }
);

// Create the DynamoDB service object
let databaseClient = new AWS.DynamoDB.DocumentClient();


module.exports = {

    putObjectOnS3: async function (fullFileName, fileContent) {

        let isUploaded = false;
        // Upload the file to S3
        var bucketParams = {};
        bucketParams.Bucket = bucket_name;
        bucketParams.Key = fullFileName;
        bucketParams.Body = fileContent;
        try {
            let putObjectPromise = await s3.putObject(bucketParams, function (err, data) {
                if (err) {
                    console.error("unable to upload file:" + fullFileName + "  ", JSON.stringify(err, null, 2));
                    return isUploaded;
                }
                if (data) {
                    isUploaded = true;
                    return isUploaded;
                }
            }).promise();
        } catch (err) {
            console.log("Something went wrong while uploading object on s3", err);
            isUploaded = false;
            return isUploaded;
        }
        return isUploaded;
    },
    deleteObjectOnS3: async function (fullFileName) {

        let isDeleted = false;
        // Upload the file to S3
        var bucketParams = {};
        bucketParams.Bucket = bucket_name;
        bucketParams.Key = fullFileName;
        try {
            let delObjectPromise = await s3.deleteObject(bucketParams, function (err, data) {
                if (err) {
                    console.error("unable to delete file: " + fullFileName + "  ", JSON.stringify(err, null, 2));
                    return isDeleted;
                }
                if (data) {
                    isDeleted = true;
                    return isDeleted;
                }
            }).promise();
        } catch (err) {
            console.log("Something went wrong while uploading object on s3", err);
            isDeleted = false;
            return isDeleted;
        }
        return isDeleted;
    },
    insertCsvStatusInDb: async function (orgId, fullFileName, Id, SK) {

        let date = new Date();
        let month = date.getMonth();
        let isUpdated = false;
        let params = {
            TableName: ddbTable,
            Item: {
                "Id": Id,
                "SK": SK,
                "Month": neritoUtils.months[month],
                "csvName": fullFileName,
                "csvStatus": neritoUtils.csvStatus.PENDING
            }
        };
        try {
            let dbData = await databaseClient.put(params, function (err, data) {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    isUpdated = false;
                    return isUpdated
                }
                if (data) {
                    isUpdated = true;
                    return isUpdated;
                }
            }).promise();
        } catch (error) {
            console.error("Something went wrong while adding data into Db", JSON.stringify(err, null, 2));
            isUpdated = false;
            return isUpdated
        }
        return true;
    }
}
