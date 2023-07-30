const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const documentClient = new AWS.DynamoDB.DocumentClient();
const dynamoDBTable = 'blogIt';
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const sqsQueueName = 'blogs'; // Replace this with the name of your SQS queue

exports.handler = async (event) => {
//   const { email, blog_id, content } = event;

  try {
    const params = {
      TableName: dynamoDBTable,
      Item: {
        email: 'email@email.com',
        blog_id: '11111blog_id',
        content: 'ssss1112sss ss'
      },
    };

    await documentClient.put(params).promise();

    // Get the SQS queue URL dynamically
    const sqsParams = {
      QueueName: sqsQueueName,
    };

    const sqsQueueData = await sqs.getQueueUrl(sqsParams).promise();
    const sqsQueueUrl = sqsQueueData.QueueUrl;

    // Send blog information to the retrieved SQS queue URL
    const sendMessageParams = {
      MessageBody: JSON.stringify({ email, blog_id, content }),
      QueueUrl: sqsQueueUrl,
    };

    await sqs.sendMessage(sendMessageParams).promise();

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({ message: 'User blog stored and sent to SQS' }),
    };
    return response;
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to store or send to SQS' })
    };
  }
};
