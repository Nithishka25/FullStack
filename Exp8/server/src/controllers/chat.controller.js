import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export async function startConversation(req, res) {
  try {
    const { participantId, productId } = req.body;
    if (!participantId) return res.status(400).json({ error: 'participantId required' });
    if (participantId === req.user.id) return res.status(400).json({ error: 'Cannot start a chat with yourself' });

    let convo = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] },
      ...(productId ? { product: productId } : {}),
    });

    if (!convo) {
      convo = await Conversation.create({ participants: [req.user.id, participantId], product: productId });
    }

    res.status(201).json({ conversation: convo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getConversations(req, res) {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name avatarUrl')
      .populate('product', 'title price images');
    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getMessages(req, res) {
  try {
    const { id } = req.params; // conversation id
    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ error: 'Not found' });
    if (!convo.participants.map(p => p.toString()).includes(req.user.id)) return res.status(403).json({ error: 'Forbidden' });

    const messages = await Message.find({ conversation: id }).sort({ createdAt: 1 }).populate('sender', 'name avatarUrl');
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function sendMessage(req, res) {
  try {
    const { id } = req.params; // conversation id
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Message body required' });

    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ error: 'Not found' });
    if (!convo.participants.map(p => p.toString()).includes(req.user.id)) return res.status(403).json({ error: 'Forbidden' });

    const message = await Message.create({ conversation: id, sender: req.user.id, body });
    convo.lastMessageAt = new Date();
    await convo.save();

    // Emit via Socket.io to room = conversation id
    const io = req.app.get('io');
    io.to(id).emit('chat:message', {
      conversationId: id,
      message: {
        id: message._id,
        body: message.body,
        sender: req.user.id,
        createdAt: message.createdAt,
      },
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
