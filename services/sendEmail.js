const {SESClient,SendEmailCommand} = require('@aws-sdk/client-ses');
const sesClient = new SESClient({region: 'us-east-1'});
exports.sendOrderEmail = async (toEmail, orderId, productName, quantity) => {
    const emailParams = {
        Source: 'irenejoy15@gmail.com',
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Subject: {
                Data: `Order Confirmation - ${orderId}`,
            },
            Body: {
                Text: {
                    Data: `Thank you for your order!\n\n Order ID: ${orderId}\nProduct: ${productName}\nQuantity: ${quantity}`,
                },
            },
        },
    };
    try{
        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);
    }catch(error){
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({msg: 'Failed to send email'}),
        };
    }
}