const Stream = require('../entity/Stream');

exports.checkStreamStatus = async (req, res, next) => {
    try {
        const { streamKey } = req.params;

        const stream = await Stream.findOne({
            where: { stream_key: streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        // Kiểm tra nếu stream đã kết thúc
        if (stream.status === 'ended') {
            return res.status(403).json({
                success: false,
                error: "This stream has ended",
                status: 'ended'
            });
        }

        // Gán stream vào request để sử dụng ở middleware tiếp theo
        req.stream = stream;
        next();
    } catch (error) {
        console.error('Error checking stream status:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};
