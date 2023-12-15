const mysql = require('mysql2');
const axios = require('axios');

const genres = ['Science fiction', 'Love','Fantasy','Romance', 'Mystery and detective stories'];

let books = [];

const promises = genres.map(genre => {
    return axios.get(`http://openlibrary.org/subjects/${genre}.json?limit=10`)
        .then(response => {
            const genreBooks = response.data.works.map(book => ({...book, subject: genre}));
            books = books.concat(genreBooks);
        })
        .catch(error => {
            console.error(error);
        });
});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'appuser',
    password: 'app2027',
    database: 'rbord001_Bookshop'
});

Promise.all(promises)
    .then(() => {
        const bookTitles = books.map(book => book.title);
        console.log(bookTitles);
        console.log(books.length);

        books.forEach(book => {
            const { title, authors, cover_id, first_publish_year, subject } = book;
            const author_name = authors[0].name;
            const cover_url = `http://covers.openlibrary.org/b/id/${cover_id}-L.jpg`;
            const price = (Math.random() * 100).toFixed(2); // Generate a random price between 0 and 100

            const query = 'INSERT INTO books (title, author_name, cover_url, first_publish_year, subject, price) VALUES (?, ?, ?, ?, ?, ?)';
            connection.query(query, [title, author_name, cover_url, first_publish_year, subject, price], (error, results) => {
                if (error) throw error;
                console.log('Inserted ' + results.affectedRows + ' row(s).');
            });
        });
    })
    .finally(() => {
        connection.end();
    });