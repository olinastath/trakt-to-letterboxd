/**
 * This helper does the heavy lifting of getting all the data from Trakt and generating the output CSV file.
 */

const trakt = require('./trakt-api'); // import API wrapper in helpers folder
const CsvBuilder = require('csv-builder');
const fs = require('fs');

/**
 * Movie object constructor/schema with required Letterboxd properties 
 * @param {string} imdbID imdb.com ID value
 * @param {string} tmdbID themoviedb.org ID value
 * @param {string} title movie title
 * @param {string} year movie release year
 * @param {string} watchedDate date movie was watched on (yyyy-MM-dd)
 * @param {string} rating10 rating (if available) on 1-10 scale
 * @param {boolean} rewatch denotes if this logged instance of the movie was a rewatch, defaults to false
 */
function Movie(imdbID, tmdbID, title, year, watchedDate, rating, rewatch = false) {
    this.imdbID = imdbID;
    this.tmdbID = tmdbID;
    this.title = title;
    this.year = year;
    this.watchedDate = watchedDate;
    this.rating10 = rating;
    this.rewatch = rewatch;
}

const options = {
    // headers for the output CSV file, refer to: https://letterboxd.com/about/importing-data/
    headers: ['imdbID', 'tmdbID', 'Title', 'Year', 'WatchedDate', 'Rating10', 'Rewatch'],
    // aliases to map Movie properties to headers
    alias: {
        'Title': 'title',
        'Year': 'year',
        'WatchedDate': 'watchedDate',
        'Rating10': 'rating',
        'Rewatch': 'rewatch'
      }
};
// CsvBuilder instance we'll use to write and export data
const builder = new CsvBuilder(options);

/**
 * Method that gathers a user's movie data from Trakt API and compiles it in completeMovieList array.
 * @param {string} userId user whose movie data we are fetching
 * @param {string} startDate beginning date for range in ISO format (yyyy-MM-dd)
 * @param {string} endDate ending date for range in ISO format (yyyy-MM-dd)
 */
function fetchData(userId, startDate, endDate) {
    const completeMovieList = [];   // array to store complete list of movies (includes rewatches)
    const traktIdToMovieMap = {};   // map to store unique movies using their Trakt ID as key
    const multiplePlays = [];       // array to store Trakt IDs of movies with multiple plays (rewatches)

    return new Promise((resolve) => {
        trakt.getWatchedMovies(userId, (watched) => {
            watched.forEach(entry => {
                let movie = new Movie(entry.movie.ids.imdb, entry.movie.ids.tmdb, entry.movie.title, entry.movie.year, 
                    entry.plays === 1 ? entry.last_watched_at.split('T')[0] : '', '');
                traktIdToMovieMap[entry.movie.ids.trakt] = movie;
                if (entry.plays > 1) multiplePlays.push(entry.movie.ids.trakt.toString());
            });

            trakt.getRatings(userId, (ratings) => {
                ratings.forEach(entry => {
                    let movieId = entry.movie.ids.trakt;
                    if (traktIdToMovieMap[movieId]) traktIdToMovieMap[movieId].rating10 = entry.rating;
                });

                let historyPromises = [];
                for (let movieId in traktIdToMovieMap) {
                    if (multiplePlays.includes(movieId)) {
                        let movie = traktIdToMovieMap[movieId];
                        
                        historyPromises.push(new Promise((resolve) => {
                            trakt.getHistory(userId, movieId, startDate, endDate, (history) => {
                                history.forEach((entry, i) => {
                                    completeMovieList.push(
                                        new Movie(movie.imdbID, movie.tmdbID, movie.title, movie.year, 
                                            entry.watched_at.split('T')[0], 
                                            movie.rating10, i < (history.length - 1))
                                    );
                                });

                                resolve();
                            });
                        }));
                    } else {
                        completeMovieList.push(traktIdToMovieMap[movieId]);
                    }
                }

                Promise.all(historyPromises).then(() => resolve(completeMovieList));
            });
        });
    });
}

/**
 * Method to generate and return CSV file containing user's movie data.
 * @param {string} userId user for whom to generate CSV file with movie data
 * @param {string} startDate (optional) beginning date for range in ISO format (yyyy-MM-dd)
 * @param {string} endDate (optional) ending date for range in ISO format (yyyy-MM-dd)
 */
function generateCsvFile(userId, startDate = null, endDate = null) {
    return new Promise((resolve) => {
        fetchData(userId, startDate, endDate).then((movieList) => {
            console.log(movieList.length);

            let stream = fs.createWriteStream('output.csv');
            builder.createReadStream(movieList).pipe(stream);
            resolve();
        });
    });
}

module.exports = {
    generateCsvFile: generateCsvFile
}