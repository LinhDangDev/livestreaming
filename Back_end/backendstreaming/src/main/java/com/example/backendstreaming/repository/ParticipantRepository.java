package com.example.backendstreaming.repository;

import com.example.backendstreaming.entity.Participants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backendstreaming.entity.Streams;
import java.util.List;
@Repository
public interface ParticipantRepository extends JpaRepository<Participants, Integer> {
    List<Participants> findByStreams(Streams streams);
}