<?php
/**
 * Main API router for Draftosaurus
 */

// Enable CORS for all requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/database.php';

// Get request URI and parse the route
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = trim($path, '/');
$path_parts = explode('/', $path);

// Remove 'api' from path if present
if (isset($path_parts[0]) && $path_parts[0] === 'api') {
    array_shift($path_parts);
}

$endpoint = isset($path_parts[0]) ? $path_parts[0] : '';

// Route to appropriate handler
switch ($endpoint) {
    case 'users':
        require_once 'api/users.php';
        break;
        
    case 'games':
        require_once 'api/games.php';
        break;
        
    case 'boards':
        require_once 'api/boards.php';
        break;
        
    case 'species':
        // Get dinosaur species
        $database = new Database();
        $conn = $database->getConnection();
        $query = "SELECT * FROM dinosaur_species ORDER BY species_id";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $species = $stmt->fetchAll();
        Utils::sendJsonResponse($species);
        break;
        
    case 'health':
        // Health check endpoint
        Utils::sendJsonResponse([
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ]);
        break;
        
    case '':
        // Root endpoint
        Utils::sendJsonResponse([
            'message' => 'Draftosaurus API',
            'version' => '1.0.0',
            'endpoints' => [
                '/api/users' => 'User management',
                '/api/games' => 'Game management',
                '/api/boards' => 'Player boards and scoring',
                '/api/species' => 'Dinosaur species',
                '/api/health' => 'Health check'
            ]
        ]);
        break;
        
    default:
        Utils::sendError('Endpoint not found', 404);
}
?>