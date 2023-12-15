const axios = require('axios');
const bcrypt = require('bcrypt');

module.exports =function(app, shopData){

    const {check, validationResult} = require('express-validator');
    const saltRounds = 10;

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
        res.redirect('./login')
        } else { next (); }
        }


    app.get('/', function(req, res) {
        db.query('SELECT * FROM books ORDER BY RAND() LIMIT 6', (error, results, fields) => {
            if (error) {
                console.error(error);
                res.render('index.ejs', { ...shopData, error: 'An error occurred while fetching the books.' });
            } else {
                res.render('index.ejs', { ...shopData, books: results, isLoggedIn: req.session.isLoggedIn });
            }
        });
    });

    app.get('/about', function(req, res) {
        res.render('about.ejs', {...shopData, isLoggedIn: req.session.isLoggedIn});
    });

    app.get('/products', redirectLogin,  function(req, res) {
        const query = 'SELECT * FROM books';
        db.query(query, (error, results) => {
            if (error) {
                console.error(error);
                res.render('products.ejs', { ...shopData, error: 'An error occurred while fetching the books.' });
            } else {
                res.render('products.ejs', { ...shopData, books: results, isLoggedIn: req.session.isLoggedIn });
            }
        });
    });

    app.get('/searchBook', redirectLogin, function(req, res) {
       res.render('searchBooks.ejs', {...shopData, isLoggedIn: req.session.isLoggedIn});
    });

    app.get('/search-result', [check('BookSearch').notEmpty().trim().escape()],
    function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./'); }
        else {
            const query = req.query.BookSearch;
            db.query('SELECT * FROM books WHERE title LIKE ?', [`%${query}%`], (error, results) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('An error occurred while fetching the books.');
                } else {
                    // res.json(results);  
                    res.render('products.ejs', { ...shopData, books: results, isLoggedIn: req.session.isLoggedIn });
                }
            });
        }
    });

    app.get('/addBook', redirectLogin,  function(req, res) {
        res.render('addBook.ejs', {...shopData, isLoggedIn: req.session.isLoggedIn});
    });

    app.post('/bookadded', [
        check('title').notEmpty().trim().escape(),
        check('author').notEmpty().trim().escape(),
        check('cost').notEmpty().trim().escape(),
        check('year').notEmpty().trim().escape().isNumeric().isLength({ min: 4}),
    ], function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array()});
        }
        else{
            const query = 'INSERT INTO books (title,author_name,cover_url, first_publish_year, subject, price) VALUES (?, ?, ?,?,?,?)';
            console.log(query);
            db.query(query, [req.body.title, req.body.author, "https://covers.openlibrary.org/b/id/14444481-L.jpg", req.body.year, 'love', req.body.cost], (error, results) => {
                if (error) {
                    console.error(error);
                    res.render('addBook.ejs', { ...shopData, error: 'An error occurred while adding the book.' });
                } else {
                    res.render('products.ejs', {...shopData, isLoggedIn: req.session.isLoggedIn});
                }
            });
        }
    });

    app.get('/deleteBook/:id', function(req, res) {
        const bookId = req.params.id;
    
        db.query('DELETE FROM books WHERE id = ?', [bookId], function(error, results, fields) {
            if (error) {
                console.error(error);
                res.status(500).send('An error occurred while deleting the book.');
            } else {
                res.redirect('/products#deleted');
            }
        });
    });

    app.get('/login', function(req, res) {
        res.render('login.ejs', shopData);
    });

    app.post('/loggedin', [check('username').isAlphanumeric('en-US', {ignore: '\s'}).notEmpty(),
    check('password').isLength({ min: 8 }).notEmpty()], 
    function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array()});
        }
        else{
            const query = 'SELECT * FROM user_details WHERE username = ?';
            db.query(query, [req.body.username], (error, results) => {
                if (error) {
                    console.error(error);
                    res.render('login.ejs', { ...shopData, error: 'An error occurred while fetching the user.' });
                } else {
                    if (results.length === 0) {
                        res.render('login.ejs', { ...shopData, error: 'User not found.' });
                    } else {
                        bcrypt.compare(req.body.password, results[0].hashedPassword, function(err, result) {
                            if (result) {
                                console.log('User logged in successfully');
                                req.session.userId = results[0].id;
                                req.session.isLoggedIn = true;
                                res.redirect('/');
                            } else {
                                res.render('login.ejs', { ...shopData, error: 'Incorrect password.' });
                            }
                        });
                    }
                }
            });
        }
    
    });

    app.get('/register', function(req, res) {
        res.render('register.ejs', {...shopData, isLoggedIn: req.session.isLoggedIn});
    });

    app.post('/registered', [
        check('email').isEmail().normalizeEmail(),
        check('password').isLength({ min: 8 }).notEmpty().trim().escape(),
        check('username').isAlphanumeric('en-US', {ignore: '\s'}).isLength({ min: 3 }).notEmpty().trim().escape(),
        check('firstName').notEmpty().trim().escape(),
        check('lastName').notEmpty().trim().escape()
    ], function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array()});
        }
        else{
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                const query = 'INSERT INTO user_details (username,first_name,last_name,hashedPassword,email) VALUES (?, ?, ?,?,?)';
                db.query(query, [req.body.username, req.body.firstName, req.body.lastName, hash, req.body.email ], (error, results) => {
                    if (error) {
                        console.error(error);
                        res.render('register.ejs', { ...shopData, error: 'An error occurred while registering the user.' });
                    } else {
                        res.render('register.ejs', {...shopData, isLoggedIn: req.session.isLoggedIn});
                    }
                });
            });
        }
    });


    app.get('/movie' , redirectLogin, function(req, res) {
        const tmdbApiKey = '663061f2feaa232a9c75cb1a8ffc3980'; 
        axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${tmdbApiKey}`)
            .then(response => {
                const allTrending = response.data.results;
                const trendingMovies = allTrending.filter(item => item.media_type === 'movie').slice(0, 5);
                const trendingShows = allTrending.filter(item => item.media_type === 'tv').slice(0, 5);
                const moviesAndShows = { trendingMovies, trendingShows };
                res.render('movie.ejs', { shopData, moviesAndShows, isLoggedIn: req.session.isLoggedIn });
            })
            .catch(error => {
                console.error(error);
                res.status(500).send('An error occurred while fetching data from TMDB API');
            });
    });

    app.get('/movie-search', function(req, res) {
        const tmdbApiKey = '663061f2feaa232a9c75cb1a8ffc3980';
        const query = req.query.q;
        axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${query}`)
            .then(response => {
                res.json(response.data.results.slice(0,1));
            })
            .catch(error => {
                console.error(error);
                res.status(500).send('An error occurred while fetching data from TMDB API');
            });
    });
    

    app.get('/listuser', redirectLogin, function(req, res) {
        const query = 'SELECT * FROM user_details';
        db.query(query, (error, results) => {
            if (error) {
                console.error(error);
                res.render('listuser.ejs', { ...shopData, error: 'An error occurred while fetching user details.' });
            } else {
                res.render('listuser.ejs', { ...shopData, users: results , isLoggedIn: req.session.isLoggedIn });
            }
        });
    });

    app.get('/deleteUser/:id', function(req, res) {
        const userId = req.params.id;
    
        db.query('DELETE FROM user_details WHERE id = ?', [userId], function(error, results, fields) {
            if (error) {
                console.error(error);
                res.status(500).send('An error occurred while deleting the user.');
            } else {
                res.redirect('/listuser#deleted');
            }
        });
    });


    app.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if(err) {
                return res.redirect('/dashboard');
            }
            req.session.isLoggedIn = false;
            res.clearCookie('sid');
            res.redirect('/');
        });
    });


};