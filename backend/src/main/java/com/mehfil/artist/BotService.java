package com.mehfil.artist;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** The platform bot: posts a weekly-roundup news item and sends "live tomorrow" reminders to followers. */
@Component @EnableScheduling @RequiredArgsConstructor
public class BotService {
    private final JdbcClient db;

    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Kolkata")
    public void daily() {
        long n = db.sql("select count(*) from events where starts_at between now() and now() + interval '7 days'").query(Long.class).single();
        if (n > 0) db.sql("insert into news (headline, body) values (:h, :b)")
            .param("h", "🗓️ " + n + (n == 1 ? " live event" : " live events") + " coming up this week")
            .param("b", "See who is performing near you.").update();
        db.sql("""
            insert into notifications (user_id, text, link)
            select f.user_id, a.stage_name || ' is live tomorrow: ' || e.title, '#/event/' || e.id
            from events e join artist_profiles a on a.id = e.artist_id join follows f on f.artist_id = e.artist_id
            where e.starts_at between now() and now() + interval '24 hours'""").update();
    }
}
