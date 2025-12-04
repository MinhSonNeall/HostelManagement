package model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Room {
    private int roomId;
    private int hostelId;
    private String roomNumber;
    private int floor;
    private double areaM2;
    private double pricePerMonth;
    private double depositAmount;
    private int maxOccupants;
    private double electricityPricePerKwh;
    private double waterPricePerM3;
    private double wifiFee;
    private double parkingFee;
    private String roomStatus;
    private boolean hasAirConditioner;
    private boolean hasWaterHeater;
    private boolean hasPrivateBathroom;
    private boolean hasKitchen;
    private boolean allowPet;
    private String description;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private List<RoomPicture> pictures = new ArrayList<>();
    private RoomPicture primaryPicture;
    private String hostelName;
    private String hostelAddress;
    private String hostelWard;
    private String hostelDistrict;
    private String hostelCity;
    private Integer hostelOwnerId;
    private String hostelOwnerName;
    private String hostelOwnerEmail;
    private String hostelOwnerPhone;

    public Room() {}

    public int getRoomId() { return roomId; }
    public void setRoomId(int roomId) { this.roomId = roomId; }
    public int getHostelId() { return hostelId; }
    public void setHostelId(int hostelId) { this.hostelId = hostelId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public int getFloor() { return floor; }
    public void setFloor(int floor) { this.floor = floor; }
    public double getAreaM2() { return areaM2; }
    public void setAreaM2(double areaM2) { this.areaM2 = areaM2; }
    public double getPricePerMonth() { return pricePerMonth; }
    public void setPricePerMonth(double pricePerMonth) { this.pricePerMonth = pricePerMonth; }
    public double getDepositAmount() { return depositAmount; }
    public void setDepositAmount(double depositAmount) { this.depositAmount = depositAmount; }
    public int getMaxOccupants() { return maxOccupants; }
    public void setMaxOccupants(int maxOccupants) { this.maxOccupants = maxOccupants; }
    public double getElectricityPricePerKwh() { return electricityPricePerKwh; }
    public void setElectricityPricePerKwh(double electricityPricePerKwh) { this.electricityPricePerKwh = electricityPricePerKwh; }
    public double getWaterPricePerM3() { return waterPricePerM3; }
    public void setWaterPricePerM3(double waterPricePerM3) { this.waterPricePerM3 = waterPricePerM3; }
    public double getWifiFee() { return wifiFee; }
    public void setWifiFee(double wifiFee) { this.wifiFee = wifiFee; }
    public double getParkingFee() { return parkingFee; }
    public void setParkingFee(double parkingFee) { this.parkingFee = parkingFee; }
    public String getRoomStatus() { return roomStatus; }
    public void setRoomStatus(String roomStatus) { this.roomStatus = roomStatus; }
    public boolean isHasAirConditioner() { return hasAirConditioner; }
    public void setHasAirConditioner(boolean hasAirConditioner) { this.hasAirConditioner = hasAirConditioner; }
    public boolean isHasWaterHeater() { return hasWaterHeater; }
    public void setHasWaterHeater(boolean hasWaterHeater) { this.hasWaterHeater = hasWaterHeater; }
    public boolean isHasPrivateBathroom() { return hasPrivateBathroom; }
    public void setHasPrivateBathroom(boolean hasPrivateBathroom) { this.hasPrivateBathroom = hasPrivateBathroom; }
    public boolean isHasKitchen() { return hasKitchen; }
    public void setHasKitchen(boolean hasKitchen) { this.hasKitchen = hasKitchen; }
    public boolean isAllowPet() { return allowPet; }
    public void setAllowPet(boolean allowPet) { this.allowPet = allowPet; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public List<RoomPicture> getPictures() {
        return pictures;
    }

    public void setPictures(List<RoomPicture> pictures) {
        this.pictures = pictures;
    }

    public RoomPicture getPrimaryPicture() {
        if (primaryPicture != null) {
            return primaryPicture;
        }
        return pictures.stream()
                .filter(RoomPicture::isPrimary)
                .findFirst()
                .orElse(null);
    }

    public void setPrimaryPicture(RoomPicture primaryPicture) {
        this.primaryPicture = primaryPicture;
    }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }
    public String getHostelAddress() { return hostelAddress; }
    public void setHostelAddress(String hostelAddress) { this.hostelAddress = hostelAddress; }
    public String getHostelWard() { return hostelWard; }
    public void setHostelWard(String hostelWard) { this.hostelWard = hostelWard; }
    public String getHostelDistrict() { return hostelDistrict; }
    public void setHostelDistrict(String hostelDistrict) { this.hostelDistrict = hostelDistrict; }
    public String getHostelCity() { return hostelCity; }
    public void setHostelCity(String hostelCity) { this.hostelCity = hostelCity; }

    public Integer getHostelOwnerId() {
        return hostelOwnerId;
    }

    public void setHostelOwnerId(Integer hostelOwnerId) {
        this.hostelOwnerId = hostelOwnerId;
    }

    public String getHostelOwnerName() {
        return hostelOwnerName;
    }

    public void setHostelOwnerName(String hostelOwnerName) {
        this.hostelOwnerName = hostelOwnerName;
    }

    public String getHostelOwnerEmail() {
        return hostelOwnerEmail;
    }

    public void setHostelOwnerEmail(String hostelOwnerEmail) {
        this.hostelOwnerEmail = hostelOwnerEmail;
    }

    public String getHostelOwnerPhone() {
        return hostelOwnerPhone;
    }

    public void setHostelOwnerPhone(String hostelOwnerPhone) {
        this.hostelOwnerPhone = hostelOwnerPhone;
    }
}
