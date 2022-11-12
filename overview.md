# Job Notifications

## TODO

1. Implement DynamoDB table with local code
2. implement code in a Lambda Function
3. figure out how to trigger Lambda Function
4. figure out how to set up CI/CD to change function - maybe webhooks

## Overview

Create a service that checks some job boards everyday and sends an email when a new job is posted.

## Technical Overview

Job boards will be checked in sources that are either api's or website crawlers.

**It is possible that most websites that don't have visible api's will have some sort of notification feature. In this case maybe you want to filter those emails?**

There are platforms like *Greenboard.io* that offer job posting api's for several companies, so I'll be able to reuse the logic between those companies. 

For each API I will have to find a way of extracting the data needed.

For each website I will have to find a way of extracting the data needed.

The job postings will have to be filtered to find relevant positions (location, job category, experience).

The jobs will have to be stored on a database.

### API Sources

All API sources will have info like:

* id
* category
* title
* Url
* Description/content

### Checking for new jobs

1. This could be done by saving jobs and comparing today's with what was stored.
2. This could also be done by looking at the `updated_at` value.

If we choose option 2, we can also save relevant jobs to a database so that we can access them in some sort of page

### Workflow

To add a new company, I'll have understand its API and create a function that extracts a list of jobs with the necessary data. I would then modify the main script by adding a company name (to fetch jobs from database) and the function used to fetch data.

### Program Timeline

For comparing previous jobs to current jobs, we are essentially trying to get the exclusives (only in prevJobs and only in currJobs) in an intersection between thos jobs.

1. Query all jobs from this source and put them in a Hash Map `prevJobs` by their id
2. Call API to retrieve jobs
3. Filter relevant jobs, choose which info to keep, and put them in a `currJobs` array.
4. Iterate over `currJobs` jobs
   1. If job is new, add it to a `newJobs` array
   2. If job is old, add it to a `oldActiveJobs` object
5. Iterate over `prevJobs`
   1. if a job is not in `currJobs`/`oldActiveJobs`, add it to a `removedJobs` array
6. Remove `removedJobs` jobs from database
7. Add `newJobs` jobs to database
8. Send email with new jobs.



### Database

Jobs will have the following Schema:

* companyName - partition key
* jobID - sortKey
* title
* url
* locations



I may also add a property like "experience needed" or description/content.

Since I'm not exactly sure of what features I may add in the future, I'll use a NoSQL database like MongoDB or DynamoDB if I want to use an AWS service.

### Running it

I think I'll try to use lambda functions since there's no need to run a server all the time. I could also use a container with AWS Fargate.

### Viewing current jobs portal

Whenerver the database is updated (new jobs or jobs are removed) then I can trigger a build of a static site.

### Filtering

We can filter out jobs that have the words "senior" and "staff" in their titles.

We can filter by api specific data like category and location, but we can also try to use the description to determine whether or not the position requires a lot of experience. At the very least, maybe we could extract some sort of snippet of the description that mentions years of experience. We could do this kind of processing with gpt-3. I would have to figure out how to ask it a question from some input.



## Technical Learning Opportunities

How do notifications work on a network/server level?

How to send email notifications?

Server vs serverless

database service vs self hosting

Gpt-3

## Greenhouse API Docs

https://developers.greenhouse.io/job-board.html#list-jobs