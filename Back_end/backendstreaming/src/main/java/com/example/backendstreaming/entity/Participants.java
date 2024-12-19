package com.example.backendstreaming.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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