package com.mehfil.artist;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "categories") @Getter @Setter @NoArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    private String slug;
}
