<?php
require_once __DIR__ . '/../config/database.php';

/**
 * User management class
 */
class User {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($username, $email = null, $user_type = 'player') {
        $user_id = Utils::generateUUID();
        
        $query = "INSERT INTO users (user_id, username, email, user_type) VALUES (:user_id, :username, :email, :user_type)";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':user_type', $user_type);
        
        if ($stmt->execute()) {
            return $this->getById($user_id);
        }
        return false;
    }

    public function getById($user_id) {
        $query = "SELECT user_id, username, email, user_type, created_at FROM users WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    public function getByUsername($username) {
        $query = "SELECT user_id, username, email, user_type, created_at FROM users WHERE username = :username";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    public function getAll() {
        $query = "SELECT user_id, username, email, user_type, created_at FROM users ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
}
?>