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
    private String imageUrl;
    private Double latitude;
    private Double longitude;

    public Court() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCity() { return city; }
    public Boolean getOutdoor() { return outdoor; }
    public String getImageUrl() { return imageUrl; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }

    public void setName(String name) { this.name = name; }
    public void setCity(String city) { this.city = city; }
    public void setOutdoor(Boolean outdoor) { this.outdoor = outdoor; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}