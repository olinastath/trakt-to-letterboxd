const express = require('express');
const path = require('path');
const alert = require('alert');
const processor = require('./helpers/data-processor');

const app = express();

/**
 * Method to handle API errors and alert user.
 * @param {Error} err error returned from Trakt API
 */
function errorHandler(err, res) {
  let statusCode = err.response.status;
  let alertText = `${statusCode}: ${err.response.statusText}. \n`
  switch(statusCode) {
      case 404:
          alertText += 'Please check username and try again.';
          break;
      case 400: case 401: case 403:
          alertText += 'Bad request, please try again later or contact us to resolve it.';
          break;
      case 500:
          alertText += 'Server error, please try again later or contact us to resolve it.';
          break;
      case 503: case 504: case 520: case 521: case 522:
          alertText += 'Service unavailble, please try again later or contact us to resolve it.';
          break;
      default:
          break;
  }
  
  alert(alertText);
  res.redirect('/');
}


// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/**
 * Landing page, render index.hbs view.
 */
app.get('/', (req, res) => {
    res.render('index');
});

/**
 * Generates and sends CSV file with user's movie data for download.
 */
app.get('/download', async (req, res) => {
  processor.generateCsvFile(req.query.username, req.query.startDate, req.query.endDate)
    .then((filename) => res.download(path.join(__dirname, filename), filename))
    .catch((err) => errorHandler(err, res));
});

/**
 * All unregistered paths should redirect to main page.
 */
app.get('*', function (req, res) {
	res.redirect('/');
});

app.listen(process.env.PORT || 3000);
