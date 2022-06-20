const { Op } = require("sequelize");
const { Router } = require("express");
const axios = require("axios");
const { Review, User, conn } = require("../db");
const router = Router();

//////////////////////GET ALL MOVIES TO SHOW @ HOME///////////////////
const getApiInfo = async () => {
  const apiInfoMovies = [];
  const urlApiMovies = await axios.get(
    `http://api.tvmaze.com/search/shows?q=star%20wars.`
  );
  console.log(urlApiMovies);

  await urlApiMovies.data.map((e) => {
    apiInfoMovies.push({
      id: e.show.id,
      name: e.show.name,
      image: e.show.image.medium,
    });
  });
  return apiInfoMovies;
};


//////////////////GET ALL MOVIES Y GET(SEARCH) MOVIE BY NAME//////////////////
router.get("/movies", async (req, res) => {
  const { name } = req.query;
  let allMovies = await getApiInfo();
  
  if (name) {
    let searchResults = await axios.get(
      `https://api.tvmaze.com/search/shows?q=${name}`
    );
    console.log(searchResults);
    let cleanResults = [];
    await searchResults.data.map((e) => {
      cleanResults.push({
        id: e.show.id,
        name: e.show.name,
        image: e.show.image.medium,
      });
    });
    cleanResults.length ? res.send(cleanResults) : res.send("not found");
  } else {
    res.send(allMovies);
  }
});


/////////////////////GET MOVIE DETAIL BY ID//////////////////
async function getMovieByID(id) {
  try {
    let movie = await axios.get(`https://api.tvmaze.com/shows/${id}`);
    return {
      id: movie.id,
      name: movie.name,
      language: movie.language,
      genres: movie.genres.map((el) => el), //es un array de strings
      launching: movie.premiered,
      image: movie.image.original,
      summary: movie.summary,
      rating: movie.rating.average,
      //LAS REVIEEEEEWS
    };
  } catch (err) {
    return [];
  }
}
router.get("/movies/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let movieapi = await getMovieByID(id);
    if (movieapi) res.status(200).send(movieapi);
  } catch (err) {
    res.status(404).send("MOVIE NOT FOUND");
  }
});

/////////////////////////GET MOVIE REVIEWS////////////////////////
async function getMovieReviews(id) {
  try {
    let review = await Review.findAll({ where: { name: id } });
    return {
      content: review.content,
      author: review.authorUser,
    };
  } catch (err) {
    return [];
  }
}
router.get("/moviereviews/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let movieReviews = await getMovieReviews(id);
    if (movieReviews) res.status(200).send(movieReviews);
  } catch (err) {
    res.status(404).send("This movie doesn't have any reviews yet");
  }
});

////////////////////POST REVIEW///////////////////
router.post("/moviereview", async (req, res) => {
  //   let movieId = req.params.id;
  try {
    let { authorUser, content, movieId } = req.body;
    console.log(req.body);
    let createdReview = await Review.create({
      authorUser,
      content,
      movieId,
    });
    res.json({ message: "Review creado con exito", createdReview });
  } catch (error) {
    res.send("Hubo un problema al publicar esta review", error);
  }
});

/////////////////////POST USER////////////////////
// router.post("/user", async (req, res) => {
//         try {
//           let {
//             username,
//             password,
//           } = req.body;
//           console.log(req.body);
//           let createdUser = await User.create({
//             //CHEQUEAR QUE USERNAME NO EXISTA YA EN LA BASE
//             username,
//             password,
//           });
//           res.json({ message: "Usuario creado con exito", createdUser });
//         } catch (error) {
//           res.send("Hubo un problema al crear tu usario", error);
//         }
//       });

//POST FAVMOVIE
//DELETE FAVMOVIE

module.exports = router;
