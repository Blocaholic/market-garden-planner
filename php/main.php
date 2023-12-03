<?php
require_once 'view.php';

function main() {
  session_start();
  $error = '';
  $url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
  $request = trim($url, '/') ?: 'home';

  $_SESSION['isValidUser'] = $_SESSION['isValidUser'] ?? false;

  if ($request == 'login') {
    $_SESSION['isValidUser'] = true;
    $request = 'home';
  }

  if ($request == 'logout') {
    $_SESSION['isValidUser'] = false;
    session_destroy();
    $request = 'signin';
  }

  $user = [
    'isValid' => $_SESSION['isValidUser'],
  ];

  echo renderPage($request, $error, $user);
}
