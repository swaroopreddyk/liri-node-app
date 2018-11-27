require("dotenv").config()
const keys = require('./keys.js')
const fs = require('fs')
const Spotify = require('node-spotify-api')
let axios = require('axios')
var inquirer = require('inquirer')
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const CLI = require('clui')
const Spinner = CLI.Spinner

let space = "\n" //+ "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0"

// Write Data to Log File
const writeToLog = data => {
    fs.appendFile("log.txt", '\r\n\r\n', function (err) {
        if (err) {
            return console.log(error(err))
        }
    });

    fs.appendFile("log.txt", (data), function (err) {
        if (err) {
            return console.log(error(err))
        }
        console.log(info(space + "log.txt was updated!"))
    })
}

// Reads the random text file and passes it to the spotify function
const doWhatItSays = () => {
    fs.readFile("random.txt", "utf8", function (error, data) {
        getMeSpotify(data);
    })
}

//Get song information from Spotify API
const getMeSpotify = songName => {
    const status = new Spinner('Fetching Data from Spotify, please wait...');
    status.start();
    let spotify = new Spotify(keys.spotify);
    // If there is no song name, set the song to Ace of Base's The Sign
    if (!songName) {
        songName = "The Sign By Ace of Base"
    }
    spotify.search({
        type: 'track',
        query: songName
    }, (err, data) => {
        if (err) {
            console.log(error('Error occurred while Spotifying: ' + err))
            writeToLog('Error occurred while Spotifying: ' + err)
            return
        } else {
            output =
                "================================== LIRI FOUND THESE TOP 5 FOR YOU...=================================="
            data.tracks.items.slice(0, 5).forEach(track => {
                output += space + "-".repeat(80) +
                    space + "Song Name: " + "'" + songName.toUpperCase().songTheme + "'" +
                    space + "Album Name: " + track.album.name +
                    space + "Artist Name: " + track.album.artists[0].name +
                    space + "Preview: " + track.album.external_urls.spotify.urlTheme
            });
            status.stop()
            console.log(output)
            writeToLog(output)
        }
    })
}

//Get Movie Information from OMDB API
const getMeMovie = movieName => {
    const status = new Spinner('Fetching Data from Spotify, please wait...');
    status.start();
    if (!movieName) {
        movieName = "Mr Nobody"
    }
    // t = movietitle, y = year, plot is short, then the API key
    let url = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + keys.omdb.key

    axios.get(url).then(response => {
        let movieData = response.data
        console.log(movieData)
        // output = space + header +
        //     space + 'Title: ' + jsonData.Title +
        //     space + 'Year: ' + jsonData.Year +
        //     space + 'Rated: ' + jsonData.Rated +
        //     space + 'IMDB Rating: ' + jsonData.imdbRating +
        //     space + 'Country: ' + jsonData.Country +
        //     space + 'Language: ' + jsonData.Language +
        //     space + 'Plot: ' + jsonData.Plot +
        //     space + 'Actors: ' + jsonData.Actors +
        //     space + 'Tomato Rating: ' + jsonData.Ratings[1].Value +
        //     space + 'IMDb Rating: ' + jsonData.imdbRating + "\n"

        status.stop()
        // console.log(output);
        // writeToLog(output);
    }).catch(err => {
        console.log(error('Error occurred while fetching Movie:' + err))
        writeToLog('Error occurred while fetching Movie:' + err)
        return;
    });
};

let questions = [{
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: ['Spotify', 'Movie', 'Concert', 'Do what it says']
    },
    {
        type: 'input',
        name: 'movieChoice',
        message: 'What\'s the name of the movie you would like?',
        when: answers => {
            return answers.choice === 'Movie'
        }
    },
    {
        type: 'input',
        name: 'songChoice',
        message: 'What\'s the name of the song you would like?',
        when: answers => {
            return answers.choice === 'Spotify'
        }
    },
    {
        type: 'input',
        name: 'concertChoice',
        message: 'What\'s the name of the band you would like?',
        when: answers => {
            return answers.choice === 'Concert'
        }
    }
]

//Display options to the user and decide on a course of action 
const runApp = () => {
    inquirer
        .prompt(questions)
        .then(answers => {
            switch (answers.choice) {
                case 'Spotify':
                    getMeSpotify(answers.songChoice)
                    break
                case 'Movie':
                    getMeMovie(answers.movieChoice)
                    break
                case 'Do what it says':
                    doWhatItSays()
                    break
                case 'Concert':
                    getBandsInfo()
                    break
                default:
                    console.log(warn('LIRI doesn\'t know that'))
            }
        })
}

//App Initialization Function - Displays a header and then starts the options
const initApp = () => {
    clear()
    console.log(
        chalk.blue.bold(
            figlet.textSync('LIRI', {
                horizontalLayout: 'full'
            })
        )
    ) 
    runApp()
}

//Begin Execution of the app
initApp()

//Define Chalk Themes
const error = chalk.bold.red
const info = chalk.bold.cyanBright
const warn = chalk.bold.yellowBright