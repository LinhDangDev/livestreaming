package com.example.backendstreaming.repository;

import com.example.backendstreaming.entity.Chat;
import com.example.backendstreaming.entity.Streams;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<Chat, Integer> {
    List<Chat> findAllByStreams(Streams streams);
}