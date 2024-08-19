const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt')
const express = require("express");
const path = require("path");
const user = require("./models/user");
const note = require("./models/note");
const jsonWebToken = require("jsonwebtoken");
const session = require("express-session");
const app = express();
const PORT = 5000;


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'knox' + Math.floor(Math.random() * 908423324),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get("/destroy", (req, res) => {
    req.session.destroy((err) => {
        res.clearCookie('connect.sid');
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        for (let cookie in req.cookies) {
            res.clearCookie(cookie);
        }
        res.redirect("/signin");
    });
});

app.use(async (req, res, next) => {
    const noClientRollBack = () => {
        for (let cookie in req.cookies) {
            res.clearCookie(cookie);
        }
        next();
    }
    if (req.cookies.email !== undefined) {
        const validation = await user.find({ email: req.cookies.email });
        if (Object.keys(validation).length === 1) {
            const secrectKey = validation[0].password;
            if (req.cookies.token !== undefined) {
                const guardian = jsonWebToken.verify(req.cookies.token, secrectKey);
                const finalValidation = await user.find({ uid: guardian.uid });
                if (Object.keys(finalValidation).length === 1) {
                    req.session.ssid = validation[0].uid;
                    next();
                }
                else
                    noClientRollBack();
            } else
                noClientRollBack();
        } else
            noClientRollBack();
    } else
        next();
})

app.get("/", async (req, res) => {
    if (req.cookies.email === undefined)
        res.redirect("/registration");
    else {
        const client = await user.find({ uid: req.session.ssid });
        const readNotes = await note.find({ uid: req.session.ssid }).sort({ _id: -1 });
        res.render('index', { username: client[0].name, notes: readNotes, edit: false });
    }
});

app.get("/delete/:id", async (req, res) => {
    await note.deleteOne({ nid: req.params.id });
    res.redirect("/");
});

app.post("/", async (req, res) => {
    const { title, description } = req.body;
    await note.create({
        uid: req.session.ssid,
        nid: Math.floor(Math.random() * 9229902359027812984),
        title,
        description
    })
    res.redirect("/");
});

app.get("/registration", (req, res) => {
    if (req.cookies.email === undefined)
        res.render("registration", { error: false });
    else
        res.redirect('/');
});

app.get("/edit/:id", async (req, res) => {
    if (req.cookies.email === undefined)
        res.render("registration", { error: false });
    else {
        const client = await user.find({ uid: req.session.ssid });
        const readNotes = await note.find({ uid: req.session.ssid, nid: req.params.id }).sort({ _id: -1 });
        res.render('index', { username: client[0].name, notes: readNotes, edit: true });
    }
});

app.post("/edit/:id", async (req, res) => {
    const { title, description } = req.body;
    await note.updateOne({ nid: req.params.id }, { title, description });
    const client = await user.find({ uid: req.session.ssid });
    const readNotes = await note.find({ uid: req.session.ssid, nid: req.params.id }).sort({ _id: -1 });
    res.render('index', { username: client[0].name, notes: readNotes, edit: true });
});

app.post("/registration", async (req, res) => {
    let { name, email, password } = req.body;
    const unique = await user.find({ email });
    if (unique[0] === undefined) {
        const uid = Math.floor(Math.random() * 9283291390);
        bcrypt.hash(password, 10, async function (err, hash) {
            await user.create({ uid, name, email, password: hash });
            const utoken = jsonWebToken.sign({ uid: uid }, hash);
            res.cookie("token", utoken);
            res.cookie("email", email);
            res.redirect("/");
        });
    } else {
        res.render("registration", { error: true });
    }
});

app.get("/signin", (req, res) => {
    if (req.cookies.email === undefined)
        res.render("signin", { usernameerror: false, passworderror: false, email: null });
    else
        res.redirect('/');
});

app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const findClient = await user.find({ email });
    if (Object.keys(findClient).length === 1) {
        bcrypt.compare(password, findClient[0].password, function (err, result) {
            if (result) {
                const utoken = jsonWebToken.sign({ uid: findClient[0].uid }, findClient[0].password);
                res.cookie('token', utoken);
                res.cookie('email', email);
                res.redirect('/');
            } else {
                res.render("signin", { usernameerror: false, passworderror: true, email });
            }
        });
    } else {
        res.render("signin", { usernameerror: true, passworderror: false, email });
    }
});

app.listen(PORT);