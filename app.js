const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "moviesData.db");
let db = null;

const intializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost/3000");
    });
  } catch (e) {
    console.log(`${e.message}`);
    process.exit(1);
  }
};

intializeDBandServer();

const convertMovieDbObjectToResponseObject = (movieDbObj) => {
  return {
    movieId: movieDbObj.movie_id,
    directorId: movieDbObj.director_id,
    movieName: movieDbObj.movie_name,
    leadActor: movieDbObj.lead_actor,
  };
};

const convertdirectorDbObjectToResponseObject = (dirDbObj) => {
  return {
    directorId: dirDbObj.director_id,
    directorName: dirDbObj.director_name,
  };
};

//Get request
app.get("/movies/", async (request, response) => {
  const allMovies = `select * from movie`;
  const movies = await db.all(allMovies);
  response.send(
    movies.map((eachMovie) => convertMovieDbObjectToResponseObject(eachMovie))
  );
});

//post request
app.post("/movies/", async (request, response) => {
  const movie = request.body;
  console.log(movie);
  const { directorId, movieName, leadActor } = movie;
  const insertMovie = `insert into movie
    (director_id,movie_name,lead_actor)
    values(${directorId},'${movieName}','${leadActor}')`;
  await db.run(insertMovie);
  response.send("Movie Successfully Added");
});

//Get request
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `select * from movie where movie_id=${movieId}`;
  let movie = await db.get(getMovie);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

//Put request
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movie = request.body;
  const { directorId, movieName, leadActor } = movie;

  const updateMovie = `update movie 
    set
    director_id=${directorId},
    movie_name='${moviename}',
    lead_actor='${leadActor}'
    where movie_id=${movieId}`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//delete request
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemovie = `delete from movie where movie_id=${movieId}`;
  await db.run(deletemovie);
  response.send("Movie Removed");
});

//Get request
app.get("/directors/", async (request, response) => {
  const allDirectors = `select * from director`;
  const directors = await db.all(allDirectors);
  response.send(
    directors.map((eachDirector) =>
      convertdirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

//Get Request
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirMovies = `select * from movie where director_id=${directorId}`;
  const movies = await db.all(getDirMovies);
  response.send(
    movies.map((eachMovie) => convertMovieDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
