require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs'); //
const path = require('path');//
const {
  DB_USER, DB_PASSWORD, DB_HOST,
} = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/moviepop`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { User, Reviews } = sequelize.models;

// relaciones
// The A.hasMany(B) association means that a One-To-Many relationship exists between A and B, with the foreign key being defined in the target model (B).
// Movie.hasMany(Review); //ESTO YA NO IRIA PORQUE VUELA EL MODELO MOVIE
//Review.belongsTo(Movie); //YA NO VA
// User.hasMany(Review, { onDelete: "cascade"}); 
// Review.belongsTo(User, {foreignKey: {allowNull: false}});
// User.hasMany(Review, {
//   foreignKey: 'authorUser'
// }); 
// Review.belongsTo(User);
User.hasMany(Reviews, {
  onDelete: "cascade"
});
Reviews.belongsTo(User, {
  foreignKey: {
    allowNull: false
  }
})
//no habria que usar el through en User en vez de eso de foreighn key?

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};
