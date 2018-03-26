/**
 * Created by annae on 20.03.2018.
 */
module.exports = (Sequelize, sequelize) => {
    return sequelize.define('users', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        email: Sequelize.STRING,
        password: Sequelize.STRING,
        codes: Sequelize.STRING
    });
};
