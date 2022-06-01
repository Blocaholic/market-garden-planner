<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $inputJson = file_get_contents('php://input');
  file_put_contents('./boxes.json', $inputJson);
}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
  $file = './boxes.json';
  $content = file_get_contents($file);
  echo $content;
}
?>