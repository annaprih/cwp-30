/**
 * Created by annae on 20.03.2018.
 */
const Sequelize = require("sequelize");
const config = require("./config.json");
const db = require("./context/db")(Sequelize, config);
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secret = "secret";
const path = require("path");
const usersService = require("./services/UsersService")(db.users);

const port = 8000;
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function isTokenValide(token) {
    try{
        if (token && jwt.verify(token, "secret")) {
            return true;
        } else {
            return false;
        }
    } catch(ex){
        return false;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


app.get("/login", function (req, res) {
    res.cookie("callback", req.query.callback);
    res.cookie("source", req.query.source);
    if (isTokenValide(req.cookies["__sso_token"])) {
        res.redirect("http://" + req.query.callback);
    } else {
        res.sendFile(path.join(__dirname + "/forms/index.html"));
    }
});

app.post("/login", async function (req, res) {
    const userId = await usersService.checkUser(
        req.body.login,
        req.body.password
    );

    if (!userId) {
        res.json({"404": "Not found"});
    } else {
        const code = getRandomInt(1, 5);
        const token = jwt.sign({"id": userId}, secret, {expiresIn: 5 * 60});
        res.redirect(
            `/codes?source=${req.cookies["source"]}&token=${token}&code=${code}`
        );
    }
});

app.get("/codes", function (req, res) {
    res.cookie("code", req.query.code);
    res.cookie("temptoken", req.query.token);
    res.sendFile(path.join(__dirname + "/forms/codes.html"));
});

app.post("/codes", async function (req, res) {
    const token = req.cookies["temptoken"];
    let decoded = jwt.verify(token, "secret");

    let user = await usersService.read(decoded.id);
    let codes = JSON.parse(user.codes);

    const shouldBeCode = codes[parseInt(req.cookies["code"]) - 1];

    if (shouldBeCode == req.body.code) {
        let signedCookie = jwt.sign({"id": decoded.id}, secret, {expiresIn: 30 * 60});
        res.cookie("__sso_token", signedCookie);
        res.redirect(`http://${req.cookies["callback"]}?token=${signedCookie}&source=${req.cookies["source"]}`);
    } else {
        res.json({error: "input code is incorrect"});
    }
});

app.listen(port, async () => {
    await db.sequelize.sync();
    console.log("Running on port " + port)
});

