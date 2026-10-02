package com.college.chatbot;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

/**
 * CorsFilter.java
 * ----------------
 * A simple CORS (Cross-Origin Resource Sharing) filter.
 *
 * WHY WE NEED THIS:
 *   When the HTML file (e.g., file:// or http://localhost:5500) makes an
 *   API request to Tomcat (http://localhost:8080), the browser blocks it
 *   as a "cross-origin" request. This filter adds the required HTTP headers
 *   to tell the browser "it's OK, allow this request."
 */
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse response = (HttpServletResponse) res;

        // Allow requests from any origin (use specific origin in production)
        response.setHeader("Access-Control-Allow-Origin", "*");

        // Allow these HTTP methods
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

        // Allow these request headers
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        // Handle pre-flight OPTIONS request (browser sends this before POST/PUT)
        if ("OPTIONS".equalsIgnoreCase(((jakarta.servlet.http.HttpServletRequest) req).getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Continue to the actual Servlet
        chain.doFilter(req, res);
    }
}
