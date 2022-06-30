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
  console.log("urlApiMovies: ", urlApiMovies);

  await urlApiMovies.data.map((e) => {
    let movieImage = "";
    if (e.show.image !== null) {
      movieImage = e.show.image.medium;
    } else {
      movieImage = " ";
    }
    apiInfoMovies.push({
      id: e.show.id,
      name: e.show.name,
      image: movieImage,
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
    console.log("searchResults: ", searchResults.data);
    let cleanResults = [];
    await searchResults.data.map((e) => {
      let movieImage = "";
      if (e.show.image !== null) {
        movieImage = e.show.image.medium;
      } else {
        movieImage = " ";
      }
      cleanResults.push({
        id: e.show.id,
        name: e.show.name,
        image: movieImage,
      });
    });
    console.log("cleanResults: ", cleanResults);
    cleanResults.length
      ? res.send(cleanResults)
      : res.send("Couln't find any movies/shows with that name :(");
  } else {
    res.send(allMovies);
  }
});

/////////////////////GET MOVIE DETAIL BY ID//////////////////
async function getMovieByID(id) {
  try {
    let movie = await axios.get(`https://api.tvmaze.com/shows/${id}`);
    console.log("movie", movie);
    let movieImage = "";
    if (movie.data.image !== null) {
      movieImage = movie.data.image.original;
    } else {
      movieImage = " ";
    }
    return {
      id: movie.data.id,
      name: movie.data.name,
      language: movie.data.language ? movie.data.language : " ",
      genres: movie.data.genres ? movie.data.genres : [" "], //es un array de strings
      launching: movie.data.premiered ? movie.data.premiered : " ",
      image: movieImage,
      summary: movie.data.summary ? movie.data.summary : " ",
      rating: movie.data.rating.average ? movie.data.rating.average : 0,
      //LAS REVIEEEEEWS
    };
  } catch (err) {
    return "getMOvieByID did not work  :(", err;
  }
}
router.get("/movies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let movieapi = await getMovieByID(id);
    if (movieapi) res.status(200).send(movieapi);
  } catch (err) {
    res.status(404).send("MOVIE NOT FOUND");
  }
});

/////////////////////////GET MOVIE REVIEWS////////////////////////
// async function getMovieReviews(id) {
//   try {
//     let review = await Review.findAll({ where: { name: id } });
//     return {
//       content: review.content,
//       author: review.authorUser,
//     };
//   } catch (err) {
//     return [];
//   }
// }
// router.get("/moviereviews/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     let movieReviews = await getMovieReviews(id);
//     if (movieReviews) res.status(200).send(movieReviews);
//   } catch (err) {
//     res.status(404).send("This movie doesn't have any reviews yet");
//   }
// });

// ////////////////////POST REVIEW///////////////////
// router.post("/moviereview/:id", async (req, res) => {
//     let movieId = req.params.id;
//   try {
//     let { authorUser, content, movieId } = req.body;
//     console.log(req.body);
//     let createdReview = await Review.create({
//       authorUser,
//       content,
//       movieId,
//     });
//     res.json({ message: "Review creado con exito", createdReview });
//   } catch (error) {
//     res.send("Hubo un problema al publicar esta review", error);
//   }
// });

/////////////////////POST USER////////////////////
router.post("/users", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    console.log("////////POST req.body: ", req.body);

    const userCheck = await User.findAll({
      where: { 
        [Op.or]: [{username: username}, {email:email}]}, 
     
    });
    console.log("/////POST userCheck:", userCheck); 
    if (userCheck.length > 0) {
      res.status(404).json({ message: "Ya existe un usuario con ese nombre o email", userCheck });
    } else {
      const newUser = await User.create({
        username: username,
        email: email,
        password: password
      });
      res.status(200).json({ message: "Usuario creado con exito", newUser });

    }
  } catch (error) {
    res.status(error).send(req.body);
  }
});

// GET USERS
const getDbUsers = async () => {
  const dbUsers = await User.findAll();
  console.log("dbUsers: ", dbUsers); 
  const dbData = await dbUsers.map((e) => {
    return {
      id: e.id,
      username: e.username,
      email: e.email,
      password: e.password,
    };
  });
  console.log("dbData desde la  funcion", dbData)
  return dbData;
};

router.get("/users", async(req, res)=>{
  let allUsers = await getDbUsers();
  console.log("///////////allUsers: ", allUsers)
  if(allUsers){
    res.status(200).send(allUsers);
  }else{
    res.status(404).send("no users found")
  }
})

//POST FAVMOVIE
//DELETE FAVMOVIE

module.exports = router;
