/**
 * This helper functions as a wrapper for the Trakt API.
 */

const axios = require('axios');

/**
 * Trakt API config values (ID, secret, redirect URI).
 */
const config = require('../config');

/**
 * Set up Axios instance with required headers and Trakt API base path.
 */
const instance = axios.create({
    baseURL: 'https://api.trakt.tv',
    headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': config.CLIENT_ID
    }
});
  
/**
 * Method to GET a user's watched movies.
 * @param {string} userId user for which to fetch watched movies
 * @param {function} callback function to call on fetch success
 */
let getWatchedMovies = function(userId, callback) {
    instance.get(`/users/${userId}/watched/movies`).then(res => callback(res.data)).catch(err => console.error(err));
}

/**
 * Method to GET a user's ratings.
 * @param {string} userId user for which to fetch ratings
 * @param {function} callback function to call on fetch success
 */
let getRatings = function(userId, callback) {
    instance.get(`/users/${userId}/ratings/movies`).then(res => callback(res.data)).catch(err => console.error(err));
}

/**
 * Method to GET a user's watch history for a specific movie ID. 
 * Can specify startDate and endDate to only get watches within a time range.
 * startDate must be earlier than endDate or the API won't return any results.
 * @param {string} userId user whose movie history to fetch
 * @param {string} movieId movie for which to fetch history
 * @param {string} startDate (optional) beginning date for range in ISO format (yyyy-MM-dd)
 * @param {string} endDate (optional) ending date for range in ISO format (yyyy-MM-dd)
 * @param {function} callback function to call on fetch success
 */
let getHistory = function(userId, movieId, startDate, endDate, callback) {
    let url = `/users/${userId}/history/movies/${movieId}`;
    // construct URL based on whether we want to add startDate and endDate params
    if (startDate || endDate) url += '?'
    if (startDate) url += `start_at={${startDate}}`
    if (startDate && endDate) url += '&'
    if (endDate) url += `end_at={${endDate}}`

    instance.get(url).then(res => callback(res.data)).catch(err => console.error(err));
}

module.exports = {
    getWatchedMovies: getWatchedMovies,
    getRatings: getRatings,
    getHistory: getHistory
}