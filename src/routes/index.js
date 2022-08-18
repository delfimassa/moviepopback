const { Op, where } = require("sequelize");
const { Router } = require("express");
const axios = require("axios");
const { Reviews, User, conn } = require("../db");
const router = Router();

//////////////////////GET ALL MOVIES TO SHOW @ HOME///////////////////
const getApiInfo = async () => {
  const apiInfoMovies = [];
  const urlApiMovies = await axios.get(`http://api.tvmaze.com/shows`);
  console.log("urlApiMovies: ", urlApiMovies);

  await urlApiMovies.data.map((e) => {
    let movieImage = "";
    if (e.image !== null) {
      movieImage = e.image.medium;
    } else {
      movieImage = " ";
    }
    apiInfoMovies.push({
      id: e.id,
      name: e.name,
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
    let movieReviews = getMovieReviews(id);
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
      // reviews: movieReviews
    };
  } catch (err) {
    return "getMOvieByID did not work  :(", err;
  }
}

async function getMovieReviews(id){
try{
  let movieReviews = await Reviews.findAll({where:{movieId: id}});
  let movieReviewsOpen = await movieReviews.map((e) => {
    return {
      content: e.content,
      UserId: e.UserId,
    };
  });
  console.log("movieReviews desde getMovieReviews:" + movieReviewsOpen);
  return movieReviewsOpen;
}catch(err){
  return "getMovieReviews did not work", err;
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

/////////////////POST USERS | REGISTROOOOO////////////////////
// Recibe la info del usuario a registrar, chequea que no exista ya ese main o username en la db y devuelve al info para el registro fallido o exitoso segun corresponda
router.post("/users", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    console.log("////////POST req.body: ", req.body);

    const userCheck = await User.findAll({
      where: {
        [Op.or]: [{ username: username }, { email: email }],
      },
    });
    console.log("/////POST userCheck:", userCheck.dataValues);
    if (userCheck.length > 0) {
      res.status(404).json({
        message: "Ya existe un usuario con ese nombre o email",
        userCheck,
      });
    } else {
      const newUser = await User.create({
        username: username,
        email: email,
        password: password,
      });
      res.status(200).json({ message: "Usuario creado con exito", newUser });
    }
  } catch (error) {
    res.status(error).send(req.body);
  }
});

//////////////////GET ALL USERS Y GET(SEARCH) USER BY NAME//////////////////
// responder con allUsers me sirve mas que nada en desarrolllo para chequear desde postman
//Si llega un nombre por query sirve para devolver la info de usuario (se supone que ya logueado) al front
const getAllUsers = async () => {
  const dbUsers = await User.findAll({ include: [{ model: Reviews }] });
  return dbUsers;
  // console.log("dbUsers: ", dbUsers);
  // const dbData = await dbUsers.map((e) => {
  //   return {
  //     id: e.id,
  //     username: e.username,
  //     email: e.email,
  //     password: e.password,
  //   };
  // });
  // console.log("dbData desde la  funcion", dbData);
  // return dbData;
};

router.get("/users", async (req, res) => {
  const { email } = req.query;
  let allUsers = await getAllUsers();
  if (email) {
    let searchResults = await User.findByPk(email);
    if (searchResults !== null) {
      console.log("searchResults: ", searchResults.data);
      res.send(searchResults);
    }
  } else {
    if (allUsers) {
      res.status(200).send(allUsers);
    } else {
      res.status(404).send("no users found");
    }
  }
});

//////////////////////////////LOG IN ////////////////////////////////////////
//ESTE POSTEO NO ES PARA GUARDAR EN LA DB, SOLO ES PARA RECIBIR DESDE EL FRONT EL USUARIO QUE SE ESTA QUERIENDO LOGUEAR
//Busca el usuario
//   si existe, compara contraseñas
//       si no es correcta, envia el mje de que no es correcta la contra
//       si esta correcta, envia info para logueo exitoso
//   si no existe, envia que no existe el usuario
router.post("/user", async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log("///////POST-LOGIN req.body: ", req.body);
    const userCheck = await User.findByPk(email);

    if (userCheck !== null) {
      console.log("/////POST-LOGIN userCheck:", userCheck.dataValues);
      if (userCheck.dataValues.password !== password) {
        res.status(404).json({ message: "Contraseña incorrecta", userCheck });
      }
      if (userCheck.dataValues.password === password) {
        res.status(200).json({ message: "Login exitoso", userCheck });
      }
    } else {
      res
        .status(404)
        .json({ message: "No existe un usuario con ese email", userCheck });
    }
  } catch (error) {
    res.status(error).send(req.body);
  }
});

////////////////////POST REVIEW///////////////////
router.post("/moviereview", async (req, res) => {
  try {
    let { UserId, content, movieId } = req.body;
    console.log(req.body);
    let createdReview = await Reviews.create({
      UserId,
      content,
      movieId,
    });
    res.json({ message: "Review publicada con exito", createdReview });
  } catch (error) {
    res.send("Hubo un problema al publicar esta review", error);
  }
});

////////////GET REVIEWS PARA POSTMAN//////////////
const getAllReviews = async () => {
  try {
    const reviews = await Reviews.findAll();
    return reviews;
  } catch (err) {
    res.status(404).send("reviews NOT FOUND");
  }
};

router.get("/moviereviews", async (req, res) => {
  try {
    let allReviews = await getAllReviews();
    res.status(200).send(allReviews);
  } catch (err) {
    res.status(404).send("no reviews found");
  }
});

//POST FAVMOVIE
//DELETE FAVMOVIE

module.exports = router;
