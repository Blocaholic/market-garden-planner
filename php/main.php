<?php
require_once 'view.php';
require_once 'User.php';

function main() {
  session_start();
  $error = '';
  $url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
  $request = trim($url, '/') ?: 'home';
  $_SESSION['isValidUser'] = $_SESSION['isValidUser'] ?? false;

  if ($request == 'checkSignup') {
    if (!checkSignup()) {
      $error = 'Fehler: Benutzer konnte nicht registriert werden!<br>';
      $request = 'signup';
    }
    $_SESSION['isValidUser'] = true;
    $request = 'signup-success';
  }

  if ($request == 'checkSignin') {
    // checkSignin();
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
