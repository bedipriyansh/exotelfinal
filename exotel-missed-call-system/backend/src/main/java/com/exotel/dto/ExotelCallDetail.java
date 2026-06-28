package com.exotel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExotelCallDetail {

    @JsonProperty("Sid")
    private String sid;

    @JsonProperty("From")
    private String from;

    @JsonProperty("To")
    private String to;

    @JsonProperty("Status")
    private String status;

    @JsonProperty("Direction")
    private String direction;

    @JsonProperty("StartTime")
    private String startTime;

    @JsonProperty("EndTime")
    private String endTime;

    @JsonProperty("Duration")
    private String duration;

    @JsonProperty("DateCreated")
    private String dateCreated;
}
