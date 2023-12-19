var express = require('express')
var session = require('express-session')
var path = require('path');
var multer = require('multer')
var upload = multer({ dest: 'public/' })
const { MongoClient } = require('mongodb');

var mongoose = require("mongoose")
var url = 'mongodb+srv://hieupmgch210606:123456789qweasd@cluster0.pa3dz3l.mongodb.net'
mongoose.connect(url)
.then(() => console.log ("Connect to DB succeed !"))
.catch((err) => console.log (err))


var app = express()

var storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
      cb(null, 'public/img')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname)
    }
  })
   
  var upload = multer({ storage: storage })


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'Toy',
    resave: false
}))

function isAuthenticated(req, res, next) {
    let login = !req.session.userName
    if (login)
        res.redirect('/login')
    else
        next()
}

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/checkLogin', async (req, res) => {
    let name = req.body.user
    let pass = req.body.pass
    let server = await MongoClient.connect(url)
    let dbo = server.db("Toy")
    req.session.userName = name
    let user = await dbo.collection("account").find({ $and: [{ 'username': name }, { 'password': pass }] }).toArray()
    if (user.length > 0) {
        res.redirect('/')
    } else {
        let mes = "Username or password is invalid"
        res.render('login', { "message": mes, "username": name, "password": pass })
    }
})
    +
    app.get('/', isAuthenticated, async (req, res) => {
        let server = await MongoClient.connect(url)
        let dbo = server.db("Toy")
        let user = await dbo.collection("account").find({ 'username': req.session.userName }).toArray()
        res.render('home', { "user": user[0] })
    })

app.get('/logout', (req, res) => {
    req.session.userName = null
    req.session.save((err) => {
        req.session.regenerate((err2) => {
            res.redirect('/login')
        })
    })
})


app.get('/delete/:id',async (req,res)=>{
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Toy")
    var ObjectId = require('mongodb').ObjectId
    let condition = {"_id" : new ObjectId(id)};
    await dbo.collection("product").deleteOne(condition)
    res.redirect("/products")
})

app.get('/detail/:id',async (req,res)=>{
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Toy")
    var ObjectId = require('mongodb').ObjectId
    let condition = {"_id" : new ObjectId(id)};
    const product = await dbo.collection("product").find(condition).toArray()
    res.render('pro/productDetail',{'product':product})
})

app.get('/products',async (req,res)=>{
    let client = await MongoClient.connect(url)
    let dbo = client.db("Toy")
    let products = await dbo.collection("product").find().toArray()
    res.render('pro/products',{'products':products})
})

app.get('/mainpage', async (req, res) => {
    let server = await MongoClient.connect(url)
    let dbo = server.db("Toy")
    let products = await dbo.collection('product').find().toArray()
    res.render('pro/mainPage', { 'products': products })
})

app.get('/add', isAuthenticated, (req, res) => {
    res.render('pro/addNew')
})

app.post('/insert', isAuthenticated, upload.single('img'), async (req, res) => {
    let name = req.body.name
    let pub = req.body.pub
    let price = req.body.price
    let cate = req.body.cate
    if (name == "" || pub == "" || price == "" || cate == "") {
        res.render('pro/addNew', { 'error': "Please enter full information", 'name': name, 'pub': pub, 'price': price, 'cate': cate })
        return

    } else if (name.length < 3) {
        res.render('pro/addNew', { 'error': "The name is so short", 'name': name, 'pub': pub, 'price': price, 'cate': cate })
        return
    }
    let product = {
        'name': name,
        'price': price,
        'category': cate,
        'publisher': pub,
        'url': req.file.path.slice(7)
    }
    let server = await MongoClient.connect(url)
    let dbo = server.db("Toy")
    await dbo.collection("product").insertOne(product)
    res.redirect('/products')
})

app.post('/search', async (req, res) => {
    let key = req.body.key
    let server = await MongoClient.connect(url)
    let dbo = server.db("Toy")
    let products = await dbo.collection('product').find({ 'name': new RegExp(key, 'i') }).toArray()
    res.render('pro/products', { 'products': products, "key": key })
})



app.post('/edit', isAuthenticated, upload.single('img'), async(req, res) => {
    const name = req.body.name
    const price = req.body.price
    const category = req.body.cate
    const publisher = req.body.pub
    const urlImage  = req.file.path.slice(7)
    const id = req.body.id

    const options = { upsert: true };
    
    let client = await MongoClient.connect(url)
    let dbo = client.db("Toy")
    var ObjectId = require('mongodb').ObjectId
    const condition = {"_id" : new ObjectId(id)};
    const newValues = {$set : {'name':name,'price':price,'category':category, 'publisher':publisher, 'url':urlImage }}
    await dbo.collection("product").updateOne(condition,newValues, options)
    res.redirect('/products')
})


app.get('/edit/:id', isAuthenticated, async(req,res)=>{
    const file = req.file;
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Toy")
    var ObjectId = require('mongodb').ObjectId
    let condition = {"_id" : new ObjectId(id)};
    const prod = await dbo.collection("product").findOne(condition)
    res.render('pro/update',{prod:prod})
})

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log('Server listening on port')