<?php
include_once 'view.php';

function isValidUser() {
  return true;
}

function main() {
  session_start();
  $error = '';
  $url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
  $request = trim($url, '/') ?: 'home';
  $_SESSION['isValidUser'] = $_SESSION['isValidUser'] ?? false;

  if ($request == 'checkSignup') {
    print_r($_POST);
  }

  if ($request == 'login') {
    $_SESSION['isValidUser'] = isValidUser();
    if (!$_SESSION['isValidUser']) {
      $error .= 'Fehler: Benutzername oder Passwort falsch!<br>';
    } else {
      $request = 'home';
    }
  }

  if ($request == 'logout') {
    $_SESSION['isValidUser'] = false;
  }

  $user = [
    'isValid' => $_SESSION['isValidUser'],
  ];

  echo renderPage($request, $error, $user);
}
?>
