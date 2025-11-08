# CSC_308-309_NULL

csc 308/309 project developed by Brian, Vishnu, Ryan, and Aaron

# UI Design

[Figma UI Design](https://www.figma.com/design/0z8JxtDEOHMynJBxNlRy3B/NULL?node-id=0-1&t=4Dz5RBx5Wi5keHSV-1)

# Prettier/ESLint Setup Instructions:

1. Run npm install to get the dev dependencies.

2. Install Prettier and ESLint extensions in VS Code.

3. Enable “Format on Save” in your VS Code settings.

4. Run npm run format before committing to format all files.

# Backend Instructions

1. Create a .env file with the MONGODB connection string.

2. Label it as MONGODB_URI = "connection_string"

3. make sure before doing git add, that you have .env in the gitignore file

# Database Tutorial

1. npm start to run this thing (or node backend/backend.js)

- /users for users
- /logins for credentials
- /(users or logins)/:id for id search
- /(users or logins)/search/(catagory)/(whatever) for search, CASE SENSITIVE
  - for multiple inputs in (whatever), seperate by comma
    - Ex. /users/search/interests/balling,dunking
  - for spaces use %20
    - Ex. /users/search/name/LEBRON%20JAMES

1. If there's bugs, fix if you can. Otherwise just dm Brian.
2. Feel free to ask Brian for more information, although information about code is commented.
3. Please feel free to add additional features.


