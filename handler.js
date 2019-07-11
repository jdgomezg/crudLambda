'use strict';
const DynamoHelper = require('./dynamo_helper');
const dynamo = new DynamoHelper;

/**
 * Headers to send back to client
 */
const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD, OPTIONS'
};

/**
 * Function to send response to client
 * @param statusCode {number}
 * @param body {*}
 * @param headers {*}
 * @returns {{statusCode: *, headers: string, body: *}}
 */
const sendResponse = (statusCode, body, headers = '') => {
    const response = {
        statusCode: statusCode,
        headers: headers,
        body: body
    };
    return response;
};

const CONST_TABLE_NAME = 'Music';

module.exports.records = async (event, context) => {
    /* Handle GET requests */
    if (event.httpMethod === 'GET') {
        console.log('Get requested');
        try {
            let parametroA = event.queryStringParameters != null ? event.queryStringParameters.uno : null;
            let parametroS = event.queryStringParameters != null ? event.queryStringParameters.dos : null;
            if (parametroA != null && parametroS != null) {
                // busca el registro que se quiere consultar
                const params = {
                    TableName: CONST_TABLE_NAME,
                    Key: {
                        "Artist": parametroA,
                        "SongTitle": parametroS
                    }
                };
                const data = await dynamo.loadDataByParams(params);
                console.log('By params Data read correctly');
                const body = JSON.stringify(data.Item);
                return sendResponse(200, body, headers);
            } else {
                // traer todos los registros
                const params = {
                    TableName: CONST_TABLE_NAME
                };
                const data = await dynamo.loadData(params);
                console.log('Data read correctly');
                const body = JSON.stringify({
                    Items: data.Items
                });
                return sendResponse(200, body, headers);
            }
        } catch (e) {
            console.error('Error obtieniendo Pistas', e);
            return sendResponse(500, JSON.stringify({
                message: 'Internal server error ' + e
            }), headers);
        }
    }

    /* Handle POST requests */
    if (event.httpMethod === 'POST') {
        console.log('Post requested');
        try {
            const body = JSON.parse(event.body);
            const userParams = body.userParameters;
            // Item a guardar
            const params = {
                TableName: CONST_TABLE_NAME,
                Item: {
                    Artist: userParams.Artist,
                    SongTitle: userParams.SongTitle,
                    fecha: userParams.fecha,
                    Points: userParams.Points
                }
            };
            await dynamo.saveData(params);
            console.log('Pista guardada correctamente');
            return sendResponse(200, JSON.stringify({
                message: 'Pista guardada correctamente'
            }), headers);
        } catch (e) {
            console.error('Error guardando Pista', e);
            if (e.name === 'ConditionalCheckFailedException') {
                return sendResponse(409, JSON.stringify({
                    message: 'La Pista ya existe'
                }), headers);
            } else {
                return sendResponse(500, JSON.stringify({
                    message: 'Internal server error ' + e
                }), headers);
            }
        }
    }

    /* Handle PUT requests */
    if (event.httpMethod === 'PUT') {
        console.log('Put requested');
        try {
            const body = JSON.parse(event.body);
            const userParams = body.userParameters;
            const params = {
                TableName: CONST_TABLE_NAME,
                Key: {
                    "Artist": userParams.Artist,
                    "SongTitle": userParams.SongTitle
                },
                UpdateExpression: "set fecha=:a, Points=:e",
                ExpressionAttributeValues: {
                    ":a": userParams.fecha,
                    ":e": userParams.Points
                },
                ReturnValues: "UPDATED_NEW"
            };
            await dynamo.updateData(params);
            console.log('Pista actualizada correctamente');
            return sendResponse(200, JSON.stringify({
                message: 'Pista actualizada correctamente'
            }), headers);
        } catch (e) {
            console.error('Error actualizando Pista', e);
            if (e.name === 'ConditionalCheckFailedException') {
                return sendResponse(408, JSON.stringify({
                    message: 'La Pista no existe'
                }), headers);
            } else {
                return sendResponse(500, JSON.stringify({
                    message: 'Internal server error ' + e
                }), headers);
            }
        }
    }

    /* Handle DELETE requests */
    if (event.httpMethod === 'DELETE') {
        console.log('Delete requested');
        try {
            const params = {
                TableName: CONST_TABLE_NAME,
                Key: {
                    "Artist": event.queryStringParameters.uno,
                    "SongTitle": event.queryStringParameters.dos
                }
            };
            await dynamo.deleteData(params);
            console.log('Pista eliminada correctamente');
            return sendResponse(200, JSON.stringify({
                message: 'Pista eliminada correctamente'
            }), headers);
        } catch (e) {
            console.error('Error eliminando Pista', e);
            if (e.name === 'ConditionalCheckFailedException') {
                return sendResponse(408, JSON.stringify({
                    message: 'La Pista no existe'
                }), headers);
            } else {
                return sendResponse(500, JSON.stringify({
                    message: 'Internal server error ' + e
                }), headers);
            }
        }
    }
};