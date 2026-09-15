package com.movie_app.movie_app_api.device.mapper;

import com.movie_app.movie_app_api.device.dto.response.DeviceResponse;
import com.movie_app.movie_app_api.device.entity.Device;
import org.springframework.stereotype.Component;

@Component
public class DeviceMapper {
    public DeviceResponse toResponse(Device device) {
        if (device == null) return null;

        return DeviceResponse.builder()
                .id(device.getId())
                .deviceName(device.getDeviceName())
                .deviceType(device.getDeviceType())
                .lastActiveAt(device.getLastActiveAt())
                .build();
    }
}