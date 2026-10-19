import { handleChatMessage } from '../chatbot/responder.js';

export const chat = async (req, res) => {
  try {
    const { message, hospitalId } = req.body;
    const userId = req.user ? req.user.id : null;

    const result = await handleChatMessage(message, userId, hospitalId);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({
      success: false,
      error: 'Sorry, I am having trouble fetching hospital records right now. Please call 108 or contact the hospital directly.',
    });
  }
};
