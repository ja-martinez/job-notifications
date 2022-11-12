/*
Goals:
1. Set up DynamoDB
2. Batch put and delete jobs 
3. query jobs for a company
*/

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

const REGION = "us-east-2";
const TABLE_NAME = "Jobs";
const COMPANY_NAME = "schrodinger"

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

async function putItem() {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      companyName: "Schrodinger",
      jobID: 1,
      title: "Chief Technologist of the Solar System",
      url: "https://google.com",
      locations: "New York City",
    },
  };
  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - item added", data);
  } catch (err) {
    console.error(err, err.stack);
  }
}

async function updateDB(newJobs, removedJobs) {
  const params = {
    RequestItems: {
      [TABLE_NAME]: [],
    },
  };

  // format newJobs appropriately and add them to params
  newJobs.forEach((job) => {
    params.RequestItems[TABLE_NAME].push({
      PutRequest: {
        Item: job,
      },
    });
  });

  // format removedJobs appropriately and add them to params
  removedJobs.forEach((job) => {
    params.RequestItems[TABLE_NAME].push({
      DeleteRequest: {
        Key: {
          'companyName': job.companyName,
          'jobID': job.jobID,
        },
      },
    });
  });

  try {
    const data = await ddbDocClient.send(new BatchWriteCommand(params));
    console.log("Success. Database updated", data);
  } catch (err) {
    console.error(err.stack)
  }
}

async function getPrevJobs() {
  const params = {
    TableName: TABLE_NAME,
    ExpressionAttributeValues: {
      ":c": COMPANY_NAME
    },
    KeyConditionExpression: "companyName = :c"
  }

  const jobs = {};
  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    const jobsArray = data.Items
    jobsArray.forEach((job) => jobs[job.jobID] = job);
    console.log("success. Item Details: ", jobs)
    return jobs;
  } catch (err) {
    throw new Error(err);
  }
}

// const newJobs = [
//   {
//     jobID: 4109517003678,
//     title: "Should be removed",
//     url: "https://boards.greenhouse.io/schrdinger/jobs/4109517003",
//     locations: "New York",
//     companyName: "schrodinger"
//   },
//   {
//     jobID: 5375867003,
//     title: "Full Stack Machine Learning Engineer",
//     url: "https://boards.greenhouse.io/schrdinger/jobs/5375867003",
//     locations: "New York",
//     companyName: "schrodinger"
//   },
// ];

// const removedJobs = [
//   {
//     jobID: 1,
//     companyName: "schrodinger"
//   }
// ]

// updateDB(newJobs, removedJobs);

getPrevJobs()