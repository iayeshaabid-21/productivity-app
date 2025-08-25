const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for user
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const message = new Message({
      senderId: req.user._id,
      receiverId: req.body.receiverId,
      content: req.body.content,
    });

    await message.save();
    await message.populate('senderId', 'name avatar');
    await message.populate('receiverId', 'name avatar');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});