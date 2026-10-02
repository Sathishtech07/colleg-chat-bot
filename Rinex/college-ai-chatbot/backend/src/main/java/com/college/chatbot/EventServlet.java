package com.college.chatbot;

import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

/**
 * EventServlet.java
 * ------------------
 * Provides events and announcements data.
 *
 * ENDPOINTS:
 *   GET  /api/events        — Returns all events as JSON
 *   POST /api/events        — Admin: Add a new event
 *   GET  /api/announcements — Returns all announcements as JSON
 *   POST /api/announcements — Admin: Add a new announcement
 */
public class EventServlet extends HttpServlet {

    /**
     * GET /api/events or /api/announcements
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String path = request.getServletPath();

        if ("/api/announcements".equals(path)) {
            fetchAnnouncements(response);
        } else {
            fetchEvents(response);
        }
    }

    /** Returns all events ordered by date ascending */
    private void fetchEvents(HttpServletResponse response) throws IOException {
        String sql = "SELECT id, event_name, event_date, description FROM events ORDER BY event_date ASC";
        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"event_name\":\"").append(escapeJson(rs.getString("event_name"))).append("\",")
                    .append("\"event_date\":\"").append(rs.getString("event_date")).append("\",")
                    .append("\"description\":\"").append(escapeJson(rs.getString("description"))).append("\"")
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

    /** Returns all announcements ordered by date descending (newest first) */
    private void fetchAnnouncements(HttpServletResponse response) throws IOException {
        String sql = "SELECT id, title, description, date FROM announcements ORDER BY date DESC";
        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"title\":\"").append(escapeJson(rs.getString("title"))).append("\",")
                    .append("\"description\":\"").append(escapeJson(rs.getString("description"))).append("\",")
                    .append("\"date\":\"").append(rs.getString("date")).append("\"")
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
     * POST /api/events or /api/announcements
     * Admin: Adds a new event or announcement.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String path = request.getServletPath();

        if ("/api/announcements".equals(path)) {
            addAnnouncement(request, response);
        } else {
            addEvent(request, response);
        }
    }

    private void addEvent(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String eventName   = request.getParameter("event_name");
        String eventDate   = request.getParameter("event_date");
        String description = request.getParameter("description");

        if (eventName == null || eventDate == null || eventName.isEmpty() || eventDate.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"Event name and date are required.\"}");
            return;
        }

        String sql = "INSERT INTO events (event_name, event_date, description) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, eventName.trim());
            stmt.setString(2, eventDate.trim());
            stmt.setString(3, description != null ? description.trim() : "");
            stmt.executeUpdate();
            response.getWriter().write("{\"success\":true,\"message\":\"Event added successfully.\"}");
        } catch (SQLException e) {
            response.setStatus(500);
            response.getWriter().write("{\"success\":false,\"message\":\"Database error.\"}");
        }
    }

    private void addAnnouncement(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String title       = request.getParameter("title");
        String description = request.getParameter("description");
        String date        = request.getParameter("date");

        if (title == null || title.isEmpty()) {
            response.getWriter().write("{\"success\":false,\"message\":\"Title is required.\"}");
            return;
        }

        String sql = "INSERT INTO announcements (title, description, date) VALUES (?, ?, CURDATE())";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, title.trim());
            stmt.setString(2, description != null ? description.trim() : "");
            stmt.executeUpdate();
            response.getWriter().write("{\"success\":true,\"message\":\"Announcement added successfully.\"}");
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
