<?php

return [
  'default' => $_ENV['DB_CONNECTION'] ?? 'pgsql',
  'connections' => [
    'pgsql' => [
      'driver' => 'pgsql',
      'url' => '',
      'host' => $_ENV['DB_HOST'] ?? 'localhost',
      'port' => $_ENV['DB_PORT'] ?? '5432',
      'database' => $_ENV['DB_DATABASE'],
      'username' => $_ENV['DB_USERNAME'],
      'password' => $_ENV['DB_PASSWORD'],
      'charset' => 'utf8',
      'prefix' => '',
      'prefix_indexes' => true,
      'schema' => 'public',
      'sslmode' => 'prefer',
    ],
  ],
];