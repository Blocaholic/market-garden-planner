<?php
include_once 'db.php';

function isValidUser() {
  return true;
}

function checkSignin() {
  $pdo = DB::connect();
  $query = 'SELECT * FROM user WHERE email = ? LIMIT 1;';
  $statement = $pdo->prepare($query);
  $statement->execute([$_POST['email']]);
  $row = $statement->fetch(PDO::FETCH_ASSOC);
  var_dump($row);
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

  $pdo = DB::connect();
  $query =
    'INSERT INTO user (name, email, password_hash) VALUES (:name, :email, :passwordHash)';
  $statement = $pdo->prepare($query);
  try {
    $statement->execute($data);
  } catch (PDOException $e) {
    die('Fehler beim Eintrag in die Datenbank:<br>' . $e->getMessage());
  }

  return true;
}

?>
