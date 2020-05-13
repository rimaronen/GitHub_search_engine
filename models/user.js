const Sequelize = require('sequelize');

'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {type: Sequelize.STRING},
    urlLink: {type: Sequelize.STRING},
    nameToLowerCase: {type: Sequelize.STRING}
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};