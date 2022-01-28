const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.or2vp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Travel24");
    const BlogCollection = database.collection("blog");
    const userCollection = database.collection("user");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });
    app.post("/blog", async (req, res) => {
      const user = req.body;
      const result = await BlogCollection.insertOne(user);
      res.json(result);
    });

    app.get("/blog", async (req, res) => {
      const blog = BlogCollection.find({});
      const result = await blog.toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Welcome to Travel24");
});

app.listen(port, () => {
  console.log(port, "data base connected");
});