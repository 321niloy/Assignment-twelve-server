const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const port =process.env.PORT ||  3000


app.use(express.json())
app.use(cors())
console.log(process.env.ADMIN_USER)


const { MongoClient, ServerApiVersion } = require('mongodb');
var uri = `mongodb://${process.env.ADMIN_USER}:${process.env.ADDMIN_PASS}@ac-mvazqsy-shard-00-00.hpy6sqt.mongodb.net:27017,ac-mvazqsy-shard-00-01.hpy6sqt.mongodb.net:27017,ac-mvazqsy-shard-00-02.hpy6sqt.mongodb.net:27017/?ssl=true&replicaSet=atlas-vll8ae-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const instructorsCollection = client.db("learnHub").collection("instructor");
    const instruementCollection = client.db("learnHub").collection("instruement");
    // Send a ping to confirm a successful connection


    app.get('/instructor', async (req, res) => {
        const result = await instructorsCollection.find().toArray();
        res.send(result);
      });

      app.get('/instruement', async (req, res) => {
        const result = await instruementCollection.find().toArray();
        res.send(result);
      });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})