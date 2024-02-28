const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve your CSS files and Bootstrap from 'public' directory
app.set('view engine', 'ejs'); // Set EJS as the template engine

// Serve survey form
app.get('/survey', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Process survey form submission
app.post('/submit-survey', (req, res) => {
  const surveyData = req.body;

  // Read existing survey results
  fs.readFile('survey-results.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    let existingResults;

    try {
      existingResults = JSON.parse(data) || [];
      if (!Array.isArray(existingResults)) {
        throw new Error('Parsed data is not an array');
      }
    } catch (parseError) {
      console.error('Error parsing existing results JSON:', parseError);
      existingResults = [];
    }

    // Append new survey data
    existingResults.push(surveyData);

    // Save updated survey results to the file
    fs.writeFile('survey-results.json', JSON.stringify(existingResults), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to JSON file:', writeErr);
        res.status(500).send('Internal Server Error');
        return;
      }

      console.log('Survey data saved.');

      // Redirect to the results page (assuming you have a results.ejs file)
      res.redirect('/results');
    });
  });
});



// Serve results page
app.get('/results', (req, res) => {
  // Read the survey results from file
  fs.readFile('survey-results.json', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Parse the JSON data
    const results = JSON.parse(data);

    // Render the results using the EJS template
    res.render('results', { surveyResults: results });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
