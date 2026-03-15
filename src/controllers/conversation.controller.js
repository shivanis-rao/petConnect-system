import db from '../../models/index.js';
const { Conversation, Message, User, Pet, Shelter } = db;

// POST /api/conversations — start or get existing conversation
export const getOrCreateConversation = async (req, res) => {
  try {
    const adopter_id = req.user.id;
    const { pet_id } = req.body;

    const pet = await Pet.findByPk(pet_id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      where: { adopter_id, pet_id },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        adopter_id,
        shelter_id: pet.shelter_id,
        pet_id,
        is_anonymous: true,
        status: 'Inquiry',
      });
    }

    res.status(200).json({ data: conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/conversations — get all conversations for logged in user
export const getMyConversations = async (req, res) => {
  try {
    const user = req.user;
    const where = user.role === 'shelter'
      ? { shelter_id: user.shelter?.id }
      : { adopter_id: user.id };

    const conversations = await Conversation.findAll({
      where,
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name', 'species', 'breed', 'photo_url'],
        },
        {
          model: User,
          as: 'adopter',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          attributes: ['id', 'content', 'file_url', 'created_at', 'is_read'],
        },
      ],
      order: [['last_message_at', 'DESC']],
    });

    // Hide adopter identity if anonymous (for shelter view)
    const formatted = conversations.map((conv) => {
      const c = conv.toJSON();
      if (user.role === 'shelter' && c.is_anonymous) {
        c.adopter = {
          id: null,
          first_name: 'Anonymous',
          last_name: '',
          email: null,
        };
      }
      return c;
    });

    res.json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/conversations/:id/messages — get message history
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const conversation = await Conversation.findByPk(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    // Verify access
    const isAdopter = conversation.adopter_id === user.id;
    const isShelter = user.role === 'shelter';
    if (!isAdopter && !isShelter) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.findAll({
      where: { conversation_id: id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    // Hide sender identity if anonymous
    const formatted = messages.map((msg) => {
      const m = msg.toJSON();
      if (isShelter && conversation.is_anonymous && m.sender.role === 'adopter') {
        m.sender = { id: null, first_name: 'Anonymous', last_name: '', role: 'adopter' };
      }
      return m;
    });

    // Mark messages as read
    await Message.update(
      { is_read: true },
      {
        where: {
          conversation_id: id,
          is_read: false,
          sender_id: { [db.Sequelize.Op.ne]: user.id },
        },
      }
    );

    // Reset unread
    await conversation.update(
      isAdopter ? { adopter_unread: 0 } : { shelter_unread: 0 }
    );

    res.json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/conversations/:id/reveal — called when adoption request submitted
export const revealIdentity = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByPk(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    if (conversation.adopter_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await conversation.update({
      is_anonymous: false,
      status: 'Applied',
      adoption_request_id: req.body.adoption_request_id || null,
    });

    res.json({ message: 'Identity revealed', data: conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/conversations/:id/upload — upload image in chat
export const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    res.json({
      file_url: req.file.path,
      file_type: req.file.mimetype.startsWith('image') ? 'image' : 'file',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};