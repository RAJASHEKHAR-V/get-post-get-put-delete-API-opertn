const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const Sql_Query = `SELECT * FROM cricket_team`;
  const list_of_all_players = await db.all(Sql_Query);
  const arrayOfPlayers = [];
  for (let eachObject of list_of_all_players) {
    arrayOfPlayers.push(convertDbObjectToResponseObject(eachObject));
  }
  response.send(arrayOfPlayers);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addQuery = `
    INSERT INTO
      cricket_team (player_name, jersey_number, role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}'
      );`;
  const dbResponse = await db.run(addQuery);
  const id = dbResponse.lastId;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `
    SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const details_of_particular_player = await db.get(getQuery);
  response.send(convertDbObjectToResponseObject(details_of_particular_player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = updatePlayerDetails;
  const updateQuery = `
    UPDATE
    cricket_team
    SET
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE player_id=${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE
    FROM cricket_team
    WHERE player_id=${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
