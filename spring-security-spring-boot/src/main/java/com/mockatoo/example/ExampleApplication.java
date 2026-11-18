package com.mockatoo.example;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.endpoint.PkceParameterNames;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

import static org.springframework.http.HttpMethod.POST;

@SpringBootApplication
public class ExampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExampleApplication.class, args);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository registrations) {
        return http
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/", "/style.css", "/mockatoo-logo.png", "/providers/*.svg").permitAll()
                        .anyRequest().authenticated())
                // Spring still validates OAuth state on Apple's cross-site callback.
                .csrf(csrf -> csrf.ignoringRequestMatchers(
                        PathPatternRequestMatcher.withDefaults().matcher(POST, "/login/oauth2/code/apple")))
                .oauth2Login(login -> login
                        .loginPage("/")
                        .failureUrl("/?error")
                        .authorizationEndpoint(endpoint -> endpoint
                                .authorizationRequestResolver(authorizationRequests(registrations)))
                        .userInfoEndpoint(userInfo -> userInfo.userService(oauth2Users())))
                .build();
    }

    private DefaultOAuth2AuthorizationRequestResolver authorizationRequests(ClientRegistrationRepository registrations) {
        var resolver = new DefaultOAuth2AuthorizationRequestResolver(registrations, "/oauth2/authorization");
        resolver.setAuthorizationRequestCustomizer(request -> {
            String provider = request.build().getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
            if ("apple".equals(provider) || "linkedin".equals(provider)) {
                // These web flows do not support PKCE.
                request.attributes(attributes -> attributes.remove(PkceParameterNames.CODE_VERIFIER));
                request.additionalParameters(parameters -> {
                    parameters.remove(PkceParameterNames.CODE_CHALLENGE);
                    parameters.remove(PkceParameterNames.CODE_CHALLENGE_METHOD);
                });
            }
            if ("apple".equals(provider)) {
                request.additionalParameters(parameters -> parameters.put("response_mode", "form_post"));
            }
            if ("linkedin".equals(provider)) {
                // LinkedIn's web flow does not echo the requested nonce.
                request.attributes(attributes -> attributes.remove(OidcParameterNames.NONCE));
                request.additionalParameters(parameters -> parameters.remove(OidcParameterNames.NONCE));
            }
        });
        return resolver;
    }

    private DefaultOAuth2UserService oauth2Users() {
        var users = new DefaultOAuth2UserService();
        users.setAttributesConverter(request -> attributes -> {
            if ("x".equals(request.getClientRegistration().getRegistrationId())
                    && attributes.get("data") instanceof Map<?, ?> data) {
                // X nests the profile under data, including the name attribute Spring looks up.
                Map<String, Object> profile = new LinkedHashMap<>();
                data.forEach((key, value) -> profile.put(key.toString(), value));
                profile.put("email", profile.get("confirmed_email"));
                return profile;
            }
            return attributes;
        });
        return users;
    }
}
