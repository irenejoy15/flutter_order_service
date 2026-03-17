// STEP 6
const {DynamoDBClient, PutItemCommand} = require('@aws-sdk/client-dynamodb');
const dynamoDBClient = new DynamoDBClient({region: 'us-east-1'});

exports.processOrder = async (event) => {
    try{
        for(const record of event.Records){
            const orderData = JSON.parse(record.body);
            const {id,productId,quantity,email,status,createdAt, fullName, productName, productPrice} = orderData;

            // SEND A COMMAND TO DYNAMODB TO STORE THE ORDER IN THE ORDERS TABLE
            await dynamoDBClient.send(new PutItemCommand({
                TableName: process.env.DYNAMODB_TABLE,
                Item: {
                    id: { S: id },
                    productId: { S: productId },
                    quantity: { N: quantity.toString() },
                    email: { S: email },
                    fullName: { S: fullName },
                    productName: { S: productName },
                    productPrice: { N: productPrice.toString() },
                    status: { S: status },
                    createdAt: { S: createdAt }
                }
            }));
        }
        return {
            statusCode: 200,
            body: JSON.stringify({msg: 'Orders processed successfully'}),
        };
    }catch(error){
        console.error('Error processing order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({msg: 'Failed to process order'}),
        };
    }
};
// STEP 6