'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
        http = require('http'),
        https = require('https'),
        express = require('express'),
        consolidate = require('consolidate'),
        bodyParser = require('body-parser'),
        session = require('express-session'),
        compress = require('compression'),
        methodOverride = require('method-override'),
        cookieParser = require('cookie-parser'),
       
        /*mongoStore = require('connect-mongo')({
         session: session
         }),*/
        
        config = require('./config'),
        connection = require('express-myconnection'),
        mysql = require('mysql'),
        path = require('path');

/*var log = require('../app/components/config.js');*/

module.exports = function () {
    // Initialize express app
    var app = express();

    // Globbing model files
    config.getGlobbedFiles('./app/models*//***/*//*.js').forEach(function (modelPath) {
        require(path.resolve(modelPath));
    });

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
    app.locals.jsFiles = config.getJavaScriptAssets();
    app.locals.cssFiles = config.getCSSAssets();

    // Passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        global.serverUrl = req.protocol + '://' + req.headers.host;
        next();
    });

    // Should be placed before express.static
    app.use(compress({
        filter: function (req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    //connecting mysql database
    app.use(
            connection(mysql, {
                host: 'localhost',
                user: 'root',
                password: '',
                port: 3306, //port mysql
                database: 'doctor_here'

            }, 'pool') //or single

            );


    // Showing stack errors
    app.set('showStackError', true);

    // Set swig as the template engine
    app.engine('server.view.html', consolidate[config.templateEngine]);

    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', './app/views');

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // Enable logger (morgan)
        //app.use(morgan('dev'));

        // Disable views cache
        app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }



    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // CookieParser should be above session
    app.use(cookieParser());

    /************* chat module start ****************/


//app.use(express.static(__dirname + '/public'));
    app.engine('.html', require('ejs').renderFile);
// Render and send the main page

    app.get('/chat', function (req, res) {
        res.render('chat.html');
    });

    /****************chat module end *****************/

   

    // Setting the app router and static folder
    app.use(express.static(path.resolve('./public')));
    global.appRoot = path.resolve(__dirname);

    // Globbing routing files
    config.getGlobbedFiles('./app/routes/**/*.js').forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err)
            return next();

        // Log it
        console.error(err.stack);

        // Error page
        res.status(500).render('500', {
            error: err.stack
        });
    });

    // Assume 404 since no middleware responded
    app.use(function (req, res) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not Found'
        });
    });


    process.on('uncaughtException', function (err) {
        console.log(err);
        /*log.appendError(err.toString());*/

        /*app.use(function(req, res) {
         res.status(400).send({
         message: "There is some problem with server please try again."
         });
         });*/
    })



    

    // Return Express server instance
    return app;
};
