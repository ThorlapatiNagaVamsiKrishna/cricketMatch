const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const databasePath = path.join(__dirname, 'cricketMatchDetails.db')
let matchDatabase = null
app = express()
app.use(express.json())

const intializeAndCreateServer = async () => {
  try {
    matchDatabase = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

intializeAndCreateServer()

//  Returns a list of all the players in the player table

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
    SELECT 
    player_details.player_id as playerId,
    player_name as playerName
    FROM 
    player_details;
    `
  const resultPlayers = await matchDatabase.all(getAllPlayersQuery)
  response.send(resultPlayers)
})

//  Returns a specific player based on the player ID

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getOnePlayersQuery = `
    SELECT 
    player_id as playerId,
    player_name as playerName
    FROM 
    player_details
    WHERE player_id = ${playerId};
    `
  const resultPlayer = await matchDatabase.get(getOnePlayersQuery)
  response.send(resultPlayer)
})

//  Updates the details of a specific player based on the player ID

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updateOnePlayersQuery = `
    UPDATE
    player_details
    SET 
    player_name = '${playerName}'
    WHERE player_id = ${playerId};
    `
  const resultPlayer = await matchDatabase.run(updateOnePlayersQuery)
  response.send('Player Details Updated')
})

//  Returns the match details of a specific match
app.get('/matches/:matchId', async (request, response) => {
  const {matchId} = request.params
  const getOneMatchQuery = `
    SELECT 
    match_id as matchId,
    match,
    year
    FROM 
    match_details
    WHERE match_id = ${matchId};
    `
  const resultMatch = await matchDatabase.get(getOneMatchQuery)
  response.send(resultMatch)
})

// Returns a list of all the matches of a player

app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const getOnePlayersQuery = `
    SELECT 
    match_id as matchId,
    match,
    year
    FROM 
    player_match_score
    NATURAL JOIN 
    match_details
    WHERE player_id = ${playerId};
    `
  const resultPlayer = await matchDatabase.all(getOnePlayersQuery)
  response.send(resultPlayer)
})

//  Returns a list of players of a specific match

app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const getPlayerInMatchQuery = `
  SELECT 
  player_id as playerId,
  player_name as playerName
  FROM player_match_score
  NATURAL JOIN 
  player_details
  WHERE match_id = ${matchId};`
  const resultPlayers = await matchDatabase.all(getPlayerInMatchQuery)
  response.send(resultPlayers)
})

// Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const playerPerformanceStatiticsQuery = `
  SELECT 
  player_details.player_id as playerId,
  player_name as playerName,
  SUM(score) as totalScore,
  SUM(fours) as totalFours,
  SUM(sixes) as totalSixes
  FROM 
  player_match_score
  INNER JOIN 
   player_details 
  ON player_match_score.player_id = player_details.player_id
  WHERE player_details.player_id = ${playerId};`

  const resultStats = await matchDatabase.get(playerPerformanceStatiticsQuery)
  response.send(resultStats)
})
module.exports = app

// 
