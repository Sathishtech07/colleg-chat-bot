package com.college.chatbot;

import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

/**
 * FacultyServlet.java
 * --------------------
 * Provides faculty data to the frontend.
 *
 * ENDPOINTS:
 *   GET  /api/faculty  — Returns all faculty as JSON array
 *   POST /api/faculty  — Admin: Add a new faculty member
 */
public class FacultyServlet extends HttpServlet {

    /**
     * GET /api/faculty
     * Returns all faculty from the database, ordered by department.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Optional filter by department
        String deptFilter = request.getParameter("department");

        String sql;
        if (deptFilter != null && !deptFilter.isEmpty()) {
            sql = "SELECT id, name, department, designation, email FROM faculty WHERE department = ? ORDER BY name";
        } else {
            sql = "SELECT id, name, department, designation, email FROM faculty ORDER BY department, name";
        }

        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            if (deptFilter != null && !deptFilter.isEmpty()) {
                stmt.setString(1, deptFilter);
            }

            ResultSet rs = stmt.executeQuery();
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"name\":\"").append(escapeJson(rs.getString("name"))).append("\",")
                    .append("\"department\":\"").append(escapeJson(rs.getString("department"))).append("\",")
                    .append("\"designation\":\"").append(escapeJson(rs.getString("designation"))).append("\",")
                    .append("\"email\":\"").append(escapeJson(rs.getString("email"))).append("\"")
                    .append("}");
                first = false;
            }

        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"error\":\"Database error.\"}");
            return;
        }

        json.append("]");
        response.getWriter().write(json.toString());
    }

    /**
     * POST /api/faculty
     * Admin: Adds a new faculty member.
     * Expects: name, department, designation, email
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String name        = request.getParameter("name");
        String department  = request.getParameter("department");
        String designation = request.getParameter("designation");
        String email       = request.getParameter("email");

        if (name == null || name.isEmpty() || department == null || department.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"Name and department are required.\"}");
            return;
        }

        String sql = "INSERT INTO faculty (name, department, designation, email) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name.trim());
            stmt.setString(2, department.trim());
            stmt.setString(3, designation != null ? designation.trim() : "");
            stmt.setString(4, email != null ? email.trim() : "");
            stmt.executeUpdate();

            response.getWriter().write("{\"success\":true,\"message\":\"Faculty added successfully.\"}");

        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error.\"}");
        }
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
