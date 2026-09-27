package com.movie_app.movie_app_api.payment.service;

import kh.gov.nbc.bakong_khqr.BakongKHQR;
import kh.gov.nbc.bakong_khqr.model.*;
import com.movie_app.movie_app_api.payment.config.KhqrProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KhqrService {

    private final KhqrProperties properties;

    public String generateQrString(double amountUsd, String billNumber) {
        String account = properties.getAccount() != null ? properties.getAccount().trim() : "sorn_sophiram@bkrt";
        String merchantName = properties.getMerchantName() != null ? properties.getMerchantName().trim() : "KhmerFlix";
        if (merchantName.length() > 25) {
            merchantName = merchantName.substring(0, 25);
        }

        String merchantCity = properties.getMerchantCity() != null ? properties.getMerchantCity().trim() : "Phnom Penh";
        if (merchantCity.length() > 15) {
            merchantCity = merchantCity.substring(0, 15);
        }

        // Bill number must be max 25 characters per EMVCo/Bakong spec
        String safeBill = billNumber != null ? billNumber.replace("-", "").trim() : "BILL" + System.currentTimeMillis();
        if (safeBill.length() > 25) {
            safeBill = safeBill.substring(0, 25);
        }

        String storeLabel = properties.getStoreLabel() != null ? properties.getStoreLabel().trim() : "KhmerFlix";
        if (storeLabel.length() > 25) {
            storeLabel = storeLabel.substring(0, 25);
        }

        try {
            // Bakong account IDs with '@' (e.g. sorn_sophiram@bkrt) use IndividualInfo
            IndividualInfo individualInfo = new IndividualInfo();
            individualInfo.setBakongAccountId(account);
            individualInfo.setMerchantName(merchantName);
            individualInfo.setMerchantCity(merchantCity);
            individualInfo.setCurrency(KHQRCurrency.USD);
            individualInfo.setAmount(amountUsd);
            individualInfo.setBillNumber(safeBill);
            individualInfo.setStoreLabel(storeLabel);
            individualInfo.setTerminalLabel("WEB");
            // Dynamic QR requires expirationTimestamp (13-digit epoch ms, must be future)
            individualInfo.setExpirationTimestamp(System.currentTimeMillis() + 30 * 60 * 1000L);

            KHQRResponse<KHQRData> response = BakongKHQR.generateIndividual(individualInfo);

            if (response.getData() != null && response.getData().getQr() != null) {
                log.info("Successfully generated Bakong KHQR for account: {} (Amount: ${})", account, amountUsd);
                return response.getData().getQr();
            }

            String errMsg = response.getKHQRStatus() != null ? response.getKHQRStatus().getMessage() : "Unknown";
            log.warn("BakongKHQR.generateIndividual returned error: {}. Trying MerchantInfo...", errMsg);

            // Fallback to MerchantInfo if individual was rejected
            MerchantInfo merchantInfo = new MerchantInfo();
            merchantInfo.setBakongAccountId(account);
            merchantInfo.setMerchantId("000000");
            merchantInfo.setAcquiringBank("Bakong");
            merchantInfo.setMerchantName(merchantName);
            merchantInfo.setMerchantCity(merchantCity);
            merchantInfo.setStoreLabel(storeLabel);
            merchantInfo.setBillNumber(safeBill);
            merchantInfo.setTerminalLabel("WEB");
            merchantInfo.setAmount(amountUsd);
            merchantInfo.setCurrency(KHQRCurrency.USD);
            merchantInfo.setExpirationTimestamp(System.currentTimeMillis() + 30 * 60 * 1000L);

            KHQRResponse<KHQRData> mResponse = BakongKHQR.generateMerchant(merchantInfo);
            if (mResponse.getData() != null && mResponse.getData().getQr() != null) {
                log.info("Successfully generated Bakong Merchant KHQR for account: {}", account);
                return mResponse.getData().getQr();
            }

            String mErr = mResponse.getKHQRStatus() != null ? mResponse.getKHQRStatus().getMessage() : "Merchant generation failed";
            throw new RuntimeException("Failed to generate KHQR: " + mErr);

        } catch (Exception ex) {
            log.error("Exception generating Bakong KHQR for account {}: {}", account, ex.getMessage(), ex);
            throw new RuntimeException("Failed to generate KHQR: " + ex.getMessage(), ex);
        }
    }
}
