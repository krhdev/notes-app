// Import the required modules
import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// Recreate __dirname, which doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an instance of an Express application
const app = express();

// Define the port the server will listen on
const PORT = 3001;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Define the path to the JSON file
const dataFilePath = path.join(__dirname, "data.json");

// Function to read data from the JSON file
const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
};

// Function to write data to the JSON file
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Handle GET request at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.htm"));
});

// Handle GET request to retrieve stored data
app.get("/api/data", (req, res) => {
  const data = readData();
  res.json(data);
});

// Handle PUT request to update existing data
app.put("/api/data/:id", (req, res) => {
  const currentData = readData();
  const index = currentData.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Error: Data not found" });
  }

  currentData[index] = { ...currentData[index], ...req.body };
  writeData(currentData);

  res.json({ message: "Data updated successfully  ", data: currentData[index] });
});

// Handle POST request to save new data with a unique ID
app.post("/api/data", (req, res) => {
  const newData = { id: uuidv4(), ...req.body };
  const currentData = readData();
  currentData.push(newData);
  writeData(currentData);
  res.json({ message: "Data saved successfully", data: newData });
});

// Handle POST request at the /echo route
app.post("/echo", (req, res) => {
  res.json({ received: req.body });
});

// Delete route
app.delete("/api/data/:id", (req, res) => {
  const currentData = readData();
  const newData = currentData.filter((item) => item.id !== req.params.id);

  if (newData.length === currentData.length) {
    return res.status(404).json({ message: "Error: Data not found" });
  }

  writeData(newData); // write the filtered data back to the file

  res.json({ message: "Data deleted successfully" });
});

// Wildcard route to handle undefined routes
app.all("*splat", (req, res) => {
  res.status(404).send("Route not found");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

