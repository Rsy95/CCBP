const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

const databasePath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      fileName: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`Db Error: ${error.message} `);
  }
};

initializeDbAndServer();

const convertObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT 
        *
    FROM 
        movie`;
  const moviesArray = await database.all(getMovieQuery);
  response.send(
    moviesArray.map((eachMovie) => convertObjectToResponseObject(eachMovie))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      * 
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name , lead_actor)
  VALUES
    ('${directorId}', ${movieName}, '${leadActor}');`;
  const movie = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
  UPDATE
    movie
  SET
    director_id = '${directorId}',
    movie_name = ${movieName},
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};`;

  await database.run(updateMovieQuery);
  response.send("Movie Details Upd");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});
module.exports = app;
