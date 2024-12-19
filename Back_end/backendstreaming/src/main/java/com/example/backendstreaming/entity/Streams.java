package com.example.backendstreaming.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "streams")
@Data
public class Streams {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String streamKey;

    private String streamerName;

    @Enumerated(EnumType.STRING)
    private String status;
}