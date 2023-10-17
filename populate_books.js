const subject = "programming"; // Change this to your desired subject
const startIndex = 10; // Start index of the results
const endIndex = 20; // End index of the results

const fetch = require('node-fetch'); // Import the 'node-fetch' library

// import fetch from 'node-fetch';

const apiUrl = `https://openlibrary.org/subjects/${subject}.json`;

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    // Get the list of works (books) for the subject
    const works = data.works.slice(startIndex, endIndex);

    console.log(`Books on ${subject} (from ${startIndex + 1} to ${endIndex}):`);
    works.forEach((work, index) => {
      console.log(`${startIndex + index + 1}. ${work.title}`);
    });
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
