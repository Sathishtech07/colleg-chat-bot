package com.college.chatbot;

import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

/**
 * AuthServlet.java
 * -----------------
 * Handles student login and registration.
 *
 * ENDPOINTS:
 *   POST /api/login    — Authenticates a user
 *   POST /api/register — Registers a new student
 *
 * Both endpoints accept form data (application/x-www-form-urlencoded)
 * and return JSON responses.
 *
 * LOGIN RESPONSE:
 *   Success: { "success": true, "role": "student", "name": "Rahul" }
 *   Failure: { "success": false, "message": "Invalid credentials." }
 *
 * REGISTER RESPONSE:
 *   Success: { "success": true, "message": "Registration successful!" }
 *   Failure: { "success": false, "message": "Email already registered." }
 */
public class AuthServlet extends HttpServlet {

    /**
     * POST /api/login
     *   Expects: email, password (form parameters)
     *   Returns: JSON with success status, role, and user name
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Determine which endpoint was called (/api/login or /api/register)
        String path = request.getServletPath();

        if ("/api/login".equals(path)) {
            handleLogin(request, response);
        } else if ("/api/register".equals(path)) {
            handleRegister(request, response);
        } else {
            response.setStatus(404);
            response.getWriter().write("{\"success\":false,\"message\":\"Unknown endpoint.\"}");
        }
    }

    // ---------------------------------------------------------------
    // LOGIN LOGIC
    // ---------------------------------------------------------------
    private void handleLogin(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // Read form fields
        String email    = request.getParameter("email");
        String password = request.getParameter("password");

        // Basic validation
        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"Email and password are required.\"}");
            return;
        }

        // Query the database for a matching user
        String sql = "SELECT id, name, role FROM users WHERE email = ? AND password = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email.trim().toLowerCase());
            stmt.setString(2, password); // In production: use hashed passwords!

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                // User found — return success with role and name
                String name = rs.getString("name");
                String role = rs.getString("role");
                String json = String.format(
                    "{\"success\":true,\"name\":\"%s\",\"role\":\"%s\",\"email\":\"%s\"}",
                    escapeJson(name), role, escapeJson(email)
                );
                response.getWriter().write(json);
            } else {
                // No matching user found
                response.getWriter().write("{\"success\":false,\"message\":\"Invalid email or password.\"}");
            }

        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error. Please try again.\"}");
        }
    }

    // ---------------------------------------------------------------
    // REGISTRATION LOGIC
    // ---------------------------------------------------------------
    private void handleRegister(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // Read form fields
        String name     = request.getParameter("name");
        String email    = request.getParameter("email");
        String password = request.getParameter("password");

        // Basic validation
        if (name == null || email == null || password == null ||
            name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"All fields are required.\"}");
            return;
        }

        if (password.length() < 6) {
            response.getWriter().write("{\"success\":false,\"message\":\"Password must be at least 6 characters.\"}");
            return;
        }

        // Insert new student into the database
        String sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name.trim());
            stmt.setString(2, email.trim().toLowerCase());
            stmt.setString(3, password); // In production: use BCrypt hashing!

            stmt.executeUpdate();

            response.getWriter().write("{\"success\":true,\"message\":\"Registration successful! Please log in.\"}");

        } catch (SQLIntegrityConstraintViolationException e) {
            // Email already exists (UNIQUE constraint violation)
            response.getWriter().write("{\"success\":false,\"message\":\"This email is already registered. Please log in.\"}");
        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error. Please try again.\"}");
        }
    }

    /** Escapes special JSON characters in a string */
    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
