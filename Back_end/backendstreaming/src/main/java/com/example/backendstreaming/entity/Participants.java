package com.example.backendstreaming.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "participants")
@Data
public class Participants {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "stream_id", nullable = false)
    private Streams streams;

    @Column(nullable = false)
    private String ipAddress;

    private String displayName;

    @Enumerated(EnumType.STRING)
    private String role;
}