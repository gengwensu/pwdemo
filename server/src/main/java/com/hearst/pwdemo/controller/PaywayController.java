package com.hearst.pwdemo.controller;

import com.hearst.pwdemo.model.PWTokenResponse;
import org.springframework.http.HttpHeaders;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/pwbillpayments")
public class PaywayController {
    private final Logger log = LoggerFactory.getLogger(PaywayController.class);
    final private List<String> paymentTypes = new ArrayList<>(Arrays.asList("CreditCard", "ApplePay"));
    private String url = "https://devedgilpayway.net/PaywayWS/Payment/";

    @GetMapping("/")
    Collection<String> getPaymentTypes() {
        return paymentTypes;
    }

    @GetMapping("/{paymentType}")
    ResponseEntity<?> getPWTokenForTypeWithAmount(@PathVariable String paymentType, @RequestParam Long amount) {
        CloseableHttpClient httpClient
                = HttpClients.custom()
                .setSSLHostnameVerifier(new NoopHostnameVerifier())
                .build();
        HttpComponentsClientHttpRequestFactory requestFactory
                = new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);

        RestTemplate restTemplate = new RestTemplate(requestFactory);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        PWTokenResponse response = new PWTokenResponse();
        JSONObject request = new JSONObject("{\"request\": \"queueSale\",\"userName\":\"hearstrestwsdev\",\"password\":\"hearstrestwsdev1!\"}");
        if (paymentType.equalsIgnoreCase("CreditCard")) {
            JSONObject cardTxn = new JSONObject("{\"idSource\":11}");
            cardTxn.put("amount", amount);
            request.put("cardTransaction", cardTxn);
            log.info("Before Post, url : {}", url + paymentType);
            log.info("payload : {}", request.toString());
            HttpEntity<String> req = new HttpEntity<String>(request.toString(), headers);
            response = restTemplate.postForObject(url + paymentType, req, PWTokenResponse.class);
            log.info("response from PaywayWS: {}", response.toString());
            response.setIdSource(11);
            response.setIdDivision(7);
            response.setPaymentType(paymentType);
            response.setAmount(amount);
            log.info("response sent to FE: {}", response.toString());
        }

        return ResponseEntity.ok().body(response);
    }
}
