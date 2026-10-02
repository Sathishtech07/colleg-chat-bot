package com.college.chatbot;

import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

/**
 * ChatbotServlet.java
 * --------------------
 * Handles chatbot question-answering via the database.
 *
 * ENDPOINT:  GET /api/chat?q=your+question
 *
 * HOW IT WORKS:
 *   1. Read the student's question from the URL parameter "q".
 *   2. Split it into individual keywords.
 *   3. Search the 'college_info' table — find rows where the 'question'
 *      column contains any of those keywords.
 *   4. Return the best match as a JSON response.
 *   5. If nothing is found, return a default "I don't know" message.
 *
 * RESPONSE FORMAT (JSON):
 *   { "found": true, "answer": "The CSE department is in Block C..." }
 *   { "found": false, "answer": "Sorry, I don't have information..." }
 */
public class ChatbotServlet extends HttpServlet {

    // Default answer when no matching Q&A is found
    private static final String DEFAULT_ANSWER =
        "Sorry, I don't have information about this question. " +
        "Please contact the college office at info@sit.edu or call +91-98765-43210.";

    /**
     * Handles GET /api/chat?q=<student question>
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // Set response type to JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Read the question parameter from URL (e.g., ?q=library+timings)
        String question = request.getParameter("q");

        // If no question provided, return an error JSON
        if (question == null || question.trim().isEmpty()) {
            response.getWriter().write("{\"found\":false,\"answer\":\"Please type a question.\"}");
            return;
        }

        // Convert question to lowercase for case-insensitive matching
        String lowerQuestion = question.toLowerCase().trim();

        // Split the question into keywords (by spaces and punctuation)
        String[] keywords = lowerQuestion.split("[\\s,?.!]+");

        // Build a SQL query that checks if any keyword appears in the 'question' column
        // We use LIKE '%keyword%' for each keyword and join with OR
        StringBuilder sqlBuilder = new StringBuilder(
            "SELECT answer FROM college_info WHERE "
        );

        boolean first = true;
        for (String keyword : keywords) {
            // Skip very short or common words (stop words)
            if (keyword.length() <= 2) continue;
            if (!first) sqlBuilder.append(" OR ");
            sqlBuilder.append("LOWER(question) LIKE ?");
            first = false;
        }

        // If all keywords were filtered out, use a generic search
        if (first) {
            sqlBuilder = new StringBuilder("SELECT answer FROM college_info WHERE LOWER(question) LIKE ?");
        }

        sqlBuilder.append(" LIMIT 1");

        // Try to find an answer in the database
        String answer = DEFAULT_ANSWER;
        boolean found = false;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlBuilder.toString())) {

            // Set each keyword as a parameter for LIKE matching
            int paramIdx = 1;
            boolean anyParamSet = false;
            for (String keyword : keywords) {
                if (keyword.length() <= 2) continue;
                stmt.setString(paramIdx++, "%" + keyword + "%");
                anyParamSet = true;
            }

            // If no valid keywords, do a full-question match
            if (!anyParamSet) {
                // Rebuild for single-param query
                String fallback = "SELECT answer FROM college_info WHERE LOWER(question) LIKE ? LIMIT 1";
                try (PreparedStatement fallbackStmt = conn.prepareStatement(fallback)) {
                    fallbackStmt.setString(1, "%" + lowerQuestion + "%");
                    ResultSet rs = fallbackStmt.executeQuery();
                    if (rs.next()) {
                        answer = rs.getString("answer");
                        found = true;
                    }
                }
            } else {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    answer = rs.getString("answer");
                    found = true;
                }
            }

        } catch (SQLException e) {
            // If database connection fails, still return a graceful response
            // The JavaScript chatbot.js has a built-in keyword engine as fallback
            answer = DEFAULT_ANSWER;
        }

        // Escape the answer string for safe JSON output
        String safeAnswer = escapeJson(answer);

        // Write the JSON response
        String json = String.format("{\"found\":%b,\"answer\":\"%s\"}", found, safeAnswer);
        response.getWriter().write(json);
    }

    /**
     * Escapes special characters in a string so it's safe inside a JSON string value.
     * This avoids broken JSON if the answer contains quotes or newlines.
     */
    private String escapeJson(String text) {
        if (text == null) return "";
        return text
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }
}
