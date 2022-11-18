/*
This function will get the newJobs and removedJobs from all companies, update the database, and send an email update

TODO: refactor sendEmail to take in (newJobs, removedJobs) arguments
TODO: Make sure companyName is always correct;
TODO: Consider what to do if a network call doesn't work.

I could at some point refactor this using OOP
*/

// import companies as object pointing to a company's methods
import * as companies from "./lib/companies/company-exports";
import sendEmail from "./lib/sesSendEmail";
import {
  getAllPrevJobs,
  getCompanyPrevJobs,
  updateDB,
} from "./lib/dynamodb-functions";

async function runOne(companyName) {
  const [prevJobs, currJobs] = await Promise.all([
    getCompanyPrevJobs(companyName),
    schrodinger.getCurrJobs(),
  ]);

  const [newJobs, removedJobs] = await getJobChanges(prevJobs, currJobs);

  try {
    updateDB(newJobs, removedJobs);
  } catch (err) {
    console.error("Could not update DB");
    throw new Error(err);
  }
}

async function runAll(companies) {
  const [allPrevJobs, allCurrJobs] = await Promise.all([
    getAllPrevJobs(),
    getAllCurrJobs(companies),
  ]);

  // get removedJobs
  const removedJobs = [];
  for (const job of allPrevJobs) {
    if (!allCurrJobs[job.companyName]?.[job.jobID]) {
      removedJobs.push(job);
    }
  }


  // get newJobs
  const newJobs = [];
  for (const companyName in allCurrJobs) {
    const jobs = allCurrJobs[companyName];
    for (const jobID in jobs) {
      const job = jobs[jobID];
      if (!allPrevJobs[companyName]?.[jobID]) {
        newJobs.push(job);
      }
    }
  }

  // TODO: May need to refactor these last sections

  // updateDB
  try {
    await updateDB(newJobs, removedJobs);
  } catch (err) {
    console.error("Could not update DB");
    throw new Error(err);
  }

  // send email
  // TODO: refactor sendEmail to take in (newJobs, removedJobs) arguments
  try {
    await sendEmail(newJobs, removedJobs);
  } catch (err) {
    console.error("Could not update DB");
    throw new Error(err);
  }
}

async function getAllCurrJobs(companies) {
  // returns object mapping companies to company jobs
  const currJobsArray = await Promise.all(
    Object.values(companies).map((company) => company.getCurrJobs())
  );

  const currJobs = {};

  Object.keys(companies).forEach((companyName, i) => {
    currJobs[companyName] = currJobsArray[i];
  });

  return currJobs;
}

async function getJobChanges(prevJobs, currJobs) {
  // params are objects with jobID keys that point to jobs
  const newJobs = getUniqueElements(currJobs, prevJobs);
  const removedJobs = getUniqueElements(prevJobs, currJobs);
  return [newJobs, removedJobs];
}

function getUniqueElements(obj1, obj2) {
  // returns members that are unique to object obj1
  const exclusiveElements = [];

  for (const id in obj1) {
    if (!obj2[id]) {
      exclusiveElements.push(obj1[id]);
    }
  }

  return exclusiveElements;
}
