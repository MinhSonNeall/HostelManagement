package model;

import java.sql.Timestamp;

public class Hostel {
    private int hostelId;
    private int ownerId;
    private String hostelName;
    private String address;
    private String ward;
    private String district;
    private String city;
    private String description;
    private String backgroundImg;
    private int totalFloors;
    private int totalRooms;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Hostel() {}

    public int getHostelId() { return hostelId; }
    public void setHostelId(int hostelId) { this.hostelId = hostelId; }
    public int getOwnerId() { return ownerId; }
    public void setOwnerId(int ownerId) { this.ownerId = ownerId; }
    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBackgroundImg() { return backgroundImg; }
    public void setBackgroundImg(String backgroundImg) { this.backgroundImg = backgroundImg; }
    public int getTotalFloors() { return totalFloors; }
    public void setTotalFloors(int totalFloors) { this.totalFloors = totalFloors; }
    public int getTotalRooms() { return totalRooms; }
    public void setTotalRooms(int totalRooms) { this.totalRooms = totalRooms; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
