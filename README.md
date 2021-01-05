# Trakt to Letterboxd importer
This web application was created to help import users' movie data from their [Trakt.tv](https://trakt.tv/dashboard) accounts to their [Letterboxd](https://letterboxd.com/) accounts (it's me, I'm users). 

## Purpose
This application is only useful if you have Trakt and Letterboxd accounts and need data to be migrated from Trakt to Letterboxd. 

Letterboxd currently only supports importing data from a CSV file so this app functions as a user interface for generating that CSV file from your Trakt account. Once the Letterboxd API becomes publicly available I will update the app to support Lettrboxd integration.

If a user has already logged some movies, there may be duplicate entries. Once you import the bulk of your data from Trakt onto Letterboxd, you should then keep your Letterboxd data up-to-date and avoid using the importer again. Additionally, you can specify a date range when exporting data from Trakt to try and avoid overwriting data when importing to Letterboxd.

## Running the app

### Dependencies
You will need Node.js and npm installed to run this app. Once installed, clone the repository and install its dependencies by running `npm install` on the home directory.
To use the app you will need Trakt and Letterboxd accounts. Your Trakt account should have some movie data that your Letterboxd account is missing.

### Using your own credentials
You will need to get your own API key from Trakt. To do so, you must [create a new Trakt API app](https://trakt.tv/oauth/applications/new). This will require you to input a callback URL. Once you have generated your key, create a `config.js` file on the main directory and add the following structure: 

```javascript
module.exports = {
    CLIENT_ID: YOUR_TRAKT_KEY,
    CLIENT_SECRET: YOUR_TRAKT_SECRET,
    CALLBACK_URL: YOUR_CALLBACK_URL
};
```

This file is ignored by git as you shouldn't be sharing your key or secret publicly. The application can also pick from environmental variables if you are hosting on a cloud platform such as Heroku.

In order to run the app, open the main directory, and run the start script:

    npm start

The app is now running on http://localhost:3000.

## References
* [Importing your data · Letterboxd](https://letterboxd.com/about/importing-data/)
* [Trakt API · Apiary](https://trakt.docs.apiary.io/#)


## Addendum
Follow me on [Trakt](https://trakt.tv/users/stiefels) and [Letterboxd](https://letterboxd.com/olina/) ☺️

<br />

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y225QO7)
