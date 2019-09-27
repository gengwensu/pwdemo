package com.hearst.pwdemo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import java.time.Instant;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PWTokenResponse {
    private String paymentType;
    private String paywayCode;
    private String paywayMessage;
    private String paywayRequestToken;
    private String transactionName;
    private int idSource;
    private int idDivision;
}
