const path = require('path');
const fs = require('fs');
const StreamRecording = require('../entity/StreamRecording');

class RecordingService {
    static async updateRecordingMetadata(recordingId) {
        try {
            const recording = await StreamRecording.findByPk(recordingId);
            if (!recording) return;

            const filePath = path.join(__dirname, '../../recordings', path.basename(recording.file_url));

            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);

                await recording.update({
                    size: stats.size,
                    status: 'completed',
                    ended_at: new Date()
                });
            }
        } catch (error) {
            console.error('Error updating recording metadata:', error);
        }
    }

    static async cleanupOldRecordings(daysToKeep = 30) {
        try {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - daysToKeep);

            const oldRecordings = await StreamRecording.findAll({
                where: {
                    created_at: {
                        [Op.lt]: oldDate
                    }
                }
            });

            for (const recording of oldRecordings) {
                const filePath = path.join(__dirname, '../../recordings', path.basename(recording.file_url));
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                await recording.destroy();
            }
        } catch (error) {
            console.error('Error cleaning up old recordings:', error);
        }
    }
}

module.exports = RecordingService;
