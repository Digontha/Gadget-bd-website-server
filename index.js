const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());


app.get("/",(req,res)=>{
   res.send("Hello World!");
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jp082z4.mongodb.net/?retryWrites=true&w=majority`;

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
 
    await client.connect();
  
    const productCollection = client.db("productDB").collection("product")
     
    const CartProductCollection = client.db("productDB").collection("CartProductDB")

    app.post("/product",async(req, res) => {
        const data = req.body;
        const result = await productCollection.insertOne(data);
        res.send(result);
    });
 
    app.get("/product",async(req, res) => {
          const cursor = productCollection.find()
          const result = await cursor.toArray()
          res.send(result);          
    });

    app.get("/product/:brand_name", async (req, res) => {
      const brand = req.params.brand_name;
      const query = { brand_name: brand};
      const result = await productCollection.find(query).toArray();
      res.json(result);
    });
    
    app.get("/product/brand_name/:id", async (req, res) => {
          const id = req.params.id;
          const query = {_id: new ObjectId(id)}
          const result = await productCollection.findOne(query)
          res.send(result);

    });

    app.put("/product/brand_name/:id", async (req, res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const data = req.body;
        const UpdateResult = {
          $set:{
            name : data.name, 
            brand_name : data.brand_name, 
            price : data.price, 
            type : data.type, 
            rating : data.rating, 
            img : data.img
          }
        }
        const result = await productCollection.updateOne(filter,UpdateResult,options)
        res.send(result);
    });


   app.post("/details/brand_name/id/cart", async (req, res) =>{         
    const data = req.body;
    const result = await CartProductCollection.insertOne(data)
    res.send(result); 
   });

  app.get("/details/brand_name/id/cart", async(req,res) =>{
           const cursor = CartProductCollection.find()
           const result = await cursor.toArray()
           res.send(result);
  });

 app.delete("/details/brand_name/id/cart/:id", async(req,res)=>{
              const id = req.params.id
              const query = {_id:id}
              const result = await CartProductCollection.deleteOne(query)
              res.send(result);
 })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port,()=>{
    console.log(`listening on ${port}`);
});