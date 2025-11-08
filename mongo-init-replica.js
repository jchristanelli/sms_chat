// We need mongo to run as a single-node replica set to get transactions
rs.initiate( {
  _id: "rs0",
  members: [
    // Host name is required for replica set
    { _id: 0, host : "localhost:27017" }
  ]
})
