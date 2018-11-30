require("dotenv").config()
const keys = require('./keys.js')
const fs = require('fs')
const Spotify = require('node-spotify-api')
let axios = require('axios')
const chalk = require('chalk')
const figlet = require('figlet')
const CLI = require('clui')
const Spinner = CLI.Spinner
const moment = require('moment')

const choice = process.argv[2];
const input = process.argv.slice(3).join(" ");

const divider = "-".repeat(80)

// Write Data to Log File
const writeToLog = data => {
  fs.appendFile("log.txt", '\r\n\r\n', function (err) {
    if (err) {
      return console.log(error(err))
    }
  })

  fs.appendFile("log.txt", (data), function (err) {
    if (err) {
      return console.log(error(err))
    }
    console.log(infoTheme("\n log.txt was updated!"))
  })
}

// Reads the random text file and passes it to the spotify function
const doWhatItSays = () => {
  fs.readFile("random.txt", "utf8", function (error, data) {
    getMeSpotify(data)
  })
}

//Get song information from Spotify API
const getMeSpotify = songName => {
  displayHeader('SPOTIFY')
  const status = new Spinner('Fetching Data from Spotify, please wait...')
  status.start()
  let spotify = new Spotify(keys.spotify)
  // If there is no song name, set the song to Ace of Base's The Sign
  if (!songName) {
    songName = "The Sign By Ace of Base"
  }
  spotify.search({
    type: 'track',
    query: songName
  }, (err, data) => {
    if (err) {
      status.stop()
      console.log(errorTheme('Error occurred while Spotifying: ' + err))
      writeToLog('Error occurred while Spotifying: ' + err)
      return
    } else {
      let output =
        "================================== LIRI FOUND THESE TOP 5 FOR YOU...=================================="
      data.tracks.items.slice(0, 5).forEach(track => {
        output += `\n${divider}\n Song Name: '${dataTheme(songName)}' \nAlbum Name:${track.album.name} \nArtist Name: ${track.album.artists[0].name} \nPreview:${urlTheme(track.album.external_urls.spotify)}`
      })
      status.stop()
      console.log(output)
      writeToLog(output)
    }
  })
}

//Get Movie Information from OMDB API
const getMeMovie = movieName => {
  displayHeader('OMDB')
  const status = new Spinner('Fetching Data from OMDB, please wait...')
  status.start()
  if (!movieName) {
    movieName = "Mr Nobody"
  }
  // t = movietitle, y = year, plot is short, then the API key
  let url = `http://www.omdbapi.com/?t=${movieName}&y=&plot=short&apikey=${keys.omdb.key}`

  axios.get(url).then(response => {
    let movieData = response.data
    let output = `\n${divider}\nTitle: ${dataTheme(movieData.Title)} \nReleased Year: ${movieData.Year} \nIMDB Rating: ${movieData.Ratings[0].Value} \nRotten Tomatoes Score: ${movieData.Ratings[1].Value} \nCountry Where Movie was Produced: ${movieData.Country}  \nLanguage: ${movieData.Language} \nPlot: ${movieData.Plot}  \nCast: ${movieData.Actors} \n${divider}`
    status.stop()
    console.log(output)
    writeToLog(output)
  }).catch(err => {
    status.stop()
    console.log(errorTheme('Error occurred while fetching Movie:' + err))
    writeToLog('Error occurred while fetching Movie:' + err)
    return
  })
}

//Get Bands Info from API
const getBandsInfo = artist => {
  displayHeader('BANDS-IN-TOWN')
  const status = new Spinner('Fetching Data from BandsInTown, please wait...')
  status.start()

  // t = movietitle, y = year, plot is short, then the API key
  let url = `https://rest.bandsintown.com/artists/${artist}/events?app_id=${keys.bands.key}`
  //  console.log(url)
  axios.get(url).then(response => {
    if (!response.data.length) {
      let errResp = `No concerts found!\n ${divider}`
      writeToLog(errResp)
      return console.log(errResp)
    };
    let output =
      "================================== LIRI FOUND THESE EVENTS FOR YOU...=================================="

    response.data.forEach(event => {
      output += `\n${divider}\nVenue: ${event.venue.name} \nLocation: ${event.venue.city}, ${event.venue.region ? event.venue.region : event.venue.country} \nDate: ${moment(event.datetime).format("MM/DD/YYYY")}`
    });

    status.stop()
    console.log(output)
    writeToLog(output)
  }).catch(err => {
    status.stop()
    console.log(errorTheme('Error occurred while fetching Movie:' + err))
    writeToLog('Error occurred while fetching Movie:' + err)
    return
  })
}

//Display options to the user and decide on a course of action 
const runApp = () => {
  switch (choice) {
    case 'spotify-this-song':
      getMeSpotify(input)
      break
    case 'movie-this':
      getMeMovie(input)
      break
    case 'do-what-it-says':
      doWhatItSays()
      break
    case 'concert-this':
      getBandsInfo(input)
      break
    default:
      console.log(chalk.bold.yellow('LIRI doesn\'t know that' + "The following operations are supported:\n" +
        "   * node liri.js concert-this <artist/band name here>\n" +
        "   * node liri.js spotify-this-song '<song name here>'\n" +
        "   * node liri.js movie-this '<movie name here>'\n" +
        "   * node liri.js do-what-it-says"))
  }
}

const displayHeader = headerText => {
  console.log(
    chalk.blue.bold(
      figlet.textSync(headerText, {
        horizontalLayout: 'full'
      })
    )
  )
}

//Begin Execution of the app
runApp()

//Define Chalk Themes
const errorTheme = chalk.bold.red
const infoTheme = chalk.bold.cyanBright
const dataTheme = chalk.bold.cyanBright
const urlTheme = chalk.bold.blue.underline