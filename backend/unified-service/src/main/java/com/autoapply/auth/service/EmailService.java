package com.autoapply.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.autoapply.common.exception.ServiceException;

import java.util.Objects;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Value("${spring.mail.username:}")
    private String mailUsername;
    
    @Value("${spring.mail.from:${spring.mail.username:}}")
    private String mailFrom;
    
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

        Objects.requireNonNull(toEmail, "toEmail");

        logger.info("Password reset requested for: {}", toEmail);
        
        // Check if email is configured
        if (mailUsername == null || mailUsername.isBlank()) {
            // For local dev we silently no-op (the API should still respond successfully).
            logger.warn("Email sending not configured. MAIL_USERNAME is not set. Skipping email send.");
            return;
        }

        String fromEmail = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : Objects.requireNonNull(mailUsername, "mailUsername");
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(Objects.requireNonNull(fromEmail, "fromEmail"));
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - AutoApply");
            
            String emailBody = Objects.requireNonNull(buildPasswordResetEmailBody(resetUrl), "emailBody");
            helper.setText(emailBody, true); // true = HTML email
            
            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to create password reset email for: {}", toEmail, e);
            throw new ServiceException("Failed to send password reset email", e);
        } catch (MailException e) {
            logger.error("Failed to send password reset email to: {}", toEmail, e);
            logger.error("Please check your email configuration (MAIL_USERNAME, MAIL_PASSWORD, MAIL_HOST, MAIL_PORT)");
            throw new ServiceException("Failed to send password reset email", e);
        }
    }
    
    private String buildPasswordResetEmailBody(String resetUrl) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .button:hover { background-color: #1d4ed8; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h2>Password Reset Request</h2>
                    <p>You have requested to reset your password for your AutoApply account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="%s" class="button">Reset Password</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">%s</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <div class="footer">
                      <p>This is an automated message from AutoApply. Please do not reply to this email.</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(resetUrl, resetUrl);
    }
}

