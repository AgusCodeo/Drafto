<?php
// Enable CORS for all requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../models/User.php';

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = trim($path, '/');
$path_parts = explode('/', $path);

// Remove 'api' and 'users' from path
$endpoint = isset($path_parts[2]) ? $path_parts[2] : '';
$user_id = isset($path_parts[3]) ? $path_parts[3] : '';

$user = new User();

switch ($method) {
    case 'GET':
        if ($user_id) {
            // Get specific user
            $result = $user->getById($user_id);
            if ($result) {
                Utils::sendJsonResponse($result);
            } else {
                Utils::sendError('User not found', 404);
            }
        } else {
            // Get all users
            $result = $user->getAll();
            Utils::sendJsonResponse($result);
        }
        break;
        
    case 'POST':
        // Create new user
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['username']) || empty($input['username'])) {
            Utils::sendError('Username is required');
        }
        
        // Check if username already exists
        if ($user->getByUsername($input['username'])) {
            Utils::sendError('Username already exists');
        }
        
        $result = $user->create(
            $input['username'],
            $input['email'] ?? null,
            $input['user_type'] ?? 'player'
        );
        
        if ($result) {
            Utils::sendJsonResponse($result, 201);
        } else {
            Utils::sendError('Failed to create user', 500);
        }
        break;
        
    default:
        Utils::sendError('Method not allowed', 405);
}
?>