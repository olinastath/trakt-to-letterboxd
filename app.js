const express = require('express');
const path = require('path');
const processor = require('./helpers/data-processor');

const app = express();

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
    .catch(err => console.log(err));
});

/**
 * All unregistered paths should redirect to main page.
 */
app.get('*', function (req, res) {
	res.redirect('/');
});

app.listen(process.env.PORT || 3000);
