package com.rapidcart.notification.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController {

    @GetMapping("/notification/health")
    public String health() {
        return "Notification Service is running";
    }
}
