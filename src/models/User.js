const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('User', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false,
      primaryKey:true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true,
    },
    email:{
      type: DataTypes.STRING,
      allowNull: false,
      unique:true,
      
    },
    password: {
        type: DataTypes.STRING,
      allowNull: false,
    },
    // favmovies:{
    //   type: DataTypes.ARRAY(DataTypes.STRING),
    //   allowNull: true,
    // },
    // avatar:{
    //   type: DataTypes.TEXT,
    //   defaultValue:"https://www.google.com/imgres?imgurl=https%3A%2F%2Fmedia.wired.com%2Fphotos%2F603847ccf322ee1eea0074d1%2F4%3A3%2Fw_1800%2Ch_1350%2Cc_limit%2Fwired-games-coding-blackness.jpg&imgrefurl=https%3A%2F%2Fwww.wired.com%2Fstory%2Fblack-character-history-video-games%2F&tbnid=Ffj0_zIYx0QVWM&vet=12ahUKEwimgabW9bP0AhWLOLkGHfmGAOcQMygMegUIARDFAQ..i&docid=tIKwIsgQGIrVOM&w=1800&h=1350&itg=1&q=video%20games&ved=2ahUKEwimgabW9bP0AhWLOLkGHfmGAOcQMygMegUIARDFAQ",
    // },
  });
};
