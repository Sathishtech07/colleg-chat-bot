package com.college.chatbot;

import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

/**
 * AdminServlet.java
 * ------------------
 * Handles all admin CRUD operations.
 *
 * ENDPOINTS (all under /api/admin/*):
 *
 *   Q&A Management:
 *     GET    /api/admin/qa          — List all Q&A entries
 *     POST   /api/admin/qa          — Add a new Q&A
 *     PUT    /api/admin/qa          — Update an existing Q&A (send id in body)
 *     DELETE /api/admin/qa?id=<id>  — Delete a Q&A entry
 *
 *   Student Management:
 *     GET    /api/admin/students    — List all registered students
 *
 *   Department Management:
 *     DELETE /api/admin/departments?id=<id> — Delete a department
 *
 *   Faculty Management:
 *     DELETE /api/admin/faculty?id=<id> — Delete a faculty member
 *
 *   Events:
 *     DELETE /api/admin/events?id=<id> — Delete an event
 *
 * NOTE: In a production app, add proper admin authentication checks here.
 */
public class AdminServlet extends HttpServlet {

    /**
     * Routes GET requests based on sub-path:
     *   /api/admin/qa       → list Q&A
     *   /api/admin/students → list students
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Get the sub-path after /api/admin/
        String pathInfo = request.getPathInfo(); // e.g., "/qa" or "/students"

        if ("/qa".equals(pathInfo)) {
            listQA(response);
        } else if ("/students".equals(pathInfo)) {
            listStudents(response);
        } else {
            response.setStatus(404);
            response.getWriter().write("{\"error\":\"Unknown admin endpoint.\"}");
        }
    }

    /**
     * Routes POST requests:
     *   /api/admin/qa → add new Q&A
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();

        if ("/qa".equals(pathInfo)) {
            addQA(request, response);
        } else {
            response.setStatus(404);
            response.getWriter().write("{\"error\":\"Unknown admin endpoint.\"}");
        }
    }

    /**
     * Routes PUT requests:
     *   /api/admin/qa → update existing Q&A
     */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();

        if ("/qa".equals(pathInfo)) {
            updateQA(request, response);
        } else {
            response.setStatus(404);
            response.getWriter().write("{\"error\":\"Unknown admin endpoint.\"}");
        }
    }

    /**
     * Routes DELETE requests:
     *   /api/admin/qa?id=<id>          → delete Q&A
     *   /api/admin/departments?id=<id> → delete department
     *   /api/admin/faculty?id=<id>     → delete faculty
     *   /api/admin/events?id=<id>      → delete event
     */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();

        if ("/qa".equals(pathInfo)) {
            deleteRecord(request, response, "college_info");
        } else if ("/departments".equals(pathInfo)) {
            deleteRecord(request, response, "departments");
        } else if ("/faculty".equals(pathInfo)) {
            deleteRecord(request, response, "faculty");
        } else if ("/events".equals(pathInfo)) {
            deleteRecord(request, response, "events");
        } else if ("/announcements".equals(pathInfo)) {
            deleteRecord(request, response, "announcements");
        } else {
            response.setStatus(404);
            response.getWriter().write("{\"error\":\"Unknown admin endpoint.\"}");
        }
    }

    // ---------------------------------------------------------------
    // Q&A Operations
    // ---------------------------------------------------------------

    /** Returns all Q&A entries as a JSON array */
    private void listQA(HttpServletResponse response) throws IOException {
        String sql = "SELECT id, category, question, answer FROM college_info ORDER BY category, id";
        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"category\":\"").append(escapeJson(rs.getString("category"))).append("\",")
                    .append("\"question\":\"").append(escapeJson(rs.getString("question"))).append("\",")
                    .append("\"answer\":\"").append(escapeJson(rs.getString("answer"))).append("\"")
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

    /** Adds a new Q&A entry */
    private void addQA(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String category = request.getParameter("category");
        String question = request.getParameter("question");
        String answer   = request.getParameter("answer");

        if (question == null || answer == null || question.isEmpty() || answer.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"Question and answer are required.\"}");
            return;
        }

        String sql = "INSERT INTO college_info (category, question, answer) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, category != null ? category.trim() : "General");
            stmt.setString(2, question.trim());
            stmt.setString(3, answer.trim());
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            int newId = keys.next() ? keys.getInt(1) : 0;

            response.getWriter().write("{\"success\":true,\"message\":\"Q&A added successfully.\",\"id\":" + newId + "}");

        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error.\"}");
        }
    }

    /** Updates an existing Q&A entry. Reads params from request body. */
    private void updateQA(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // For PUT, parameters come as query string or request body
        String idStr    = request.getParameter("id");
        String category = request.getParameter("category");
        String question = request.getParameter("question");
        String answer   = request.getParameter("answer");

        if (idStr == null || question == null || answer == null || question.isEmpty() || answer.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"ID, question, and answer are required.\"}");
            return;
        }

        int id;
        try { id = Integer.parseInt(idStr); }
        catch (NumberFormatException e) {
            response.getWriter().write("{\"success\":false,\"message\":\"Invalid ID.\"}");
            return;
        }

        String sql = "UPDATE college_info SET category=?, question=?, answer=? WHERE id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, category != null ? category.trim() : "General");
            stmt.setString(2, question.trim());
            stmt.setString(3, answer.trim());
            stmt.setInt(4, id);
            int rows = stmt.executeUpdate();

            if (rows > 0) {
                response.getWriter().write("{\"success\":true,\"message\":\"Q&A updated successfully.\"}");
            } else {
                response.getWriter().write("{\"success\":false,\"message\":\"Q&A not found.\"}");
            }

        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error.\"}");
        }
    }

    /** Generic DELETE helper — deletes a row by ID from any table */
    private void deleteRecord(HttpServletRequest request, HttpServletResponse response, String tableName)
            throws IOException {

        String idStr = request.getParameter("id");
        if (idStr == null || idStr.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"ID is required.\"}");
            return;
        }

        int id;
        try { id = Integer.parseInt(idStr); }
        catch (NumberFormatException e) {
            response.getWriter().write("{\"success\":false,\"message\":\"Invalid ID.\"}");
            return;
        }

        // Table name is hardcoded from our routing (not from user input) — safe from SQL injection
        String sql = "DELETE FROM " + tableName + " WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            int rows = stmt.executeUpdate();

            if (rows > 0) {
                response.getWriter().write("{\"success\":true,\"message\":\"Record deleted successfully.\"}");
            } else {
                response.getWriter().write("{\"success\":false,\"message\":\"Record not found.\"}");
            }

        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error.\"}");
        }
    }

    // ---------------------------------------------------------------
    // Student Management
    // ---------------------------------------------------------------

    /** Returns all student accounts (excludes admins) */
    private void listStudents(HttpServletResponse response) throws IOException {
        String sql = "SELECT id, name, email, created_at FROM users WHERE role='student' ORDER BY created_at DESC";
        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"name\":\"").append(escapeJson(rs.getString("name"))).append("\",")
                    .append("\"email\":\"").append(escapeJson(rs.getString("email"))).append("\",")
                    .append("\"created_at\":\"").append(escapeJson(rs.getString("created_at"))).append("\"")
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

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
