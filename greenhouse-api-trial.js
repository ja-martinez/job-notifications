/*
Trial of how to implement the job checking for the greenhouse API.

The primary goal is to get current jobs and filter them out.

The second goal is to implement the updating of previous jobs. Do this by creating a mock function that gets previous jobs from database. There should be some extra jobs and some missing jobs in there to simulate the adding and removal of jobs.
*/

const fs = require('fs');

async function getCurrentJobs() {
  const boardToken = "schrdinger";
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;

  const jobs = await fetch(url)
    .then((response) => response.json())
    .then((data) => data.jobs);

  // filter relevant jobs and data
  const filteredJobs = filterJobs(jobs).map((job) => {
    return {
      id: job.id,
      title: job.title,
      url: job.absolute_url,
      locations: job.location.name,
    };
  });
  
  return filteredJobs;
}

function filterJobs(jobs) {
  return filterByCategory(filterByLocation(filterByTitle(jobs)));

  function filterByLocation(jobs) {
    // case and location name seems inconsistent in API, so just check if a valid location is included in the locations String
    const validLocations = [
      "new york",
      "remote",
    ];

    return jobs.filter((job) => {
      const locationsString = job.location.name;
      for (const validLocation of validLocations) {
        if (locationsString.toLowerCase().includes(validLocation)) return true;
      }
      return false;
    });
  }

  function filterByTitle(jobs) {
    return jobs.filter((job) => {
      const title = job.title.toLowerCase();
      if (title.includes("senior") || title.includes("staff")) {
        return false;
      }
      return true;
    });
  }

  function filterByCategory(jobs) {
    return jobs.filter((job) => {
      const categoryData = job.metadata[0];

      if (categoryData.name !== "Website Category") {
        throw new Error("metadata's first entry is not job category");
      }

      if (categoryData.value === "Software Engineers") return true;

      return false;
    });
  }

}



// Testing
async function trial() {
  const currJobs = await getCurrentJobs();
  console.log(`num of jobs: ${currJobs.length}`);

  fs.writeFile('./current-jobs.json', JSON.stringify(currJobs), err => {
    if (err) {
      throw new Error(err);
    }
    console.log('Current jobs file has been updated!');
  })
}

trial();