/**
 * Created by annae on 02.03.2018.
 */
module.exports = (Sequelize, config) => {
    const sequelize = new Sequelize(config.db.name,
        config.db.user, config.db.password, {
            host: config.db.host,
            dialect: config.db.dialect,
            define: config.db.define
        });
    const User = require('../models/User')(Sequelize, sequelize);

    return {
        users: User,
        sequelize,
        Sequelize
    };
};