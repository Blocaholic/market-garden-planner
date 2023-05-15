<?php
class DB {
  public static function connect() {
    try {
      $host = 'localhost';
      $user = $name = 'd03d085f';
      $password = 'UoPJGmS2xWMWDotY';

      $pdo = new PDO("mysql:dbname=$name;host=$host", $user, $password);
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      return $pdo;
    } catch (PDOException $e) {
      throw new Exception(
        'Verbindung zur Datenbank fehlgeschlagen!',
        $e->getCode(),
        $e
      );
    }
  }
}

?>
