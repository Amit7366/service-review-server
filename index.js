const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7dm94fg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





const run = async ()=>{
    try{
      const serviceCollection = client.db('serviceReview').collection('services');



      app.get('/services', async (req,res) =>{
        const query ={};
        const cursor = serviceCollection.find(query);

        const services = await cursor.limit(3).toArray();

        res.send(services.reverse());
      });

      app.get('/allServices', async (req,res) =>{
        const query ={};
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services.reverse());
      })



    }finally{
      // await client.close();
    }
}

run().catch(err => console.log(err));

  app.get('/', (req, res) => {
    res.send('server is running');
  });




  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });