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
    if (empty($_POST['name'])) {
      die('Es muss ein Benutzername angegeben werden!');
    }

    if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
      die('Es muss eine g&uuml;ltige E-Mail-Adresse angegeben werden!');
    }

    if (strlen($_POST['password']) < 8) {
      die('Das Passwort muss mindestens 8 Zeichen lang sein!');
    }

    if (!preg_match('/[a-z]/i', $_POST['password'])) {
      die('Das Passwort muss mindestens einen Buchstaben enthalten!');
    }

    if (!preg_match('/[0-9]/', $_POST['password'])) {
      die('Das Passwort muss mindestens eine Ziffer enthalten!');
    }

    if ($_POST['password'] !== $_POST['password2']) {
      die('Die Passw&ouml;rter stimmen nicht überein!');
    }

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
