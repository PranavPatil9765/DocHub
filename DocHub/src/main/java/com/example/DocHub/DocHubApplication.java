package com.example.DocHub;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class DocHubApplication {

    @Bean
   CommandLineRunner test(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                if (result != null && result == 1) {
                    System.out.println("✅ Connected to PostgreSQL successfully!");
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to connect to PostgreSQL: " + e.getMessage());
            }
        };
    }


    public static void main(String[] args) {
        System.out.println("Starting DocHub Apafawfplication... wdaw");
        SpringApplication.run(DocHubApplication.class, args);
    }
}