<?php

$app->redirect('/', '/map', 303);

$app->get('/map', function ($request, $response, $args) {
  return $this->get('view')->render($response, 'map.html');
});