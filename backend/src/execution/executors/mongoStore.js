import mongoose from "mongoose";

const mongoStore = async (node, input) => {
  const collectionName = node.data?.collectionName || "workflow_results";

  const collection = mongoose.connection.collection(collectionName);

  const result = await collection.insertOne({
    input,
    storedAt: new Date(),
  });

  return {
    insertedId: result.insertedId,
    input,
  };
};

export default mongoStore;