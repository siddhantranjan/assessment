# Web Scraping Assessment

A Node.js-based web scraper for Amazon India that allows users to log in, view their order history, and scrape details about the products they have purchased. Built using Playwright for browser automation and Node.js for handling user input.


## Features
- *User Login*: Automates the login process to Amazon India using provided credentials.
- *Order History Scraping*: Scrapes the details of products in your order history.
- *Filters*: Option to filter orders based on the year of purchase.
- *Headless Mode Support*: Run the scraper with or without the browser UI (headless mode).
- *Interactive User Input*: Allows users to input their credentials and filter preferences via command line.

## Technologies Used
- *Playwright*: For browser automation and scraping Amazon India pages.
- *Node.js*: JavaScript runtime to handle the application logic.
- *Readline*: For reading user input in the terminal.
- *TypeScript*: Used for type safety and better developer experience.

## Installation


### Setup
1. Clone the repository:
   bash
   git clone https://github.com/siddhantranjan/assessment.git
   cd assessment
   code .

2. Install dependencies:
   bash
   npx install Playwright
   npm i

Install all the dependencies   
   
3. Compile the typerscript code:
     bash
    npx tsc --watch
    
This will watch for changes in your TypeScript files and recompile them automatically.

4. Run the program
    bash 
   npm run dev