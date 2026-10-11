package com.mehfil.artist;

import com.mehfil.auth.MembershipService;
import com.mehfil.auth.User;
import com.mehfil.auth.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class EventBookingController {
    private final JdbcClient db; private final UserRepository users; private final MembershipService memberships;
    public record BookingReq(@Min(1) @Max(10) int quantity) {}

    @PostMapping("/events/{id}/book") @PreAuthorize("hasRole('CUSTOMER')")
    public Map<String,Object> book(@AuthenticationPrincipal Long uid,@PathVariable long id,@Valid @RequestBody BookingReq r) {
        User u=users.findById(uid).orElseThrow();
        var rows=db.sql("select id,ticket_price as price from events where id=:id and starts_at>now()").param("id",id).query().listOfRows();
        if(rows.isEmpty()) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND,"Event not found or already started");
        Object rawPrice=rows.get(0).get("price"); int price=rawPrice==null?0:((Number)rawPrice).intValue(); int discount=memberships.discount(u);
        int unit=Math.max(0, price - Math.round(price*discount/100f)); int total=unit*r.quantity();
        Long bid=db.sql("insert into event_bookings(event_id,user_id,quantity,unit_price,discount_percent,total_amount) values(:e,:u,:q,:p,:d,:t) returning id")
            .param("e",id).param("u",uid).param("q",r.quantity()).param("p",unit).param("d",discount).param("t",total).query(Long.class).single();
        return Map.of("bookingId",bid,"originalUnitPrice",price,"unitPrice",unit,"discountPercent",discount,"totalAmount",total,"status","PENDING_PAYMENT");
    }

    @GetMapping("/me/bookings")
    public List<Map<String,Object>> mine(@AuthenticationPrincipal Long uid){
        return db.sql("select b.id,b.quantity,b.unit_price as \"unitPrice\",b.discount_percent as \"discountPercent\",b.total_amount as \"totalAmount\",b.status,b.created_at as \"createdAt\",e.title,e.city,e.starts_at as \"startsAt\",a.stage_name as \"artistName\" from event_bookings b join events e on e.id=b.event_id join artist_profiles a on a.id=e.artist_id where b.user_id=:u order by b.created_at desc")
            .param("u",uid).query().listOfRows();
    }
}
