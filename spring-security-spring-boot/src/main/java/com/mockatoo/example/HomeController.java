package com.mockatoo.example;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import tools.jackson.databind.json.JsonMapper;

@Controller
class HomeController {

    // The session panel shows identity attributes and standard OIDC claims.
    private static final List<String> SESSION_ATTRIBUTES = List.of(
            "sub", "id", "name", "given_name", "family_name", "login", "username", "preferred_username",
            "email", "email_verified", "verified", "picture", "locale",
            "iss", "aud", "iat", "exp", "auth_time", "amr", "acr", "hd", "tid");

    private final List<ClientRegistration> providers;
    private final JsonMapper json;

    HomeController(InMemoryClientRegistrationRepository registrations, JsonMapper json) {
        var providers = new ArrayList<ClientRegistration>();
        registrations.forEach(providers::add);
        providers.sort(Comparator.comparing(ClientRegistration::getClientName));
        this.providers = List.copyOf(providers);
        this.json = json;
    }

    @GetMapping("/")
    String home(Authentication authentication, Model model) {
        model.addAttribute("providers", providers);
        if (authentication instanceof OAuth2AuthenticationToken login) {
            var user = login.getPrincipal();
            Map<String, Object> attributes = new LinkedHashMap<>();
            for (String name : SESSION_ATTRIBUTES) {
                Object value = user.getAttribute(name);
                if (value != null) {
                    attributes.put(name, value);
                }
            }
            Map<String, Object> session = new LinkedHashMap<>();
            session.put("provider", login.getAuthorizedClientRegistrationId());
            session.put(user instanceof OidcUser ? "claims" : "profile", attributes);
            model.addAttribute("sessionJson", json.writerWithDefaultPrettyPrinter().writeValueAsString(session));
        }
        return "home";
    }
}
