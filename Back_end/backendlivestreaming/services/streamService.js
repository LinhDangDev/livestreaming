const ffmpeg = require('fluent-ffmpeg');
// ...

async function createStream(req, res) {
    // ... (Logic tạo stream, generate stream key)
    // ... (Chạy FFmpeg command)
        ffmpeg()
          .input(`rtmp://localhost:1935/live/${streamKey}`) // Đầu vào RTMP
          .output(`whpp://localhost:8000/live/${streamKey}`)  //WHIP đến Node Media Server
          .complexFilter(complexFilters)
          .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
          })
          .on('error', function(err) {
            console.log('An error occurred: ' + err.message);
          })
          .on('end', function() {
            console.log('Finished processing');
          })
          .run();

    // ... (Trả về stream key)

}

// ... (Các hàm khác)


module.exports = {
    createStream,
    // ...
};
