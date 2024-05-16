const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000 ;


// cors options
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};

// middleware 
app.use(cors(corsOptions));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@muhammadcluster.h7migjc.mongodb.net/?retryWrites=true&w=majority&appName=MuhammadCluster`;

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

    


    const allFoodsCollection = client.db("muhammadCuisine").collection("allFoods");
    const purchaseFoodCollection = client.db("muhammadCuisine").collection("purchaseFoods");
    const galleryCollection = client.db("muhammadCuisine").collection("gallery");
    const reviewsCollection = client.db("muhammadCuisine").collection("userReviews");


    // get all cards data of gallery from database
    app.get('/allFoods', async(req,res)=>{
       
      const search = req.query.search;
      // console.log(search);
      let query ={};
      if(search){
         query = {
           food_name: {$regex: search, $options:'i'}
         }
      }
      // sorting to find top selling foods
       const sort = req.query.sort
      //  console.log(sort);
       let options = {}
       if(sort){
         options = {
          sort:{purchase_count: -1 }  
        }
       }
       const result = await allFoodsCollection.find(query,options).toArray();
       res.send(result);
    })

    
    // get single food item data from database
    app.get('/food/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await allFoodsCollection.findOne(query)
      res.send(result);
   })


    // get all cards data of gallery from database
    app.get('/gallery', async(req,res)=>{
       const result = await galleryCollection.find().toArray();
      //  console.log(result)
       res.send(result);
    })

    // get all cards data of gallery from database
    app.get('/reviews', async(req,res)=>{
       const result = await reviewsCollection.find().toArray();
       res.send(result);
    })


    // put user's food item to allFoods collection in database
    app.post('/addFood', async(req,res)=>{
       const newFood = req.body;
       console.log(newFood)
       const result = await allFoodsCollection.insertOne(newFood);
       res.send(result);
    })
    
    // put user purchase food item to purchaseFoodCollection  in database
    app.post('/addPurchaseFood', async(req,res)=>{
      const  id = req.query.id
      const purchase_quantity =parseInt(req.query.quantity);
       console.log( purchase_quantity)

      const query = {_id: new ObjectId(id)}
      const options = {
         $inc: { quantity: -purchase_quantity, purchase_count: 1 }
      }
      console.log(options);
      const purchaseFood = req.body;
       console.log(purchaseFood)
       const result = await purchaseFoodCollection.insertOne(purchaseFood);
       
       const updateCount =   await allFoodsCollection.updateOne(query,options)
       console.log(updateCount)
       res.send(result);
    })
    


    // put user feedback to gallery collection in database
    app.post('/gallery', async(req,res)=>{
       const cardInfo = req.body;
       const result = await galleryCollection.insertOne(cardInfo);
       res.send(result);
    })
    
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('My Muhammad Cuisine server is running here!')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})