const express = require("express")
const path = require("path")
const cookieParser = require('cookie-parser')
const { connectToMongoDB } = require('./connect')
const urlRoute = require("./routes/url")
const URL = require("./models/url")
const {restrictToLoggedinUserOnly,checkAuth} = require('./middlewares/auth')
const staticRoute = require('./routes/staticRoute')
const userRoute = require('./routes/user')
const app = express()
const PORT = 8000

connectToMongoDB("mongodb://localhost:27017/short-url")
.then(() => console.log("connected to mongodb"))

app.set("view engine", "ejs")
app.set('views', path.resolve("./views"))

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.use('/user', userRoute)
app.use("/url", restrictToLoggedinUserOnly, urlRoute)
app.use('/',checkAuth, staticRoute)

app.get('/url/:shortId', async (req,res) => {
    const shortId = req.params.shortId
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {$push: {
        visitHistory: {timestamp: Date.now()},
    },})
    res.redirect(entry.redirectUrl)
})

app.listen(PORT, () => console.log(`app started on port: ${PORT}`))