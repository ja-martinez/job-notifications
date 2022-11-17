/*
Goals:
1. Set up DynamoDB
2. Batch put and delete jobs 
3. query jobs for a company
4. 
*/

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const REGION = "us-east-2";
const TABLE_NAME = "Jobs";

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

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
          companyName: job.companyName,
          jobID: job.jobID,
        },
      },
    });
  });

  try {
    const data = await ddbDocClient.send(new BatchWriteCommand(params));
    console.log("Success. Database updated", data);
  } catch (err) {
    console.error(err.stack);
  }
}

// returns jobs object with jobID as key
async function getCompanyPrevJobs(companyName) {
  const params = {
    TableName: TABLE_NAME,
    ExpressionAttributeValues: {
      ":c": companyName,
    },
    KeyConditionExpression: "companyName = :c",
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    const jobsArray = data.Items;

    // convert arr
    const jobs = {};
    jobsArray.forEach((job) => (jobs[job.jobID] = job));
    console.log(`Previous ${companyName} jobs successfully retrieved from DB.`);
    return jobs;
  } catch (err) {
    console.error(
      `Previous ${companyName} jobs could not be retrieved from DB`
    );
    throw new Error(err);
  }
}

// returns object with companyName keys that point to an object with jobID keys.
async function getAllPrevJobs() {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    const jobsArray = data.Items;

    // If the results ever end up being paginated use async iterator from sdk
    if (data.LastEvaluatedKey) {
      console.log("WARNING: The Jobs are paginated");
    }

    // organize jobs by companyName and jobID
    let companies = {};
    for (const job of jobsArray) {
      if (!companies[job.companyName]) {
        const newCompany = { [job.jobID]: job };
        companies[job.companyName] = newCompany;
      } else {
        companies[job.companyName][job.jobID] = job;
      }
    }

    return companies;
  } catch (err) {
    console.error(
      `Previous ${companyName} jobs could not be retrieved from DB`
    );
    throw new Error(err);
  }
}

export { updateDB, getAllPrevJobs };