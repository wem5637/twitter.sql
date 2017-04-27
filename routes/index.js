'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
const client = require('../db');





module.exports = function makeRouterWithSockets(io) {

    // a reusable function
    function respondWithAllTweets(req, res, next) {
        client.query('SELECT name, content, picture_url, user_id FROM users INNER JOIN tweets ON tweets.user_id=users.id', function(err, result) {
            if (err) return next(err); // pass errors to Express
            var tweets = result.rows;
            console.log(tweets);
            res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
        });
    }

    // here we basically treat the root view and tweets view as identical
    router.get('/', respondWithAllTweets);
    router.get('/tweets', respondWithAllTweets);

    // single-user page
    router.get('/users/:user_id', function(req, res, next) {

        client.query('SELECT * FROM users INNER JOIN tweets ON tweets.user_id = users.id WHERE users.id = $1', [req.params.user_id], function(err, result){
            if(err) return next(err);
            var userTweets = result.rows;
            console.log(userTweets);
            res.render('index', {title: 'Twitter.js', tweets: userTweets, showForm: true, username: userTweets[0].name, user_id: userTweets[0].user_id})
        });
    });

    // single-tweet page
    router.get('/tweets/:id', function(req, res, next) {
        client.query('SELECT * FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE tweets.id = $1', [req.params.id], function(err, result){
            if(err) return next(err);
            var singleTweet = result.rows;
            console.log(singleTweet);
            res.render('index', {title: 'Twitter.js', tweets: singleTweet, showForm: true, username: singleTweet[0].name, user_id: singleTweet[0].user_id});
        });

        // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
        // res.render('index', {
        //     title: 'Twitter.js',
        //     tweets: tweetsWithThatId // an array of only one element ;-)
        // });
    });

    // create a new tweet
    router.post('/users/:id/tweets', function(req, res, next) {
        client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)',[req.params.id,req.body.text], function(err, result){
            if(err) return next(err);
            console.log('tweet added');
            // io.sockets.emit('new_tweet', newTweet);
            res.redirect('/');

        })

        // var newTweet = tweetBank.add(req.body.name, req.body.text);
        // io.sockets.emit('new_tweet', newTweet);
        // res.redirect('/');
    });

    // // replaced this hard-coded route with general static routing in app.js
    // router.get('/stylesheets/style.css', function(req, res, next){
    //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
    // });

    return router;
}
