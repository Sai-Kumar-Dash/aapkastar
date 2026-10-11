package com.mehfil.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Map;

@RestController @RequestMapping("/api/membership") @RequiredArgsConstructor
public class MembershipPaymentController {
    private final UserRepository users;
    @Value("${app.razorpay-key-id:}") private String keyId;
    @Value("${app.razorpay-key-secret:}") private String keySecret;

    public record OrderReq(@NotBlank String plan) {}
    public record VerifyReq(@NotBlank String plan,@NotBlank String orderId,@NotBlank String paymentId,@NotBlank String signature) {}

    @PostMapping("/order")
    public Map<String,Object> order(@AuthenticationPrincipal Long uid,@Valid @RequestBody OrderReq r){
        int amount=switch(r.plan().toUpperCase()){case "PLUS"->49;case "PRO"->149;default->throw bad("Choose Plus or Pro");};
        if(keyId.isBlank()||keySecret.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Render.");
        try{
            Map<?,?> out=RestClient.create().post().uri("https://api.razorpay.com/v1/orders").headers(h->h.setBasicAuth(keyId,keySecret)).body(Map.of("amount",amount*100,"currency","INR","receipt","yfs_"+uid+"_"+System.currentTimeMillis())).retrieve().body(Map.class);
            return Map.of("keyId",keyId,"orderId",String.valueOf(out.get("id")),"amount",amount*100,"currency","INR","plan",r.plan().toUpperCase());
        }catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Could not create payment order.");}
    }

    @PostMapping("/verify")
    public Map<String,Object> verify(@AuthenticationPrincipal Long uid,@Valid @RequestBody VerifyReq r){
        if(keySecret.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Payment verification is not configured.");
        String payload=r.orderId()+"|"+r.paymentId();
        try{
            Mac mac=Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));
            String expected=toHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            if(!expected.equalsIgnoreCase(r.signature())) throw bad("Payment verification failed.");
            User u=users.findById(uid).orElseThrow(); u.setMembershipPlan(r.plan().toUpperCase()); u.setMembershipExpiresAt(Instant.now().plus(30,ChronoUnit.DAYS)); users.save(u);
            return Map.of("ok",true,"plan",u.getMembershipPlan(),"expiresAt",u.getMembershipExpiresAt().toString());
        }catch(ResponseStatusException e){throw e;}catch(Exception e){throw bad("Payment verification failed.");}
    }
    private static String toHex(byte[] b){StringBuilder s=new StringBuilder();for(byte x:b)s.append(String.format("%02x",x));return s.toString();}
    private static ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.BAD_REQUEST,m);}
}
