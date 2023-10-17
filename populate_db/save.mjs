import { connectDb } from './db.mjs';

export async function saveBooks(db, books) {
  // save books

    for (let book of books) {
        const sql = 'INSERT INTO books SET ?';
        await db.query(sql, book);
    }
}