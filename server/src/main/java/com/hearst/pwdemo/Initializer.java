package com.hearst.pwdemo;

import com.hearst.pwdemo.model.PWTokenResponse;
import com.hearst.pwdemo.model.Group;
import com.hearst.pwdemo.model.GroupRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.stream.Stream;

@Component
public class Initializer implements CommandLineRunner {
    private final GroupRepository repository;

    public Initializer(GroupRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... strings) {
        Stream.of("Macy's", "Chase Bank", "Con Edison",
                "Geico").forEach(name -> repository.save(new Group(name)));

        repository.findAll().forEach(System.out::println);
    }
}
