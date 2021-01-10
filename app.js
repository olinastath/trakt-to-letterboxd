const express = require('express');
const path = require('path');
const fs = require('fs');
const processor = require('./helpers/data-processor');
var session = require('express-session');
const config = fs.existsSync('./config.js') ? require('./config') : process.env;

const app = express();

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(session({secret: config.CLIENT_SECRET, saveUninitialized: false, resave: false}));

function handleError(err, req, res) {
	if (err.response) req.session.error = { status: err.response.status, statusText: err.response.statusText};
	res.redirect('/');
}

/**
 * Landing page, render index.hbs view.
 */
app.get('/', (req, res) => {
	if (req.session.error) {
		res.render('index', {error: req.session.error.status});
		req.session.error = null;
	} else {
		res.render('index');
	}
});

/**
 * API endpoint that returns movie data in JSON form
 */
app.get('/fetch-data', (req, res) => {
	processor.fetchData(req.query.username, req.query.startDate, req.query.endDate)
		.then(data => res.json(data))
		.catch(err => res.json({error: {status: err.response.status, statusText: err.response.statusText}}));
});

/**
 * Generates and sends CSV file with user's movie data for download.
 */
app.get('/download', (req, res) => {
	processor.generateCsvFile(req.query.username, req.query.startDate, req.query.endDate)
		.then((data) => {
			req.session.error = null;
			if (data.zip) {
				processor.generateZipFile(data.filename).then(zipFilePath => {
					res.download(zipFilePath);
				}).catch((err) => handleError(err, req, res));
			} else {
				res.download(path.join(__dirname, data.filename), data.filename);
			}
		}).catch((err) => handleError(err, req, res));
});

/**
 * All unregistered paths should redirect to main page.
 */
app.get('*', function (req, res) {
	res.redirect('/');
});

app.listen(process.env.PORT || 3000);
