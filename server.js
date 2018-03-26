/**
 * Created by annae on 20.03.2018.
 */
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const UsersService = require("./services/UsersService");
const Sequelize = require("sequelize");
const config = require("./config.json");
const db = require("./context/db")(Sequelize, config);
const usersService = new UsersService(db.users);


const cookieAuthName = "__service_token";
const port = 7000;

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

async function generateData() {
    for (let i = 0; i < 5; i++) {
        const user = {
            name: "Name" + i,
            password: "Password" + String(i),
            codes: "[12345,54321,44444,21543]"
        };
        await usersService.create(user.name, user.password, user.codes);
    }
}

function isTokenValide(token) {
    try {
        if (token && jwt.verify(token, "secret")) {
            return true;
        } else {
            return false;
        }
    } catch (ex) {
        return false;
    }
}

function getUserIdFromToken(token) {
    try {
        const temp = jwt.verify(token, "secret");
        return parseInt(temp.id);
    } catch (ex) {
        return false;
    }
}

app.get("/protected_resource", async function (req, res) {
    const token = req.cookies[cookieAuthName];
    if (isTokenValide(token)) {
        res.json(await usersService.read(getUserIdFromToken(token)));
    } else {
        res.redirect(
            "http://localhost:8000/login?source=localhost:7000/protected_resource&callback=localhost:7000/token"
        );
    }
});

app.get("/token", function (req, res) {
    res.cookie(cookieAuthName, req.query.token);
    res.redirect("http://" + req.query.source);
});

app.listen(port, async () => {
    await db.sequelize.sync({force: true});
    generateData();
    console.log("Running on port " + port)
});

