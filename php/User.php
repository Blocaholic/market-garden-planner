<?php
namespace User;

require_once 'DB.php';

function isValidUser() {
  return true;
}

function checkSignup() {
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

  $data = [];
  $data['name'] = $_POST['name'];
  $data['email'] = $_POST['email'];
  $data['passwordHash'] = password_hash($_POST['password'], PASSWORD_DEFAULT);

  $pdo = DB\connect();
  $query =
    'INSERT INTO user (name, email, password_hash) VALUES (:name, :email, :passwordHash)';
  $statement = $pdo->prepare($query);
  $statement->execute($data);

  return true;
}
