package com.movie_app.movie_app_api.device.service;

import com.movie_app.movie_app_api.device.dto.response.DeviceResponse;

import java.util.List;
import java.util.UUID;

public interface DeviceService {
    List<DeviceResponse> getUserDevices(String keycloakId);
    void removeDevice(String keycloakId, UUID deviceId);
}