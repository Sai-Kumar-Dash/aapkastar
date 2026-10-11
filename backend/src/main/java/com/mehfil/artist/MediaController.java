package com.mehfil.artist;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/** Stores photos in Postgres so uploads work with no third-party service. */
@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class MediaController {
    private static final Set<String> OK = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private final JdbcClient db;

    @PostMapping("/me/upload") @PreAuthorize("isAuthenticated()")
    public Map<String, String> upload(@RequestParam("file") MultipartFile f) throws Exception {
        String ct = f.getContentType() == null ? "" : f.getContentType().toLowerCase();
        if (!OK.contains(ct)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, WebP or GIF photos are supported.");
        if (f.getSize() > 6 * 1024 * 1024) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo is too large (max 6 MB).");
        String id = UUID.randomUUID().toString();
        db.sql("insert into media (id, content_type, data) values (:i, :c, :d)").param("i", id).param("c", ct).param("d", f.getBytes()).update();
        return Map.of("url", "/api/media/" + id);
    }

    @GetMapping("/media/{id}")
    public ResponseEntity<byte[]> get(@PathVariable String id) {
        var row = db.sql("select content_type, data from media where id = :i").param("i", id)
            .query((rs, n) -> Map.entry(rs.getString(1), rs.getBytes(2))).optional()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found"));
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(row.getKey()))
            .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable()).body(row.getValue());
    }
}
