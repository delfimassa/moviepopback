const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Review', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false,
      primaryKey:true,
    },
    movieId:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    content:{
      type: DataTypes.STRING,
      //un maximo de caracteres
    }
    // authoruser: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    //LA CLAVE FORANE LA APLICA SEQ AUTOM CUANDO HAGO LA RELACION, CAMBIAR NOMBRE??
  });
};
