package com.movie_app.movie_app_api.device.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record DeviceResponse(
        UUID id,
        String deviceName,
        String deviceType,
        LocalDateTime lastActiveAt
) {}