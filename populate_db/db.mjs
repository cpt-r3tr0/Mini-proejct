import mysql from 'mysql2/promise';

export async function connectDb() {
    // create the connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'appuser',
        password: 'app2027',
        database: 'rbord001_Bookshop'
    });

    // return the connection
    return connection;
}

