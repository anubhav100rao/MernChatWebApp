const express = require('express');
const connectDb = require('./connection')
const path = require('path')
require("dotenv").config();
const app = express();
const userRoutes = require("./routes/userRoutes")
const socketIO = require('socket.io');
const Message = require('./models/Message');

const rooms = ['general', 'tech', 'finance', 'crypto'];
const cors = require('cors');

if(process.env.NODE_ENV === "production") {
    app.use(express.static('build'))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
    })
}

app.use(
    express.urlencoded({
        extended: true
    })
);
app.use(express.json());
app.use(cors());


app.use('/users', userRoutes);

const http = require('http');
const User = require('./models/User');
const server = http.createServer(app);




const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})


async function getLastMessagesFromRoom(room) {
    let roomMessages = await Message.aggregate([
        {$match: {to: room}},
        {$group: {_id: '$date', messagesByDate: {$push: '$$ROOT'}}}
    ])
    // console.log(roomMessages[0].messagesByDate, "from ulitmate universe")
    return roomMessages;
}

async function sortRoomMessagesByDate(messages) {
    return messages.sort(function(a, b) {
        let date1 = a._id.split('/');
        let date2 = b._id.split('/');
        date1 = date1[2] + date1[0] + date1[1];
        date2 = date2[2] + date2[0] + date2[1];
        return date1 < date2 ? -1 : 1;
    })
}
// socket connections


io.on('connection', (socket) => {

    socket.on('new-user', async() => {
        const members = await User.find();
        io.emit('new-user', members);
    })

    socket.on('join-room', async(newRoom, previousRoom) => {
        socket.join(newRoom)
        socket.leave(previousRoom)
        let roomMessages = await getLastMessagesFromRoom(newRoom);
        roomMessages = await sortRoomMessagesByDate(roomMessages);
        socket.emit('room-messages', roomMessages);
    })

    socket.on('message-room', async(room, content, sender, time, date) => {
        const newMessage = await Message.create({
            content,
            from: sender,
            time,
            date,
            to: room
        });
        
        // await newMessage.save();
        let roomMessages = await getLastMessagesFromRoom(room);
        roomMessages = await sortRoomMessagesByDate(roomMessages);
        // sending messages to room
        io.to(room).emit('room-messages', roomMessages);

        socket.broadcast.emit('notifications', room)
    })

    app.delete('/logout', async(req, res) => {

        try {
            const { _id, newMessage } = req.body;
            const user = await User.findById(_id);
            user.status = "offline";
            user.newMessage = newMessage;
            await user.save();
            const members = await User.find();
            socket.broadcast.emit('new-user', members);
            res.status(200).send();
        } catch (error) {
            console.log(error)
            res.status(400).send();
        }
    })
})

app.get('/rooms', (req, res) => {
    res.json(rooms)
})


app.get("*", (req, res) => {
    res.json({
        error: "error no such route exists",
        msg: "bhai koi acha route use krle (Please try some other route)"
    })
})

const start = async() => {
    try {
        await connectDb(process.env.MONGO_URI)
        console.log("MONGODB connected...")
        server.listen(process.env.PORT, () => {
            console.log(`Server starting listening on http://localhost:${process.env.PORT}/`)
        })
    } catch(err) {
        console.log(err)
    }
}

start()