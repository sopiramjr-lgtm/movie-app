package com.movie_app.movie_app_api.device.service.impl;

import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.device.dto.response.DeviceResponse;
import com.movie_app.movie_app_api.device.entity.Device;
import com.movie_app.movie_app_api.device.mapper.DeviceMapper;
import com.movie_app.movie_app_api.device.repository.DeviceRepository;
import com.movie_app.movie_app_api.device.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceMapper deviceMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DeviceResponse> getUserDevices(String keycloakId) {
        return deviceRepository.findByUser_KeycloakIdOrderByLastActiveAtDesc(keycloakId).stream()
                .map(deviceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void removeDevice(String keycloakId, UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        if (!device.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("You cannot remove a device that does not belong to you");
        }

        // TODO: In a complete implementation, you should also call Keycloak's API here
        // to invalidate the actual refresh token associated with this device.

        deviceRepository.delete(device);
    }
}