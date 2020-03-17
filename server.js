const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/chat-bot';
const dbName = 'chat-bot';
client = new MongoClient(url, { useUnifiedTopology: true });

(async function() {

  try {
    // Use connect method to connect to the Server
    await client.connect();
    console.log('Connected to ' + dbName)
    const db = client.db(dbName);

    const col = db.collection('dates');

    const cursor = col.find()

    while(await cursor.hasNext()) {
      const doc = await cursor.next();
      console.dir(doc);
    }
  } catch (err) {
    console.log(err.stack);
  }
})();

function getCol() {
    const db = client.db(dbName)
    const col = db.collection('messages')
    return col;
}

app.get('/', function (req, res) {
    res.send('Hello World!')
  })
  
app.listen(PORT, function () {
  console.log('Chat-Bot listening !')
})

app.get('/hello', function(req, res){
    if(req.query.nom == "" || req.query.nom == undefined){
        res.send('Quel est votre nom ?');
    } else {
        res.send('Bonjour ' + req.query.nom)
    }
})

app.delete('/messages/last', (req, res) => {
    const col = getCol();
    col.estimatedDocumentCount().then((count) => {
        col.find({}).skip(count - 2).toArray((err, data) => {
            if(err) throw err;
            data.forEach(doc => {
                col.deleteOne(doc);
            });
            res.status(200).send("Deleted\n");
        })
    }).catch(err => { console.log(err) } )
})

app.get('/messages/all', (req, res) => {
    col = getCol();
    col.find({}).toArray((err, data) => {
        if(err) throw err;
        return res.json(data);
    });
})

app.post('/test', (req, res) => {
    console.log(req.body);
})

app.post('/chat', function(req, res){
    console.log(req);
    if(req.body.msg != undefined){
        const col = getCol();
        switch(req.body.msg){
            case 'ville':
                col.insertOne({from:"user", msg:"ville"});
                col.insertOne({from:"chat-bot", msg: "Nous sommes à Paris."});
                return res.send("Nous sommes à Paris." + '\n');
            case 'meteo':
                col.insertOne({from:"user", msg:"meteo"});
                col.insertOne({from:"chat-bot", msg:"Il fait beau !"});
                return res.send("il fait beau !" + '\n');
            default:
                break
        }
        var msg = req.body.msg;
        var index = msg.indexOf('=');
        console.log(msg);
        if(msg.indexOf('=') == -1){
            fs.readFile("./reponses.json", (err, data) => {
                if(data != undefined){
                    if(data.length == 0){
                        col.insertOne({from:"user", msg:msg});
                        col.insertOne({from:"chat-bot", msg:"Je ne connais pas " + msg + "."});
                        res.send("Je ne connais pas " + msg + ".");
                    } else {
                        if (err) throw err;
                        let demain = JSON.parse(data);
                        if(demain.demain !== undefined){
                            col.insertOne({from:"user", msg:msg});
                            col.insertOne({from:"chat-bot", msg: "demain: " + demain.demain + "."})…
                            res.send("demain: " + demain.demain);
                        }
                    }
                } else {
                    col.insertOne({from:"user", msg:msg})
                    col.insertOne({from:"chat-bot", msg:"Je ne connais pas " + msg + "."})
                    res.send("Je ne connais pas " + msg + ".");
                }
            });
        } else {
            let value = msg.substring(index+1, msg.length)
            let content = {
                demain: value
            }
            fs.writeFile("./reponses.json",JSON.stringify(content), error => {
                if(error){
                    console.error(error);
                }
                col.insertOne({from:"user", msg:msg});
                col.insertOne({from:"chat-bot", msg:"Merci pour cette information."});
                res.send("Merci pour cette information.")
            })
        }
    } else {
        console.error(req);
    }
});