const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve your CSS files and Bootstrap from 'public' directory

// Serve survey form
app.get('/survey', (req, res) => {
  res.sendFile(__dirname + 'public/index.html');
});

// Process survey form submission
app.post('/submit-survey', (req, res) => {
  const surveyData = req.body;
  // Save survey data to a file or a database
  fs.writeFile('survey-results.json', JSON.stringify(surveyData), (err) => {
    if (err) throw err;
    console.log('Survey data saved.');
  });
  res.redirect('/index.html'); // Redirect to a thank-you page
});

// Serve results page
app.get('/results', (req, res) => {
  // Read the survey results from file or database
  fs.readFile('survey-results.json', (err, data) => {
    if (err) throw err;
    const results = JSON.parse(data);
    res.json(results); // Send results to the client
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
