const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7dm94fg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req,res,next) =>{
  const authHeader = req.headers.authorization;
  if(!authHeader){
    res.status(401).send({message: 'unauthorized access'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function (err,decoded){
    if(err){
      res.status(401).send({message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();

  })
}

const run = async () => {
  try {
    const serviceCollection = client.db("serviceReview").collection("services");
    const reviewCollection = client.db("serviceReview").collection("reviews");

    app.post('/jwt',(req,res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})

      res.send({token});


      console.log(user);

    })


    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);

      const services = await cursor.limit(3).toArray();

      res.send(services.reverse());
    });
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);

      const services = await cursor.toArray();

      res.send(services.reverse());
    });

    app.get("/allServices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services.reverse());
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const service = await serviceCollection.findOne(query);

      res.send(service);
    });

    app.get("/reviewsById", async (req, res) => {
      const id = req.query.serviceId;
      const query = { serviceId: id };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get("/reviewsByUser", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.userId !== req.query.userId) {
          res.status(403).send({ message: 'unauthorized access' })
      }


       const id = req.query.userId;
        const query = { userId: id };


      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/addReview", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = await reviewCollection.findOne(query);
      res.send(review);
    });

    app.patch("/review/:id", async (req, res) => {
      const id = req.params.id;
      const text = req.body.text;
      const ratings = req.body.ratings;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          text: text,
          ratings: ratings,
        },
      };
      const result = await reviewCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/service", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
