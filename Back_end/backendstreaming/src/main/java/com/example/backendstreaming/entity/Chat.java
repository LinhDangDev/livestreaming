package com.example.backendstreaming.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "chat")
@Data
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "stream_id", nullable = false)
    private Streams streams;

    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participants participant;

    @Column(nullable = false)
    private String message;
}