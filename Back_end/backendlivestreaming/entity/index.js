const Stream = require('./Stream');
const Participant = require('./Participant');
const Chat = require('./chat');
const Attachment = require('./attachments');
const BannedParticipant = require('./BannedParticipants');

// Stream - Participant
Stream.hasMany(Participant, { foreignKey: 'stream_id' });
Participant.belongsTo(Stream, { foreignKey: 'stream_id' });

// Stream - Chat
Stream.hasMany(Chat, { foreignKey: 'stream_id' });
Chat.belongsTo(Stream, { foreignKey: 'stream_id' });

// Participant - Chat
Participant.hasMany(Chat, { foreignKey: 'participant_id' });
Chat.belongsTo(Participant, { foreignKey: 'participant_id' });

// Chat - Attachment
Chat.hasOne(Attachment, { foreignKey: 'chat_id' });
Attachment.belongsTo(Chat, { foreignKey: 'chat_id' });

// Stream - BannedParticipant
Stream.hasMany(BannedParticipant, { foreignKey: 'stream_id' });
BannedParticipant.belongsTo(Stream, { foreignKey: 'stream_id' });

// Participant - BannedParticipant
Participant.hasMany(BannedParticipant, { foreignKey: 'participant_id' });
BannedParticipant.belongsTo(Participant, { foreignKey: 'participant_id' });

// Participant (banner) - BannedParticipant
Participant.hasMany(BannedParticipant, { foreignKey: 'banned_by', as: 'BannedUsers' });
BannedParticipant.belongsTo(Participant, { foreignKey: 'banned_by', as: 'Banner' });

module.exports = {
    Stream,
    Participant,
    Chat,
    Attachment,
    BannedParticipant
};
