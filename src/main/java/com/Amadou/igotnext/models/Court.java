package com.Amadou.igotnext.models;

import jakarta.persistence.*;

@Entity
@Table(name = "courts")
public class Court {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String city;
    private Boolean outdoor = true;

    public Court() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCity() { return city; }
    public Boolean getOutdoor() { return outdoor; }

    public void setName(String name) { this.name = name; }
    public void setCity(String city) { this.city = city; }
    public void setOutdoor(Boolean outdoor) { this.outdoor = outdoor; }
}