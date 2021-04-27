<?php

class Connection {
    private $conn;

    public function __construct($host, $dbname, $username, $password, $port = 5432) {
        $conn_string = "host={$host} port={$port} dbname={$dbname} user={$username} password={$password}";
        $this->conn = pg_connect($conn_string) or die('Connection failed');
    }
}