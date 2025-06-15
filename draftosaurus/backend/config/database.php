<?php
/**
 * Database connection class for Draftosaurus
 */
class Database {
    private $host = 'localhost';
    private $db_name = 'draftosaurus';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}

/**
 * Utility functions for generating UUIDs and other common operations
 */
class Utils {
    public static function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public static function validateDinosaurSpecies($species) {
        $valid_species = ['trex', 'stegosaurus', 'triceratops', 'brachiosaurus', 'pterodactyl', 'velociraptor'];
        return in_array($species, $valid_species);
    }

    public static function validatePenLocation($pen) {
        $valid_pens = ['forest_of_sameness', 'meadow_of_differences', 'prairie_of_love', 'woody_trio', 'king_of_jungle', 'solitary_island', 'river'];
        return in_array($pen, $valid_pens);
    }

    public static function validateDiceFace($face) {
        $valid_faces = ['forest', 'grassland', 'mountain', 'nest', 'river', 'free_choice'];
        return in_array($face, $valid_faces);
    }

    public static function sendJsonResponse($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function sendError($message, $status_code = 400) {
        self::sendJsonResponse(['error' => $message], $status_code);
    }
}
?>