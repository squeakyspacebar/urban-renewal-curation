<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Configure dotenv file path.
$dotenv = Dotenv\Dotenv::createImmutable('..');
// Load contents of dotenv file into environment.
$dotenv->load();

// Create Slim DI container.
$builder = new \DI\ContainerBuilder();
$container = $builder->build();

// Retrieve configurations.
$config = [];
foreach (glob('../config/*.php') as $filename) {
  $ext = pathinfo($filename, PATHINFO_EXTENSION);
  $barename = basename($filename, '.'.$ext);
  $config[$barename] = require_once $filename;
}

$container->set('config', $config);

// Configure view functionality in container.
$container->set('view', function() {
    return Slim\Views\Twig::create('../resources/views', [
    	'auto_reload' => true,
    	'cache' => '../bootstrap/cache',
    	'debug' => true,
    ]);
});

// Configure database connection in container.
$container->set('conn', function($c) {
    $db_config = $c->get('config')['database'];
    $conn_config = $db_config['connections'][$db_config['default']];
    $conn_string = "host={$conn_config['host']} port={$conn_config['port']} dbname={$conn_config['database']} user={$conn_config['username']} password={$conn_config['password']}";

    $conn = pg_connect($conn_string) or die('Connection failed');

    return $conn;
});

// Create Slim app.
Slim\Factory\AppFactory::setContainer($container);
$app = Slim\Factory\AppFactory::create();

// Add Twig-View middleware.
$app->add(Slim\Views\TwigMiddleware::createFromContainer($app));

// Add routes.
foreach (glob('../routes/*.php') as $filename) {
  require_once $filename;
}

return $app;