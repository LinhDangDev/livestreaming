package com.example.backendstreaming.repository;

import com.example.backendstreaming.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<Chat, Integer> {
}