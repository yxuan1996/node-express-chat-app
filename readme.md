Things to do before deployment

Remember to npm install to install all the modules in package.json

Create a Procfile. In the Procfile, type: 
web: node server.js

Add the following to package.json
"scripts": {
    "start": "node server.js"
}

"engines": {
    "node": "8.9.3"
}

Update the ports
Use whatever port heroku assigns, or use 8080
var port = process.env.PORT || 8080;