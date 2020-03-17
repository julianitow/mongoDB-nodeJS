const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = process.env.MONGODB_URI || 'mongodb://localhost:' + 27017 + '/chat-bot';
const dbName = 'chat-bot';
client = new MongoClient(url, { useUnifiedTopology: true });

function getCol() {
    const db = client.db(dbName)
    const col = db.collection('messages')
    return col;
}

(async function() {
  try {
    await client.connect();
    console.log('Connected to ' + dbName)
  } catch (err) {
    console.log(err.stack);
  }
})();
  
app.listen(PORT, function () { console.log('Chat-Bot listening !') })

app.delete('/messages/last', (req, res) => {
    const col = getCol();
    col.estimatedDocumentCount().then((count) => {
        if(count == 0) throw "error nothing to skip"; 
        col.find({}).skip(count - 2).toArray((err, data) => {
            if(err) throw err;
            data.forEach(doc => {
                col.deleteOne(doc);
            });
            res.status(200).send("Deleted\n");
        })
    }).catch(err => { console.error(err) } )
})

app.get('/messages/all', (req, res) => {
    col = getCol();
    col.find({}).toArray((err, data) => {
        if(err) throw err;
        return res.json(data);
    });
})

app.post('/chat', function(req, res){
    if(req.body.msg != undefined){
        const col = getCol();
        switch(req.body.msg){
            case 'ville':
                col.insertOne({from:"user", msg:"ville"});
                col.insertOne({from:"chat-bot", msg: "Nous sommes à Paris."});
                return res.status(201).send("Nous sommes à Paris." + '\n');
            case 'meteo':
                col.insertOne({from:"user", msg:"meteo"});
                col.insertOne({from:"chat-bot", msg:"Il fait beau !"});
                return res.status(201).send("il fait beau !" + '\n');
        }
        var msg = req.body.msg;
        var index = msg.indexOf('=');
        if(msg.indexOf('=') == -1){
            fs.readFile("./reponses.json", (err, data) => {
                if(data != undefined){
                    if(data.length == 0){
                        col.insertOne({from:"user", msg:msg});
                        col.insertOne({from:"chat-bot", msg:"Je ne connais pas " + msg + "."});
                        res.send.status(201).send("Je ne connais pas " + msg + ".");
                    } else {
                        if (err) throw err;
                        let demain = JSON.parse(data);
                        if(demain.demain !== undefined){
                            col.insertOne({from:"user", msg:msg});
                            col.insertOne({from:"chat-bot", msg: "demain: " + demain.demain + "."});
                            res.send.status(201).send("demain: " + demain.demain);
                        }
                    }
                } else {
                    col.insertOne({from:"user", msg:msg})
                    col.insertOne({from:"chat-bot", msg:"Je ne connais pas " + msg + "."})
                    res.send.status(201).send("Je ne connais pas " + msg + ".");
                }
            });
        } else {
            let value = msg.substring(index+1, msg.length)
            let content = { demain: value };
            fs.writeFile("./reponses.json",JSON.stringify(content), error => {
                if(error) throw err;
                col.insertOne({from:"user", msg:msg});
                col.insertOne({from:"chat-bot", msg:"Merci pour cette information."});
                res.status(201).send("Merci pour cette information.")
            })
        }
    }
});