import { connectDb } from './db.mjs';
import { searchBooks, getBookDetails } from './books.mjs';
import { saveBooks } from './save.mjs';

async function main() {
  // main app logic

  const db = await connectDb();

  const subjects = ['fiction', 'technology'];

  for (let subject of subjects) {
    console.log(`Fetching ${subject} books...`);

    const books = await searchBooks(subject);
    await getBookDetails(books);
    await saveBooks(db, books);

    console.log(`Saved ${books.length} books`);
  }

  await db.end();
}

main();