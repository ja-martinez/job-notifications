/*
Function that will accept array. Array will only contain companies that changed and will be composed of company objects with keys of companyName, newJobs, and removedJobs. It will then create a message based on the job data and send the email with the SES SDK.

TODO: Consider handling (newJobs, removedJobs) arguments for sendEmail()
*/
import { renderFile } from "ejs";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const REGION = "us-east-2";

const FROM_ADDRESS = "job-notifications@clavius.dev";
const TO_ADDRESS = "j.alejandro.mrtnz@gmail.com";
const EMAIL_SUBJECT = "Today's Job Updates";
const EMAIL_TEMPLATE_FILENAME = "./email-template.ejs";

function createSendEmailCommand(
  toAddress,
  fromAddress,
  emailSubject,
  htmlBody
) {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: emailSubject,
      },
    },
    Source: fromAddress,
  });
}

async function getHtmlBody(companies, emailTemplateFilename) {
  // returns HTML string from companies array

  const renderFileWithPromise = (fileName, data, options) => {
    return new Promise((resolve, reject) => {
      renderFile(fileName, data, options, (err, str) => {
        if (err) reject(err);
        resolve(str);
      });
    });
  };

  const htmlString = await renderFileWithPromise(
    emailTemplateFilename,
    { companies },
    { rmWhiteSpace: true }
  );

  return htmlString;
}

async function sendEmail(companies) {
  // takes in an array of objects containing companyName, newJobs, and removedJobs
  const sesClient = new SESClient({ region: REGION });
  const htmlBody = await getHtmlBody(companies, EMAIL_TEMPLATE_FILENAME);
  const sendEmailCommand = createSendEmailCommand(
    TO_ADDRESS,
    FROM_ADDRESS,
    EMAIL_SUBJECT,
    htmlBody
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("failed to send email.");
    return e;
  }
}

export default sendEmail;

// Testing
// const companies = [
//   {
//     companyName: "Schrodinger",
//     newJobs: [
//       {
//         title: "boosdf",
//         locations: "nyc, ny; tampa, FL",
//         url: "google.com",
//       },
//     ],
//     removedJobs: [
//       {
//         title: "aaaa",
//         locations: "aaa, ny; taaaa FL",
//         url: "google.com",
//       },
//     ],
//   },
//   {
//     companyName: "Google",
//     newJobs: [
//       {
//         title: "boossdf",
//         locations: "nyc, ny; tampa, FL",
//         url: "google.com",
//       },
//       {
//         title: "bsdf",
//         locations: "nyc, ny",
//         url: "google.com",
//       },
//     ],
//     removedJobs: [
//       {
//         title: "aaaa",
//         locations: "aaa, ny; taaaa FL",
//         url: "google.com",
//       },
//     ],
//   },
// ];

// getHtmlBody(companies, EMAIL_TEMPLATE_FILENAME);
// sendEmail(companies);
