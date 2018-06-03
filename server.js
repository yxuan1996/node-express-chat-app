var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

//app.use will serve content to be seen by the user (front-end)
//by default, this will serve index.html
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

//ask mongoose to use the default ES6 promise library instead of the mongoose promise library
mongoose.Promise = Promise

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

//Promises allow us to work on asychronous code with a linear/synchronous structure
app.post('/messages', (req, res) => {
    //initialize a new database entry
    var message = new Message(req.body)
    
    //save the message entry to the database
    //Promises are use to filter out 'badword'
    message.save()
    .then(() => {
        console.log('saved')
        return Message.findOne({message: 'badword'})
    })
    .then( censored => {
        if(censored) {
            console.log('censored words found', censored)
            return Message.remove({_id: censored.id})
        }
        //broadcast/push notification of messages into all clients
        io.emit('message', req.body)
        res.sendStatus(200)
    })
    .catch((err) => {
        res.sendStatus(500)
        return console.error(err)
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