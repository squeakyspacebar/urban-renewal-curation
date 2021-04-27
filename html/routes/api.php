<?php

// Returns occurence count for each event type up to the specified year.
$app->get('/api/all-event-type-occurrences', function ($request, $response, array $args) {
  $conn = $this->get('conn');

  $query_params = $request->getQueryParams();
  $year = $query_params['year'];
  $sql = 'SELECT
      t.type AS label,
      COUNT(s1.type)
    FROM event_types t
    LEFT OUTER JOIN (
      SELECT
        e.parcel_id AS parcel_id,
        TRIM(t.type) AS type,
        EXTRACT(YEAR FROM e.event_date::date) AS year
      FROM events e
      LEFT JOIN event_types t ON e.type_id = t.type_id
      LEFT JOIN parcels p ON e.parcel_id = p.parcel_id
      WHERE e.event_date IS NOT NULL
        AND EXTRACT(YEAR FROM e.event_date::date) <= $1
      GROUP BY e.parcel_id, type, year
    ) s1 ON t.type = s1.type
    GROUP BY t.type
    ORDER BY t.type ASC';
  $params = [$year];
  $result = pg_query_params($conn, $sql, $params);

  if (!$result) {
    $content = "Error in SQL query: " . pg_last_error($conn);

    return $response->withHeader('Content-Type', 'text/html')
      ->withStatus(500)
      ->getBody()->write($content);
  }

  $rows = pg_num_rows($result);

  $data = [];
  while ($row = pg_fetch_assoc($result)) {
    $data[] = $row;
  }
  $content = json_encode($data);

  pg_close($conn);
  
  $response->getBody()->write($content);

  return $response
    ->withHeader('Content-Type', 'application/json')
    ->withStatus(200);
});

// Returns list of event types.
$app->get('/api/event-types', function ($request, $response, array $args) {
  $conn = $this->get('conn');

  $sql = 'SELECT TRIM(type) AS type
    FROM event_types
    ORDER BY type ASC;';
  $result = pg_query($conn, $sql);

  if (!$result) {
    $content = "Error in SQL query: " . pg_last_error($conn);

    return $response->withHeader('Content-Type', 'text/html')
      ->withStatus(500)
      ->getBody()->write($content);
  }

  $rows = pg_num_rows($result);

  $data = [];
  while ($row = pg_fetch_assoc($result)) {
    $data[] = $row;
  }
  $content = json_encode($data);

  pg_close($conn);

  $response->getBody()->write($content);

  return $response
    ->withHeader('Content-Type', 'application/json')
    ->withStatus(200);
});

// Returns the occurrence count by each year up to the specified year for the
// specified event type.
$app->get('/api/event-type-occurrences-by-year', function ($request, $response, array $args) {
  $conn = $this->get('conn');

  $query_params = $request->getQueryParams();
  $year = $query_params['year'];
  $type = $query_params['type'];
  $sql = 'SELECT
      year,
      COUNT(*)
    FROM (
      SELECT
        e.parcel_id AS parcel_id,
        TRIM(t.type) AS type,
        EXTRACT(YEAR FROM e.event_date::date) AS year
      FROM events e
      LEFT JOIN event_types t ON e.type_id = t.type_id
      LEFT JOIN parcels p ON e.parcel_id = p.parcel_id
      WHERE e.event_date IS NOT NULL
        AND EXTRACT(YEAR FROM e.event_date::date) <= $1
        AND type = $2
      GROUP BY e.parcel_id, type, year
    ) s1
    GROUP BY year, type
    ORDER BY year ASC';
  $params = [$year, $type];
  $result = pg_query_params($conn, $sql, $params);

  if (!$result) {
    $content = "Error in SQL query: " . pg_last_error($conn);

    return $response->withHeader('Content-Type', 'text/html')
      ->withStatus(500)
      ->getBody()->write($content);
  }

  $rows = pg_num_rows($result);

  $data = [];
  while ($row = pg_fetch_assoc($result)) {
    $data[] = $row;
  }
  $content = json_encode($data);

  pg_close($conn);

  $response->getBody()->write($content);

  return $response
    ->withHeader('Content-Type', 'application/json')
    ->withStatus(200);
});

// Returns type and year of most recent event (if exists) for each parcel up to
// the specified year.
$app->get("/api/most-recent-events", function ($request, $response, array $args) {
  $conn = $this->get('conn');

  $query_params = $request->getQueryParams();
  $year = $query_params['year'];
  $sql = 'SELECT DISTINCT ON (block_no, parcel_no)
      block_no,
      parcel_no,
      EXTRACT(year from date) AS year,
      array_agg(type_token) AS types
    FROM (
      SELECT
        e.parcel_id,
        p.block_number AS block_no,
        p.parcel_num AS parcel_no,
        e.event_date::date AS date,
        split_part(TRIM(t.type), \' \', 1) AS type_token
      FROM events e
        LEFT JOIN event_types t ON e.type_id = t.type_id
        LEFT JOIN parcels p ON  e.parcel_id = p.parcel_id
        LEFT JOIN addresses a ON a.parcel_id = e.parcel_id
      WHERE e.event_date IS NOT NULL
        AND EXTRACT(year from e.event_date::date) <= $1
      GROUP BY e.parcel_id, e.event_date::date, p.block_number, p.parcel_num, type_token
    ) s1
    GROUP BY block_no, parcel_no, date
    ORDER BY block_no ASC, parcel_no ASC, year DESC, date DESC';
  $params = [$year];
  $result = pg_query_params($conn, $sql, $params);

  if (!$result) {
    $content = "Error in SQL query: " . pg_last_error($conn);

    $response->getBody()->write($content);

    return $response->withHeader('Content-Type', 'text/html')
      ->withStatus(500);
  }

  $rows = pg_num_rows($result);

  $data = [];
  while ($row = pg_fetch_assoc($result)) {
    $data[] = $row;
  }
  $content = json_encode($data);

  pg_close($conn);
  
  $response->getBody()->write($content);

  return $response
    ->withHeader('Content-Type', 'application/json')
    ->withStatus(200);
});

// Returns event history for the specified parcel.
$app->get('/api/parcel-events', function ($request, $response, array $args) {
  $conn = $this->get('conn');

  $query_params = $request->getQueryParams();
  $block = $query_params['block'];
  $parcel = $query_params['parcel'];
  $sql = 'SELECT DISTINCT ON (p.parcel_num, p.block_number, t.type, e.event_date::date, t.type_id)
        TRIM(a.st_num) AS st_num,
        TRIM(a.st_name) AS st_name,
        p.parcel_num AS parcel_no,
        p.block_number AS block_no,
        e.event_date::date AS date,
        e.response,
        TRIM(t.type) AS type
      FROM events e
      LEFT JOIN addresses a ON a.parcel_id = e.parcel_id
      LEFT JOIN parcels p ON e.parcel_id = p.parcel_id
      LEFT JOIN event_types t ON e.type_id = t.type_id
      WHERE p.block_number = $1
        AND p.parcel_num = $2
        AND e.event_date IS NOT NULL
      ORDER BY e.event_date::date ASC, t.type_id ASC';
  $params = [$block, $parcel];
  $result = pg_query_params($conn, $sql, $params);

  if (!$result) {
    $content = "Error in SQL query: " . pg_last_error($conn);

    return $response->withHeader('Content-Type', 'text/html')
      ->withStatus(500)
      ->getBody()->write($content);
  }

  $rows = pg_num_rows($result);

  $data = [];
  while ($row = pg_fetch_assoc($result)) {
    $data[] = $row;
  }
  $content = json_encode($data);

  pg_close($conn);

  $response->getBody()->write($content);

  return $response
    ->withHeader('Content-Type', 'application/json')
    ->withStatus(200);
});

// Returns list of images (if exists) for specified parcel.
$app->get('/api/parcel-images', function ($request, $response, array $args) {
  $conn = $this->get('conn');

  $query_params = $request->getQueryParams();
  $block = $query_params['block'];
  $parcel = $query_params['parcel'];

  $property_image_dir = "{$_SERVER['DOCUMENT_ROOT']}/img/properties/B{$block}_P{$parcel}";
  $dir_ents = new DirectoryIterator($property_image_dir);
  $files = [];

  foreach ($dir_ents as $dir_ent) {
    if (!$dir_ent->isFile()) {
      continue;
    }

    $files[] = $dir_ent->getFilename();
  }

  $content = json_encode([
    'image_paths' => $files
  ]);
  $response->getBody()->write($content);

  return $response
    ->withHeader('Content-Type', 'application/json')
    ->withStatus(200);
});

// Returns list of associated people (if exists) for specified parcel.
$app->get('/api/parcel-people', function ($request, $response, array $args) {
  $conn = $this->get('conn');

  $query_params = $request->getQueryParams();
  $block = $query_params['block'];
  $parcel = $query_params['parcel'];
  $sql = 'SELECT DISTINCT ON (name, role)
      TRIM(p.name) AS name,
      TRIM(a.person_role) AS role
    FROM events e
      LEFT JOIN parcels c ON e.parcel_id = c.parcel_id
      LEFT JOIN event_people_assoc a ON a.event_id = e.event_id
      LEFT JOIN people p ON p.person_id = a.person_id
    WHERE a.person_role IS NOT NULL
      AND c.block_number = $1
      AND c.parcel_num = $2
    ORDER BY role ASC';
  $params = [$block, $parcel];
  $result = pg_query_params($conn, $sql, $params);

  if (!$result) {
    $content = "Error in SQL query: " . pg_last_error($conn);

    $response->getBody()->write($content);

    return $response->withHeader('Content-Type', 'text/html')
      ->withStatus(500);
  }

  $rows = pg_num_rows($result);

  $data = [];
  while ($row = pg_fetch_assoc($result)) {
    $data[] = $row;
  }
  $content = json_encode($data);

  pg_close($conn);

  $response->getBody()->write($content);

  return $response
    ->withHeader('Content-Type', 'application/json')
    ->withStatus(200);
});

// Returns any parcels that match a basic text search.
$app->get('/api/search', function ($request, $response, array $args) {
  $conn = $this->get('conn');

  $query_params = $request->getQueryParams();
  $querystring = $query_params['q'];
  $sql = "SELECT DISTINCT ON (a.st_num, a.st_name)
      TRIM(a.st_num) AS street_number,
      TRIM(a.st_name) AS street_name,
      b.parcel_num AS parcel_no,
      b.block_number AS block_no,
      TRIM(f.name) AS owner_name
    FROM addresses a 
      LEFT JOIN parcels b ON a.parcel_id = b.parcel_id
      LEFT JOIN events c ON b.parcel_id=c.parcel_id
      LEFT JOIN event_people_assoc e ON c.event_id=e.event_id
      LEFT JOIN people f ON e.person_id = f.person_id
    WHERE TRIM(a.st_num) <> ''
      AND TRIM(a.st_name) <> ''
      AND lower(f.name) ~* ('.*(' || $1 || ').*')
      OR lower(a.st_name) ~* ('.*(' || $1 || ').*')";
  $params = [$querystring];
  $result = pg_query_params($conn, $sql, $params);

  if (!$result) {
    $content = "Error in SQL query: " . pg_last_error($conn);

    return $response->withHeader('Content-Type', 'text/html')
      ->withStatus(500)
      ->getBody()->write($content);
  }

  $rows = pg_num_rows($result);

  $data = [];
  while ($row = pg_fetch_assoc($result)) {
    $data[] = $row;
  }
  $content = json_encode($data);

  pg_close($conn);
  
  $response->getBody()->write($content);

  return $response
    ->withHeader('Content-Type', 'application/json')
    ->withStatus(200);
});