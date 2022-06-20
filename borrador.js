// router.get("/movies", async (req, res) => {
//   let allMovies = await getApiInfo();
//   res.send(allMovies);
// });



// async function getMovieByName(name) {
//   try {
//     let movieSearchResult = await axios.get(
//       `https://api.tvmaze.com/search/shows?q=${name}`
//     );
//     console.log(movieSearchResult.data);
//     let homeData = await movieSearchResult.data.map((e) => {
//       return {
//         id: e.show.id,
//         name: e.show.name,
//         image: e.show.image,
//       };
//     });
//     return homeData;
//   } catch (err) {
//     console.log(err, "didnt get results form api");
//   }
// }

// router.get("/movies/:name", async (req, res) => {
//   const name = req.params.name;
// //   let allMovies = await getApiInfo();
//   if (name) {
//     let resultsByName = await getMovieByName(name);
//     resultsByName.length ? res.send(resultsByName) : res.send("not found");
//   } else {
//     res.send("didn't get a name to search");
//   }
// });