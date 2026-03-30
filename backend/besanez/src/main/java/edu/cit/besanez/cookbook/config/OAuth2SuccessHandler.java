package edu.cit.besanez.cookbook.config;

import edu.cit.besanez.cookbook.dto.auth.LoginResponse;
import edu.cit.besanez.cookbook.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            LoginResponse loginResponse = authService.loginOrRegisterGoogleUser(oauth2User);

            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            String redirectUrl = "http://localhost:3000/oauth2/callback"
                    + "?token=" + URLEncoder.encode(loginResponse.getToken(), StandardCharsets.UTF_8)
                    + "&userId=" + loginResponse.getUser().getUserId()
                    + "&email=" + URLEncoder.encode(loginResponse.getEmail(), StandardCharsets.UTF_8)
                    + "&firstName=" + URLEncoder.encode(loginResponse.getFirstName(), StandardCharsets.UTF_8)
                    + "&lastName=" + URLEncoder.encode(loginResponse.getLastName(), StandardCharsets.UTF_8);

            response.setStatus(HttpServletResponse.SC_TEMPORARY_REDIRECT);
            response.setHeader("Location", redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            System.out.println("=== OAUTH2 SUCCESS HANDLER ERROR ===");
            e.printStackTrace();
            response.sendRedirect("http://localhost:3000/?error=true");
        }
    }
}