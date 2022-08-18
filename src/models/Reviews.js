const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Reviews', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false,
      primaryKey:true,
    },
   content:{
      type: DataTypes.STRING,
      // allowNull: false
      //un maximo de caracteres
    }, 
    movieId:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    // authorUser: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    //LA CLAVE FORANE LA APLICA SEQ AUTOM CUANDO HAGO LA RELACION, CAMBIAR NOMBRE??
  });
};
