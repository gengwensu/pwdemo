package com.hearst.pwdemo.controller;

import com.hearst.pwdemo.model.Group;
import com.hearst.pwdemo.model.GroupRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class GroupController {
    private final Logger log = LoggerFactory.getLogger(GroupController.class);
    private GroupRepository groupRepository;

    public GroupController(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @GetMapping("/groups")
    Collection<Group> groups() {
        return groupRepository.findAll();
    }

    @GetMapping("/groups/{id}")
    ResponseEntity<?> getGroup(@PathVariable Long id) {
        Optional<Group> groupOptional = groupRepository.findById(id);
        return groupOptional.map(r -> ResponseEntity.ok().body(r))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/groups")
    ResponseEntity<Group> createGroup(@Valid @RequestBody Group group) throws URISyntaxException {
        log.info("Request to create group: {}", group);
        Group result = groupRepository.save(group);
        return ResponseEntity.created(new URI("/api/groups/" + result.getId()))
                .body(result);
    }

    @PutMapping("/groups/{id}")
    ResponseEntity<Group> updateGroup(@Valid @RequestBody Group group, @PathVariable Long id) {
        log.info("Request to update group: {}", id);
        Optional<Group> groupOptional = groupRepository.findById(id);
        if(!groupOptional.isPresent()) return ResponseEntity.notFound().build();
        group.setId(id);
        groupRepository.save(group);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/groups/{id}")
    ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        log.info("Request to delete group: {}", id);
        groupRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
