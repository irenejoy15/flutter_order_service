// STEP 2
const {DynamoDBClient, PutItemCommand} = require('@aws-sdk/client-dynamodb');
const axios = require('axios');
const cryto = require('crypto');
const { stat } = require('fs');

const dbClient = new DynamoDBClient({region: 'us-east-1'});

exports.placeOrder = async (event) => {
    try{
        const {id,quantity, email} = JSON.parse(event.body);
        if(!id || !quantity || !email){
            return {
                statusCode: 400,
                body: JSON.stringify({msg: 'Missing required fields'}),
            };
        }
        const productsResponse = await axios.get(`https://4sfecl9ji9.execute-api.us-east-1.amazonaws.com/products`);
        const approvedProducts = productsResponse.data || [];
        const product = approvedProducts.find(p => p.id === id);
        if(!product){
            return {
                statusCode: 404,
                body: JSON.stringify({msg: 'Product not found'}),
            };
        }
        const availableStock = parseInt(product.quantity || '0');
        if(availableStock < quantity){
            return {
                statusCode: 400,
                body: JSON.stringify({msg: 'Insufficient stock'}),
            };
        }
        const orderId = cryto.randomUUID();
        const orderPayload = {
            orderId: {S: orderId},
            productId: {S: id},
            quantity: {N: quantity.toString()},
            email: {S: email},
            status: {S: 'PENDING'},
            createdAt: {S: new Date().toISOString()},

        }
        await dbClient.send(new PutItemCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Item: orderPayload,
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({msg: 'Order placed successfully', orderId}),
        }
    }catch(error){
        console.error('Error placing order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({msg: 'Failed to place order'}),
        }
    }
}
// END STEP 2