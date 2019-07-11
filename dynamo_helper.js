// Importa el sdk de AWS
const AWS = require('aws-sdk');

const docDynamo = new AWS.DynamoDB.DocumentClient();

class DynamoHelper {
    saveData(params) {
        return docDynamo.put(params).promise();
    }

    loadData(params) {
        return docDynamo.scan(params).promise();
    }

    loadDataByParams(params) {
        return docDynamo.get(params).promise();
    }

    updateData(params) {
        return docDynamo.update(params).promise();
    }

    deleteData(params) {
        return docDynamo.delete(params).promise();
    }
}

module.exports = DynamoHelper;
