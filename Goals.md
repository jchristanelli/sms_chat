Goals


V1
- node
  - express
  - websocket
  - mongo
  - twilio
- veutify


V2
- [ ] add pagination when retreiving messages
- [ ] encryption
- [ ] implement blocking screen recording
- [ ] implement blocking browser plugins from getting the data


Lessons
- prompt
  - assume latest versions
  - use best practices
  - separate concerns


# Planning
- Websocket refresh 
  - Long Poll refresh 
  - Best practice for code orginization
- Twilio API Docs 
- Find local (no account needed) self-host (like original ngrok)


consider removing ID and only having it on 


Message
  id
  sid
  isOutbound
  text
  timestamp 


NewMessage
  id?
  phoneNumber
  text
  timestamp?



# Decisions
[ ] ID on data transfer object only






Multiple chats on the side bar
  Store as one person with many 
  Or individual
  




 const io = new Server(server, {
    cors: {
      origin: '*', // Change to your frontend URL in production
    },
  })