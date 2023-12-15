CREATE DATABASE rbord001_Bookshop;
USE rbord001_Bookshop;
CREATE TABLE books (id INT AUTO_INCREMENT PRIMARY KEY,title VARCHAR(255),author_name VARCHAR(255),cover_url VARCHAR(255),first_publish_year INT,subject VARCHAR(255),price DECIMAL(5,2));
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'app2027';
GRANT ALL PRIVILEGES ON rbord001_Bookshop.* TO 'appuser'@'localhost';
CREATE TABLE user_details (username varchar(255),first_name varchar(255),last_name varchar(255),hashedPassword varchar(255),email varchar(255));
ALTER TABLE user_details ADD id INT PRIMARY KEY AUTO_INCREMENT;

