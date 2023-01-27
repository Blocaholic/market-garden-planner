<?php
include_once("view.php");

function isValidUser() {
  return true;
}

function main() {
  
  session_start();
  $error = '';
  $target = $_GET['target'] ?? 'home';
  $_SESSION['isValidUser'] = $_SESSION['isValidUser'] ?? false;

  if($target == 'login') {
    $_SESSION['isValidUser'] = isValidUser();
    if(!$_SESSION['isValidUser']) {
      $error .= 'Fehler: Benutzername oder Passwort falsch!<br>';
    } else {
      $target = 'home';
    }
  }
  
  if($target == 'logout') {
    $_SESSION['isValidUser'] = false;
  }

  $user = [
    "isValid" => $_SESSION['isValidUser'],
  ];

  echo renderPage($target, $error, $user);
}
?>