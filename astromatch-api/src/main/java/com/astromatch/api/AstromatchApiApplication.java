package com.astromatch.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.astromatch.api.config.BillingProperties;
import com.astromatch.api.config.FeedProperties;
import com.astromatch.api.config.IdentityPolicyProperties;
import com.astromatch.api.config.OperatorProperties;
import com.astromatch.api.config.PushProperties;
import com.astromatch.api.config.JwtProperties;
import com.astromatch.api.config.RateLimitProperties;
import com.astromatch.api.config.RecoveryProperties;
import com.astromatch.api.config.SafetyProperties;
import com.astromatch.api.config.UploadProperties;

@SpringBootApplication
@EnableConfigurationProperties({ JwtProperties.class, RecoveryProperties.class, IdentityPolicyProperties.class,
		UploadProperties.class, RateLimitProperties.class, FeedProperties.class, PushProperties.class,
		BillingProperties.class, SafetyProperties.class, OperatorProperties.class })
public class AstromatchApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AstromatchApiApplication.class, args);
	}

}
