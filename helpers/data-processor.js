/**
 * This helper does the heavy lifting of getting all the data from Trakt and generating the output CSV file.
 */

const trakt = require('./trakt-api'); // import API wrapper in helpers folder
const CsvWriter = require('csv-writer').createObjectCsvWriter;

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
    header: [
      {id: 'imdbID', title: 'imdbID'},
      {id: 'tmdbID', title: 'tmdbID'},
      {id: 'title', title: 'Title'},
      {id: 'year', title: 'Year'},
      {id: 'watchedDate', title: 'WatchedDate'},
      {id: 'rating10', title: 'Rating10'},
      {id: 'rewatch', title: 'Rewatch'},
    ]
};

/**
 * Method that gathers a user's movie data from Trakt API and compiles it in completeMovieList array.
 * @param {string} userId user whose movie data we are fetching
 * @param {string} startDate beginning date for range in ISO format (yyyy-MM-dd)
 * @param {string} endDate ending date for range in ISO format (yyyy-MM-dd)
 * @returns {Promise} returns promise that passes complete movie data into resolve() method
 */
function fetchData(userId, startDate, endDate) {
    const completeMovieList = [];   // array to store complete list of movies (includes rewatches)
    const traktIdToMovieMap = {};   // map to store unique movies using their Trakt ID as key
    const multiplePlays = [];       // array to store Trakt IDs of movies with multiple plays (rewatches)

    return new Promise((resolve, reject) => {
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
                            }, reject);
                        }));
                    } else {
                        completeMovieList.push(traktIdToMovieMap[movieId]);
                    }
                }

                Promise.all(historyPromises).then(() => resolve(completeMovieList)).catch(err => console.log(err));
            }, reject);
        }, reject);
    });
}

/**
 * Method to generate and return CSV file containing user's movie data.
 * @param {string} userId user for whom to generate CSV file with movie data
 * @param {string} startDate (optional) beginning date for range in ISO format (yyyy-MM-dd)
 * @param {string} endDate (optional) ending date for range in ISO format (yyyy-MM-dd)
 * @returns {Promise} returns promise that passes generated file name into resolve() method
 */
function generateCsvFile(userId, startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
        fetchData(userId, startDate, endDate).then((movieList) => {
            const timestamp = new Date().getTime();
            const fileName = `./output/movie_history_${userId}_${timestamp}`;
            options.path = `${fileName}.csv`;
            const writer = CsvWriter(options);
            writer.writeRecords(movieList).then(() => resolve(options.path)).catch(reject);
        }).catch(reject);
    });
}

module.exports = {
    generateCsvFile: generateCsvFile
}