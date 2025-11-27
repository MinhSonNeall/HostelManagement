package model;

import java.sql.Timestamp;

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
}
