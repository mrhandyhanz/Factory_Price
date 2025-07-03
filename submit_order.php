<?php
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$db   = 'ecommerce';
$user = 'root';
$pass = ''; // Adjust this if your MySQL has a password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Read input data (assumes JSON)
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['cart']) || !is_array($data['cart'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid cart data']);
    exit;
}

$cart = $data['cart'];
$info = $data['shipping'];
$total = $data['total'];

// Insert order
$stmt = $pdo->prepare("INSERT INTO orders (full_name, email, address, city, zip, country, total) 
                       VALUES (:full_name, :email, :address, :city, :zip, :country, :total)");
$stmt->execute([
    'full_name' => $info['firstName'] . ' ' . $info['lastName'],
    'email'     => $info['email'],
    'address'   => $info['address'],
    'city'      => $info['city'],
    'zip'       => $info['zip'],
    'country'   => $info['country'],
    'total'     => $total
]);

$orderId = $pdo->lastInsertId();

// Insert cart items
$itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, product_name, product_price, quantity) 
                           VALUES (:order_id, :product_name, :product_price, :quantity)");

foreach ($cart as $item) {
    $itemStmt->execute([
        'order_id'      => $orderId,
        'product_name'  => $item['title'],
        'product_price' => floatval(preg_replace('/[^0-9.]/', '', $item['price'])),
        'quantity'      => 1
    ]);
}

echo json_encode(['success' => true, 'order_id' => $orderId]);
