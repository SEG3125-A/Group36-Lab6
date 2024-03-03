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

  // Read existing survey analytics
  fs.readFile('survey-analytics.json', 'utf8', (err, data) => {
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

    // Save updated survey results to the analytics file
    fs.writeFile('survey-analytics.json', JSON.stringify(existingResults), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to JSON file:', writeErr);
        res.status(500).send('Internal Server Error');
        return;
      }

      console.log('Survey data saved.');

    });


    // Save updated survey results to the result's file
    fs.writeFile('survey-results.json', JSON.stringify(surveyData), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to JSON file:', writeErr);
        res.status(500).send('Internal Server Error');
        return;
      }

      console.log('Survey data analytics saved.');

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

    let results;
    try {
      // Parse the JSON data
      results = JSON.parse(data);
      if (!Array.isArray(results)) {
        // If results is not an array, wrap it inside an array
        results = [results];
      }
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Render the results using the EJS template
    res.render('results', { surveyResults: results });
  });
});


// Serve analytics' page
app.get('/analytics', (req, res) => {
  // Read the survey analytics from file
  fs.readFile('survey-analytics.json', (err, data) => {
    if (err) {
      console.error('Error reading JSON anakytics file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Parse the JSON data
    const analytics = JSON.parse(data);

    // Render the analytics using the EJS template
    res.render('analytics', { surveyResults: analytics });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
