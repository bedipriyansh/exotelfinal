package com.exotel.client;

import com.exotel.config.ExotelConfig;
import com.exotel.dto.ExotelCallDetail;
import com.exotel.dto.ExotelCallResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class ExotelRestClient {

    private final RestTemplate exotelRestTemplate;
    private final ExotelConfig exotelConfig;

    /**
     * Fetch details of a single call by its Call SID.
     */
    public ExotelCallDetail fetchCallDetails(String callSid) {
        String url = String.format("%s/v1/Accounts/%s/Calls/%s.json",
                exotelConfig.getBaseUrl(), exotelConfig.getAccountSid(), callSid);

        log.info("Fetching call details from Exotel: {}", url);
        try {
            ResponseEntity<ExotelCallResponse> response = exotelRestTemplate.getForEntity(url, ExotelCallResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<ExotelCallDetail> calls = response.getBody().getCalls();
                if (calls != null && !calls.isEmpty()) {
                    return calls.get(0);
                }
            }
            log.warn("Exotel returned no details for Call SID: {}", callSid);
        } catch (Exception e) {
            log.error("Error fetching call details from Exotel for Call SID: {}", callSid, e);
        }
        return null;
    }

    /**
     * Fetch call logs from Exotel REST API.
     */
    public List<ExotelCallDetail> fetchCallLogs(int limit, int offset) {
        String url = String.format("%s/v1/Accounts/%s/Calls.json",
                exotelConfig.getBaseUrl(), exotelConfig.getAccountSid());

        URI uri = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("Limit", limit)
                .queryParam("Offset", offset)
                .build()
                .toUri();

        log.info("Fetching call logs from Exotel API: {}", uri);
        try {
            ResponseEntity<ExotelCallResponse> response = exotelRestTemplate.getForEntity(uri, ExotelCallResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getCalls();
            }
        } catch (Exception e) {
            log.error("Error fetching call logs from Exotel API", e);
        }
        return Collections.emptyList();
    }
}
