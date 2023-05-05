const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("Server Running at http://localhost:4000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//Get all Movie names
app.get("/movies/", async (request, response) => {
  const getMovieListQuery = `
    select 
      movie_name
    from 
    movie;`;
  const ListOfMovie = await db.all(getMovieListQuery);
  response.send(
    ListOfMovie.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

// post a movie in to movies table
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const AddMovieQuery = `
  insert into 
  movie(director_id,movie_name,lead_actor)
  values 
  (
      '${directorId}',
      '${movieName}',
      '${leadActor}'
  );`;
  await db.run(AddMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movie_id/", async (request, response) => {
  const { movie_id } = request.params;

  const GetMovieQuery = `
    select 
    *
    from 
    movie
    where
    movie_id = ${movie_id};`;
  const movie = await db.get(GetMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//API 4
app.put("/movies/:movie_id/", async (request, response) => {
  const { movie_id } = request.params;
  const movie_details = request.body;
  const { directorId, movieName, leadActor } = movie_details;
  const UpdateMovieQuery = `
    UPDATE 
    movie
    SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movie_id};
    `;
  await db.run(UpdateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movie_id/", async (request, response) => {
  const { movie_id } = request.params;

  const DeleteMovieQuery = `
    DELETE FROM
    movie
    WHERE 
    movie_id  = ${movie_id};`;
  await db.run(DeleteMovieQuery);
  response.send("Movie Removed");
});

//API 6 (get Directors from director table)
app.get("/directors/", async (request, response) => {
  const GetDirectorsQuery = `
    SELECT
    *
    FROM
    director
    ;`;
  const directors = await db.all(GetDirectorsQuery);
  response.send(
    directors.map((each_director) =>
      convertDbObjectToResponseObject(each_director)
    )
  );
});

///API 7
app.get("/directors/:director_id/movies/", async (request, response) => {
  const { director_id } = request.params;

  const getMovieOfDirectorQuery = `
   SELECT
   movie_name
   FROM 
   movie
   WHERE
   director_id = ${director_id};`;
  const DirectorMovies = await db.all(getMovieOfDirectorQuery);
  response.send(
    DirectorMovies.map((each_movie) =>
      convertDbObjectToResponseObject(each_movie)
    )
  );
});

module.exports = app;
