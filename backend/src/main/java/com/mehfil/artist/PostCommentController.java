package com.mehfil.artist;

import com.mehfil.auth.MembershipService;
import com.mehfil.auth.User;
import com.mehfil.auth.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class PostCommentController {
    private final JdbcClient db;
    private final UserRepository users;
    private final MembershipService memberships;
    public record CommentReq(@NotBlank @Size(max=1000) String body) {}

    @GetMapping("/posts/{id}/comments")
    public List<Map<String,Object>> comments(@PathVariable long id) {
        return db.sql("select c.id,c.body,c.created_at as \"createdAt\",u.name,u.avatar_url as \"avatarUrl\",u.membership_plan as \"membershipPlan\" from post_comments c join users u on u.id=c.user_id where c.post_id=:p order by c.created_at asc limit 100")
            .param("p",id).query().listOfRows();
    }

    @PostMapping("/posts/{id}/comments") @PreAuthorize("isAuthenticated()")
    public Map<String,Object> comment(@AuthenticationPrincipal Long uid,@PathVariable long id,@Valid @RequestBody CommentReq r) {
        User u=users.findById(uid).orElseThrow();
        if(!memberships.canComment(u)) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Plus or Pro membership is required to comment.");
        int n=db.sql("insert into post_comments(post_id,user_id,body) select id,:u,:b from posts where id=:p")
            .param("u",uid).param("b",r.body().trim()).param("p",id).update();
        if(n==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Post not found");
        return Map.of("ok",true);
    }
}
