/*
Function that will accept array. Array will only contain companies that changed and will be composed of company objects with keys of companyName, newJobs, and removedJobs. It will then create a message based on the job data and send the email with the SES SDK.

TODO: add from_address and to_address to environment
*/
import { renderFile, render } from "ejs";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const REGION = "us-east-2";

const FROM_ADDRESS = "alejandro@clavius.dev";
const TO_ADDRESS = "j.alejandro.mrtnz@gmail.com";
const EMAIL_SUBJECT = "Today's Job Updates";
const EMAIL_TEMPLATE_FILENAME = "./email-template.ejs";

const sesClient = new SESClient({ region: REGION });
const sendEmailCommand = new SendEmailCommand({
  Destination: {
    ToAddresses: [TO_ADDRESS],
  },
  Message: {
    /* required */
    Body: {
      /* required */
      Html: {
        Charset: "UTF-8",
        Data: "HTML_FORMAT_BODY", // TODO: function to create HTML body
      },
      Text: {
        Charset: "UTF-8",
        Data: "TEXT_FORMAT_BODY", // TODO: function to create test body
      },
    },
    Subject: {
      Charset: "UTF-8",
      Data: EMAIL_SUBJECT,
    },
  },
  Source: FROM_ADDRESS,
});

async function getHtmlBody(companies) {
  const renderFileWithPromise = (fileName, data, options) => {
    return new Promise((resolve, reject) => {
      renderFile(fileName, data, options, (err, str) => {
        if (err) reject(err);
        resolve(str);
      });
    });
  };

  const htmlString = await renderFileWithPromise(
    EMAIL_TEMPLATE_FILENAME,
    { companies },
    { rmWhiteSpace: true }
  );

  console.log(htmlString);

  return htmlString;
}


// Testing
const companies = [
  {
    companyName: 'Schrodinger',
    newJobs: [
      {
        title: "boosdf",
        locations: "nyc, ny; tampa, FL",
        url: "google.com"
      }
    ],
    removedJobs: [
      {
        title: "aaaa",
        locations: "aaa, ny; taaaa FL",
        url: "google.com"
      }
    ]
  },
  {
    companyName: 'Google',
    newJobs: [
      {
        title: "boossdf",
        locations: "nyc, ny; tampa, FL",
        url: "google.com"
      },
      {
        title: "bsdf",
        locations: "nyc, ny",
        url: "google.com"
      }
    ],
    removedJobs: [
      {
        title: "aaaa",
        locations: "aaa, ny; taaaa FL",
        url: "google.com"
      }
    ]
  }
]

getHtmlBody(companies)