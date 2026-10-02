package com.college.chatbot;

import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

/**
 * DepartmentServlet.java
 * -----------------------
 * Provides department data to the frontend.
 *
 * ENDPOINTS:
 *   GET  /api/departments         — Returns all departments as JSON array
 *   POST /api/departments         — Admin: Add a new department
 *
 * GET RESPONSE (JSON array):
 * [
 *   {
 *     "id": 1,
 *     "department_name": "Computer Science & Engineering",
 *     "hod_name": "Dr. Ananya Krishnan",
 *     "description": "..."
 *   },
 *   ...
 * ]
 */
public class DepartmentServlet extends HttpServlet {

    /**
     * GET /api/departments
     * Returns all departments from the database as a JSON array.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sql = "SELECT id, department_name, hod_name, description FROM departments ORDER BY id";
        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"department_name\":\"").append(escapeJson(rs.getString("department_name"))).append("\",")
                    .append("\"hod_name\":\"").append(escapeJson(rs.getString("hod_name"))).append("\",")
                    .append("\"description\":\"").append(escapeJson(rs.getString("description"))).append("\"")
                    .append("}");
                first = false;
            }

        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"error\":\"Database error: " + escapeJson(e.getMessage()) + "\"}");
            return;
        }

        json.append("]");
        response.getWriter().write(json.toString());
    }

    /**
     * POST /api/departments
     * Admin: Adds a new department to the database.
     * Expects form parameters: department_name, hod_name, description
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String deptName    = request.getParameter("department_name");
        String hodName     = request.getParameter("hod_name");
        String description = request.getParameter("description");

        if (deptName == null || deptName.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"Department name is required.\"}");
            return;
        }

        String sql = "INSERT INTO departments (department_name, hod_name, description) VALUES (?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, deptName.trim());
            stmt.setString(2, hodName != null ? hodName.trim() : "");
            stmt.setString(3, description != null ? description.trim() : "");
            stmt.executeUpdate();

            response.getWriter().write("{\"success\":true,\"message\":\"Department added successfully.\"}");

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
