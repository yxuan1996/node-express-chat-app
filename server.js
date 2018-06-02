var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// set the mongo database URI
// to get the URI, run the following line on the command line
// heroku config | grep MONGODB_URI
var dbURL = 'mongodb://heroku_pssj50t6:5r4rn9ujham1q67s0d716gp8gq@ds245240.mlab.com:45240/heroku_pssj50t6'

//Create a message model schema for the database
var Message = mongoose.model('Message', {
    name: String,
    message: String
})

/*
var messages = [
    {name: 'Tim', message: 'Hi'},
    {name: 'Jane', message: 'Hello'}
]
*/

app.get('/messages', (req, res) =>{
    //finds all the messages in the database
    Message.find({}, (err,messages) => {
        res.send(messages)
    })
})

app.post('/messages', (req, res) =>{
    //Initialize a database entry
    var message = new Message(req.body)
    
    //save the message as an entry
    message.save((err) => {
        if(err)
            res.sendStatus(500)
        else
        //no longer need to push to messages array since we are using database
        //messages.push(req.body)
        io.emit('message', req.body)
        res.sendStatus(200) 
        
    })
    
    
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

//connect to the mongo database using the URI stated above
//2nd argument is to prevent depreciation warning
//3rd argument is a callback function that logs the connection status and logs any error messages, if any
mongoose.connect(dbURL, {UseMongoClient: true}, (err) => {
    console.log('mongo client connected', err)
})

//We use port 8080 because of cloud9. Normally, the localhost port is 3000. 
var server = http.listen(port, () => {
    console.log('server is listening on port', server.address().port)
})