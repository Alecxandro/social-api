## Social Media API

Basically it allows users to register, log in, create posts, like and unlike posts, add comments to posts, and so on.

## Stack
- Node.js
- Express
- Mongoose
- JWT

## How to run
1. Clone the repository
2. Install dependencies
3. Create a `.env` file and add the following:
    - `PORT`
    - `MONGO_URI`
    - `JWT_SECRET`  
4. Start the server
5. Use the API

## Considerations

It's a simple API, so it doesn't have a frontend. 
I highly recommend using Insomnia to test the API endpoints.

Remember: it may lack some validations and security measures, but it's a good starting point for a social media API. And of course, it's not ready for production yet and still under development.

Future improvements:
- Add tests
- Dockerize the app
- Improve overall code quality
- Detailed documentation
