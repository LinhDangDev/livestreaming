package com.example.backendstreaming.repository;

import com.example.backendstreaming.entity.Participants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantRepository extends JpaRepository<Participants, Integer> {
}