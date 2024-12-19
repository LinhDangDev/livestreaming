package com.example.backendstreaming.controller;

import com.example.backendstreaming.entity.Chat;
import com.example.backendstreaming.entity.Participants;
import com.example.backendstreaming.entity.Streams;
import com.example.backendstreaming.repository.ChatMessageRepository;
import com.example.backendstreaming.repository.ParticipantRepository;
import com.example.backendstreaming.repository.StreamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.apache.commons.lang3.RandomStringUtils;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/streams")
public class StreamController {

    @Autowired
    private StreamRepository streamRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private RestTemplate restTemplate;


    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createStream(@RequestBody Map<String, String> request) {
        // ... (logic của bạn, ví dụ generate streamKey)
        // ... (lưu stream vào database)

        // Ví dụ:
        String streamKey = generateStreamKey(); // Hàm tự định nghĩa
        String streamName = request.get("streamName");
        String description = request.get("description");

        Streams stream = new Streams();
        stream.setStreamKey(streamKey);
        stream.setStreamerName(streamName); // Hoặc một trường khác cho tên stream
        // ... (các trường khác)
        streamRepository.save(stream);

        Map<String, Object> response = new HashMap<>();
        response.put("streamKey", streamKey);
        // ... (các trường khác)
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{streamKey}")
    public ResponseEntity<Streams> getStream(@PathVariable String streamKey) {
        Optional<Streams> stream = streamRepository.findByStreamKey(streamKey);
        return stream.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{streamKey}")
    public ResponseEntity<?> deleteStream(@PathVariable String streamKey) {
        Streams stream = streamRepository.findByStreamKey(streamKey);
        if (stream == null) {
            return ResponseEntity.notFound().build();
        }

        // Lưu lại các tin nhắn và thông tin khác
        List<Chat> chatMessages = chatMessageRepository.findAllByStreams(stream);
        // Lưu chatMessages vào nơi lưu trữ khác nếu cần

        // Xóa các participant
        List<Participants> participants = participantRepository.findByStreams(stream);
        participantRepository.deleteAll(participants);

        // Xóa stream
        streamRepository.delete(stream);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/{streamKey}/join")
    public ResponseEntity<Map<String, Object>> joinStream(@PathVariable String streamKey, @RequestBody Map<String, String> request) {
        // ... (logic của bạn, kiểm tra xem người dùng đã tham gia chưa)

        // ... (lưu participant vào database)
        Streams stream = streamRepository.findByStreamKey(streamKey);
        if (stream == null) {
            return ResponseEntity.badRequest().body(null);
        }

        String displayName = request.get("displayName");
        Participants participant = new Participants();
        participant.setStreams(stream);
        participant.setDisplayName(displayName);
        participant.setIpAddress("null");
        participant.setRole("VIEWER");



        Participants savedParticipant = participantRepository.save(participant);

        Map<String, Object> response = new HashMap<>();
        response.put("participantId", savedParticipant.getId());
        response.put("displayName", savedParticipant.getDisplayName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{streamKey}/leave/{participantId}")
    public ResponseEntity<?> leaveStream(@PathVariable String streamKey, @PathVariable Integer participantId) {
        // ... (logic xóa participant khỏi stream)
        participantRepository.deleteById(participantId);
        return ResponseEntity.ok().build();


    }


    @PostMapping("/{streamKey}/chat")
    public ResponseEntity<Chat> sendMessage(@PathVariable String streamKey, @RequestBody Map<String, String> request) {
        Integer participantId = Integer.valueOf(request.get("participantId"));
        String message = request.get("message");


        Optional<Participants> participant = participantRepository.findById(participantId);
        Streams streams = streamRepository.findByStreamKey(streamKey);

        Chat chat = new Chat();
        chat.setStreams(streams);
        chat.setParticipant(participant.get());
        chat.setMessage(message);

        chatMessageRepository.save(chat);
        return ResponseEntity.status(HttpStatus.CREATED).body(chat);
    }

    @GetMapping("/{streamKey}/chat")
    public ResponseEntity<List<Chat>> getChatMessages(@PathVariable String streamKey) {
        // ... (logic lấy lịch sử tin nhắn, có thể thêm phân trang)
        Streams streams = streamRepository.findByStreamKey(streamKey);
        List<Chat> chat = chatMessageRepository.findAllByStreams(streams);

        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{streamKey}/whip-url")
    public ResponseEntity<Map<String, Object>>  getWhipUrl(@PathVariable String streamKey) {
        // ... (logic giao tiếp với Node.js server để lấy whipUrl)

        String nodejsApiUrl = "http://localhost:8080/api/streams/" + streamKey; // Thay đổi port nếu cần

        ResponseEntity<Map> responseEntity = restTemplate.getForEntity(nodejsApiUrl, Map.class);

        if (responseEntity.getStatusCode().is2xxSuccessful()) {
            Map<String, Object> response = new HashMap<>();
            response.put("whipUrl", responseEntity.getBody().get("whipUrl"));
            return ResponseEntity.ok(response);
        } else {
            // Xử lý lỗi khi gọi API Node.js
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }




    private String generateStreamKey() {
        String randomKey = RandomStringUtils.randomAlphabetic(6);
        return "localhost:8081/" + randomKey;
    }
}