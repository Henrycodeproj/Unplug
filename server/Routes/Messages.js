import express from "express"
import isAuthenticated from '../Middleware/auth.js';
import ConversationModel from "../Models/Conversations.js";
import MessageModel from "../Models/messages.js";
import UserModel from "../Models/Users.js";
import mongoose from "mongoose";

export const router = express.Router()

router.get('/recent/all/:id', isAuthenticated, async (req, res) => {
    const currentUserId = req.params.id

    try {
        const results = await MessageModel.aggregate([
            {
                $match:{
                    $or:[
                        {senderId:mongoose.Types.ObjectId(currentUserId)},
                        {recipientId:mongoose.Types.ObjectId(currentUserId)}
                    ] 
                }
            },
            {
                $group:{
                _id:"$conversationId",
                date: {$max: '$createdAt'},
                recentInfo: {$last: "$$ROOT"},
                }
            },
            {
                $sort: {date: -1}
            },
            {
                $limit:5
            },
            {
                $lookup: {
                    from: "users",
                    localField: "recentInfo.recipientId",
                    foreignField: "_id",
                    as: "recieverInfo"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "recentInfo.senderId",
                    foreignField: "_id",
                    as: "senderInfo"
                }
            },
            {
                $project: {
                    'recieverInfo._id': 1,
                    'recieverInfo.username': 1,
                    'senderInfo._id': 1,
                    'senderInfo.username':1, 
                    'senderInfo.profilePicture': 1,
                    'recieverInfo.profilePicture': 1
                }
            }
        ])
        res.send(results)
    } catch (err) {
        res.send(err)
    }
})

router.post('/send/', isAuthenticated, async (req, res) =>{
    const {chatId, message, senderId, recipientId} = req.body

    const newMessage = new MessageModel({
        conversationId:chatId,
        senderId:senderId,
        message:message,
        recipientId:recipientId
    })

    const savedMessage = await newMessage.save()

    if (savedMessage) res.status(200).send({message:"Message Sent"})
})

router.get('/conversation/:convoID', isAuthenticated, async (req, res) =>{
    const currentConvoMessages = 
    await MessageModel.find({conversationId:req.params.convoID})
    .sort({ createdAt: -1 })
    .limit(10)
    res.send(currentConvoMessages.reverse())
})

router.get('/conversation/prev/:convoID/:currentNumber', isAuthenticated, async (req, res) =>{
    console.log("prev hit")
    const currentConvoMessages = 
    await MessageModel.find({ conversationId:req.params.convoID })
    .sort({ createdAt: -1 })
    .skip(req.params.currentNumber)
    .limit(5)
    res.send(currentConvoMessages.reverse())
})

router.get('/unread/:convoID/:userID', isAuthenticated, async (req, res) => {
    try {
        console.log('test')
        const user = await UserModel.findOne({_id: req.params.userID})
        console.log(user)
        if (user){
            console.log(user)
            const results = await MessageModel.find({
                conversationId: req.params.convoID,
                recipientId: user._id, 
                createdAt:{$gt: user.lastActiveDate}
            })
        if (results) res.send({results: results.length})
        }
    } catch(error) {
        console.log(error)
    }
})