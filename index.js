const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

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
      const blog = req.body;
      const penBlog = {
        approve: "pending",
        WriterName: blog.WriterName,
        email: blog.email,
        placeName: blog.placeName,
        address: blog.address,
        imageURL: blog.imageURL,
        experience: blog.experience,
      };
      penBlog.createdAt = new Date();
      const result = await BlogCollection.insertOne(penBlog);
      res.json(result);
    });

    app.get("/blog", async (req, res) => {
      const query = { approve: "approved" };
      const blog = BlogCollection.find(query);
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let result;
      const count = await blog.count();
      if (page) {
        result = await blog
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        result = await blog.toArray();
      }
      res.send({
        result,
        count,
      });
    });

    app.get("/blog/latest-blog/pending", async (req, res) => {
      const query = { approve: "pending" };
      const blog = BlogCollection.find(query);
      const result = await blog.toArray();
      res.send(result);
    });
    app.get("/blog/latest-blog", async (req, res) => {
      const blog = BlogCollection.find({});
      const result = await blog.limit(10).toArray();
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const users = await userCollection.find({});
      const result = await users.toArray();
      res.send(result);
    });
    app.get("/users/administration/role", async (req, res) => {
      const query = { role: "admin" };
      const users = await userCollection.find(query);
      const result = await users.toArray();
      res.send(result);
    });

    app.get("/blog-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blog = await BlogCollection.findOne(query);
      res.json(blog);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.put("/blog/pending-blog/approved", async (req, res) => {
      const blog = req.body;
      const filter = { _id: ObjectId(blog.e) };
      const updateDoc = { $set: { approve: "approved" } };
      const result = await BlogCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
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
