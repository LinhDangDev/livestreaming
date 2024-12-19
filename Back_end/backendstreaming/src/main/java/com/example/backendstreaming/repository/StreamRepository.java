package com.example.backendstreaming.repository;

import com.example.backendstreaming.entity.Streams;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StreamRepository extends JpaRepository<Streams, Integer> {
    Streams findByStreamKey(String streamKey);
}