# Install

Execute these commands in a terminal into the project directory:
```
npm install
```
Nothing else, the program will try tp get en environment variable for mongoDB "MONGODB_URI"
If not set it will use 27017 port number
# Run

Only run the command 
```
npm run start
```
It will listen on port defined by PORT env variable or 3000 if undefined.

# Use it

Méthods avalailable:
    **POST**: /chat
    **DELETE**: /messages/last
    **GET**: /messages/all

**POST**
Content-type: application/json

Message structure:
```
{
    "msg": "Some message"
}
```

Reponse type: application/text
Response code: 201

**DELETE**
Response type: application/text
Response code: 200

**GET**
Reponse type: application/json
Response code: 200