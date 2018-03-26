const bcrypt = require("bcrypt-nodejs");

let salt = "$2a$10$pwY6mMQriV9vTF148.n1xe";
function UsersService(Users) {
    async function readAll() {
        let elements = await Users.findAndCountAll();
        return {
            users: elements.rows,
            meta: {
                count: elements.count
            }
        };
    }

    function getPass(password) {
        return bcrypt.hashSync(password, salt);
    }

    async function readByLogin(login) {
        const user = await Users.findAll({where: {email: login}, raw: true});
        if (!user) {
            return {error: 404, message: "user not found"};
        } else {
            return {user: user};
        }
    }

    async function checkUser(login, password) {
        password = getPass(password);
        const user = await Users.findAll({
            where: {email: login},
            raw: true,
            limit: 1
        });
        if (user[0] && user[0].password === password) {
            return user[0].id;
        } else {
            return null;
        }
    }

    async function read(id) {
        id = parseInt(id);
        const user = await Users.findById(id, {raw: true});
        if (user === null) {
            return {error: 404, message: "user not found"};
        } else {
            return user;
        }
    }

    async function create(email, password, codes) {
        password = getPass(password);
        const item = await Users.create({
            email: email,
            password: password,
            codes: codes
        });
        return {user: item.get({plaint: true})};
    }

    return {
        readAll,
        read,
        create,
        readByLogin,
        checkUser
    };
}

module.exports = UsersService;
