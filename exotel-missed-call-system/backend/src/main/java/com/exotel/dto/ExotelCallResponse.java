package com.exotel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Collections;
import java.util.List;

@Data
public class ExotelCallResponse {

    @JsonProperty("RestResponse")
    private RestResponseContainer restResponse;

    @Data
    public static class RestResponseContainer {
        @JsonProperty("Calls")
        private List<ExotelCallDetail> calls;
    }

    public List<ExotelCallDetail> getCalls() {
        if (restResponse != null && restResponse.getCalls() != null) {
            return restResponse.getCalls();
        }
        return Collections.emptyList();
    }
}
