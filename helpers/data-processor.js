/**
 * This helper does the heavy lifting of getting all the data from Trakt and generating the output .csv file.
 */

const trakt = require('./trakt-api'); // import API wrapper in helpers folder

const completeMovieList = [];   // array to store complete list of movies (includes rewatches)
const traktIdToMovieMap = {};   // map to store unique movies using their Trakt ID as key

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

/**
 * Method that gathers a user's movie data from Trakt API and compiles it in completeMovieList array.
 * @param {string} userId user whose movie data we are fetching
 * @param {string} startDate beginning date for range in ISO format (yyyy-MM-dd)
 * @param {string} endDate ending date for range in ISO format (yyyy-MM-dd)
 */
let populateData = function(userId, startDate, endDate) {
    const multiplePlays = [];
    trakt.getWatchedMovies(userId, (watched) => {
        watched.forEach(entry => {
            let movie = new Movie(entry.movie.ids.imdb, entry.movie.ids.tmdb, entry.movie.title, entry.movie.year, 
                entry.plays === 1 ? entry.last_watched_at.split("T")[0] : '', '');
            traktIdToMovieMap[entry.movie.ids.trakt] = movie;
            if (entry.plays > 1) multiplePlays.push(entry.movie.ids.trakt.toString());
        });

        trakt.getRatings(userId, (ratings) => {
            ratings.forEach(entry => {
                let movieId = entry.movie.ids.trakt;
                if (traktIdToMovieMap[movieId]) traktIdToMovieMap[movieId].rating10 = entry.rating;
            });

            for (let movieId in traktIdToMovieMap) {
                if (multiplePlays.includes(movieId)) {
                    let movie = traktIdToMovieMap[movieId];

                    trakt.getHistory(userId, movieId, startDate, endDate, (history) => {
                        history.forEach((entry, i) => {
                            movie.watchedDate = entry.watched_at.split("T")[0];
                            if (i < (history.length - 1)) movie.rewatch = true;
                            completeMovieList.push(movie);        
                        });


                    });
                } else {
                    completeMovieList.push(traktIdToMovieMap[movieId]);
                }
            }
        })
    });
}

/**
 * Method to generate and return .csv file containing user's movie data.
 * @param {string} userId user for whom to generate .csv file with movie data
 * @param {string} startDate (optional) beginning date for range in ISO format (yyyy-MM-dd)
 * @param {string} endDate (optional) ending date for range in ISO format (yyyy-MM-dd)
 */
let generateCsvFile = function(userId, startDate = null, endDate = null) {
    populateData(userId, startDate, endDate);
}

module.exports = {
    generateCsvFile: generateCsvFile
}