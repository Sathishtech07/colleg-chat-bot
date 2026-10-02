package com.college.chatbot;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DBConnection.java
 * ------------------
 * Utility class that provides a JDBC connection to the MySQL database.
 *
 * HOW IT WORKS:
 *   1. We define the database URL, username, and password.
 *   2. DriverManager.getConnection() opens a connection to MySQL.
 *   3. Every Servlet calls DBConnection.getConnection() to talk to the DB.
 *
 * CONFIGURATION:
 *   Change DB_URL, DB_USER, DB_PASSWORD below to match your MySQL setup.
 */
public class DBConnection {

    // ---------------------------------------------------------------
    // DATABASE CONFIGURATION — Edit these values before running!
    // ---------------------------------------------------------------

    /** JDBC URL format: jdbc:mysql://host:port/database_name */
    private static final String DB_URL = "jdbc:mysql://localhost:3306/college_chatbot"
            + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata";

    /** MySQL username (default is 'root') */
    private static final String DB_USER = "root";

    /** MySQL password — change this to your actual MySQL root password */
    private static final String DB_PASSWORD = "your_mysql_password";

    /**
     * Returns an open Connection to the MySQL database.
     * Each Servlet should close the Connection after use (try-with-resources).
     *
     * @return Connection object
     * @throws SQLException if connection fails
     */
    public static Connection getConnection() throws SQLException {
        try {
            // Load the MySQL JDBC driver class into memory
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            // This means the mysql-connector-j JAR is missing from the classpath
            throw new SQLException("MySQL JDBC Driver not found. Check your pom.xml dependencies.", e);
        }

        // Open and return the connection
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }
}
