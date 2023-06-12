const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY)
const port =process.env.PORT ||  3000


app.use(express.json())
app.use(cors())
console.log(process.env.ADMIN_USER)



const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
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
    const instrumentCollection = client.db("learnHub").collection("instruement");
    const usersCollection = client.db("learnHub").collection("users");
    const getCollection=client.db("learnHub").collection("get");
    const reqCollection=client.db("learnHub").collection("request");
    const paymentCollection=client.db("learnHub").collection("payments");
    // Send a ping to confirm a successful connection
    // for user
    app.put('/users/:email', async(req,res)=>{
        const email = req.params.email
        const user = req.body
        const query = {email:email}
        const options = {upsert: true }
        const updateDoc = {
            $set:user
        }
        const result =await usersCollection.updateOne(query,updateDoc,options)
        console.log(result)
        res.send(result)
    })
    
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // //////////////////////////////user end

    // for instructos start

    app.get('/instructor', async (req, res) => {
        const result = await instructorsCollection.find().toArray();
        res.send(result);
      });
//  ------------------------------------ instructor end

// ------------Instrument
      app.get('/instruement', async (req, res) => {
        const result = await instrumentCollection.find().toArray();
        res.send(result);
      });
      
      app.post('/instruement', async(req,res)=>{
        const newItem = req.body;
        console.log(newItem)
        const result = await instrumentCollection.insertOne(newItem)
        res.send(result);
    });
    //   ///////////////////////////////////////

    // -----------------------------get instrument classed
    app.post('/instrucarts', async(req,res)=>{
        const newItem = req.body;
        console.log(newItem)
        const result = await getCollection.insertOne(newItem)
        res.send(result);
    })

      app.get('/instrucarts/:email', async (req, res) => {
        const email=req.params.email
        const query = { email: email }
        const result = await getCollection.find(query).toArray();
        res.send(result);
      });

      app.delete('/instrucarts/:id',async (req, res) => {
        const id = req.params.id;
        console.log(id)
        const query = { _id: new ObjectId(id) }
        const result = await getCollection.deleteOne(query);
        res.send(result);
      })
      // ////////////  Request colection

      app.post('/requestcollection', async(req,res)=>{
        const newItem = req.body;
        const result = await reqCollection.insertOne(newItem)
        res.send(result);
    });
    app.get('/requestcollection', async (req, res) => {
      const result = await reqCollection.find().toArray();
      res.send(result);
    });

    app.delete('/requestcollection/:id',async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await reqCollection.deleteOne(query);
      res.send(result);
    })
    // //////////////////////////////////////////////
    // --------Create Payment Intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
     const amount = price*100
     console.log("sil",price,amount)
     const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      payment_method_types: ['card']
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });

      });
// ======= Payment Related Api
app.post('/payments', async(req,res)=>{
  const payment = req.body
  console.log("payyyyyy",payment)
  const insertResult = await paymentCollection.insertOne(payment);

  const query = { _id: { $in: payment.cartItems.map(id => new ObjectId(id)) } }
  const deleteResult = await getCollection.deleteMany(query)

  res.send({insertResult,deleteResult});
})

app.get('/paymentget', async (req, res) => {
  const result = await paymentCollection.find().toArray();
  res.send(result);
});
      // ----------------------------------

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