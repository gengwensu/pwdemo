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

        Group macy = repository.findByName("Macy's");
        macy.setAddress("151 W 34th St");
        macy.setCity("New York");
        macy.setStateOrProvince("NY");
        macy.setCountry("USA");
        macy.setPostalCode("10001");
        macy.setAccount(12345678);
        repository.save(macy);
        Group chase = repository.findByName("Chase Bank");
        chase.setAddress("270 Park Avenue");
        chase.setCity("New York");
        chase.setStateOrProvince("NY");
        chase.setCountry("USA");
        chase.setPostalCode("10017");
        chase.setAccount(12345678);
        repository.save(chase);
        Group coned = repository.findByName("Con Edison");
        coned.setAddress("637 W 49th St");
        coned.setCity("New York");
        coned.setStateOrProvince("NY");
        coned.setCountry("USA");
        coned.setPostalCode("10019");
        coned.setAccount(12345678);
        repository.save(coned);
        Group geico = repository.findByName("Geico");
        geico.setAddress("5260 Western Ave");
        geico.setCity("Chevy Chase");
        geico.setStateOrProvince("MD");
        geico.setCountry("USA");
        geico.setPostalCode("20815");
        geico.setAccount(12345678);
        repository.save(geico);

        repository.findAll().forEach(System.out::println);
    }
}
